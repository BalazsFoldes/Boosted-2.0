from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String, DateTime, Boolean, Date, Float
from sqlalchemy.orm import declarative_base, sessionmaker, Session
import hashlib
import secrets
import json
from datetime import datetime, timedelta

# --- 1. Adatbázis Beállítás (SQLite) ---
SQLALCHEMY_DATABASE_URL = "sqlite:///./boosted.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# --- 2. Modellek ---
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    full_name = Column(String)
    role = Column(String, default="COACH")
    coach_id = Column(Integer, nullable=True)
    specialization = Column(String, nullable=True)
    weekly_plan = Column(String, default="{}") # ÚJ: Eheti terv JSON formátumban

class Invite(Base):
    __tablename__ = "invites"
    id = Column(Integer, primary_key=True, index=True)
    coach_id = Column(Integer, index=True)
    client_email = Column(String, nullable=True)
    token = Column(String, unique=True, index=True)
    expires_at = Column(DateTime)
    used = Column(Boolean, default=False)

class DailyLog(Base):
    __tablename__ = "daily_logs"
    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, index=True)
    date = Column(Date, index=True)
    sleep_hours = Column(Integer)
    stress_level = Column(Integer)
    water_liters = Column(Float)
    workout_minutes = Column(Integer, default=0) # ÚJ: Edzés hossza percben
    mood = Column(String)
    notes = Column(String, nullable=True)

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 3. Pydantic Schemák ---
class UserRegister(BaseModel):
    email: str
    password: str
    full_name: str
    specialization: str = "Személyi Edző" 

class UserLogin(BaseModel):
    email: str
    password: str

class InviteRequest(BaseModel):
    coach_id: int
    email: str = None

class ClientRegister(BaseModel):
    token: str
    email: str
    password: str
    full_name: str

class DailyLogCreate(BaseModel):
    client_id: int
    date: str 
    sleep_hours: int
    stress_level: int
    water_liters: float
    workout_minutes: int # ÚJ
    mood: str
    notes: str = None

class PlanUpdate(BaseModel): # ÚJ
    weekly_plan: str

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- 4. Végpontok ---
@app.post("/api/register")
def register(user: UserRegister, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Ez az email már regisztrálva van!")
    hashed_pw = hashlib.sha256(user.password.encode()).hexdigest()
    
    new_user = User(
        email=user.email, password_hash=hashed_pw, full_name=user.full_name, 
        role="COACH", specialization=user.specialization 
    )
    db.add(new_user)
    db.commit()
    return {"message": "Sikeres regisztráció!"}

@app.post("/api/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user or db_user.password_hash != hashlib.sha256(user.password.encode()).hexdigest():
        raise HTTPException(status_code=400, detail="Hibás email vagy jelszó!")
    
    return {
        "message": "Sikeres belépés!", "full_name": db_user.full_name, 
        "coach_id": db_user.coach_id, "user_id": db_user.id,        
        "role": db_user.role, "specialization": db_user.specialization,
        "weekly_plan": db_user.weekly_plan # ÚJ: Visszaküldjük az eheti tervet is
    }

@app.post("/api/invite")
def create_invite(req: InviteRequest, db: Session = Depends(get_db)):
    token = secrets.token_urlsafe(32)
    expires = datetime.now() + timedelta(hours=24)
    new_invite = Invite(coach_id=req.coach_id, client_email=req.email, token=token, expires_at=expires)
    db.add(new_invite)
    db.commit()
    return {"message": "Link sikeresen generálva!", "link": f"http://localhost:3000/register-client?token={token}"}

@app.get("/api/invite/{token}")
def check_invite(token: str, db: Session = Depends(get_db)):
    invite = db.query(Invite).filter(Invite.token == token, Invite.used == False).first()
    if not invite or invite.expires_at < datetime.now():
        raise HTTPException(status_code=404, detail="Ez a meghívó érvénytelen vagy már felhasználták!")
        
    coach = db.query(User).filter(User.id == invite.coach_id).first()
    return {"valid": True, "coach_name": coach.full_name, "prefilled_email": invite.client_email}

@app.post("/api/register-client")
def register_client(req: ClientRegister, db: Session = Depends(get_db)):
    invite = db.query(Invite).filter(Invite.token == req.token, Invite.used == False).first()
    if not invite or invite.expires_at < datetime.now():
        raise HTTPException(status_code=400, detail="Érvénytelen vagy lejárt meghívó!")
        
    if db.query(User).filter(User.email == req.email).first():
        raise HTTPException(status_code=400, detail="Ez az email már regisztrálva van!")

    hashed_pw = hashlib.sha256(req.password.encode()).hexdigest()
    new_client = User(
        email=req.email, password_hash=hashed_pw, full_name=req.full_name, 
        role="CLIENT", coach_id=invite.coach_id 
    )
    invite.used = True 
    db.add(new_client)
    db.commit()
    return {"message": "Sikeres kliens regisztráció!"}

@app.get("/api/coach/{coach_id}/clients")
def get_coach_clients(coach_id: int, db: Session = Depends(get_db)):
    clients = db.query(User).filter(User.role == "CLIENT", User.coach_id == coach_id).all()
    # ÚJ: Itt is küldjük a heti tervet az edzőnek
    return [{"id": c.id, "full_name": c.full_name, "email": c.email, "weekly_plan": c.weekly_plan} for c in clients]

@app.post("/api/client/log")
def create_daily_log(log: DailyLogCreate, db: Session = Depends(get_db)):
    try:
        log_date = datetime.strptime(log.date, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Hibás dátum formátum! Használd a YYYY-MM-DD formátumot.")

    existing_log = db.query(DailyLog).filter(DailyLog.client_id == log.client_id, DailyLog.date == log_date).first()
    if existing_log:
        raise HTTPException(status_code=400, detail="Erre a napra már rögzítettél adatot!")

    new_log = DailyLog(
        client_id=log.client_id, date=log_date, sleep_hours=log.sleep_hours,
        stress_level=log.stress_level, water_liters=log.water_liters, 
        workout_minutes=log.workout_minutes, mood=log.mood, notes=log.notes # ÚJ: workout_minutes mentése
    )
    db.add(new_log)
    db.commit()
    return {"message": "Napi napló sikeresen elmentve!"}

@app.get("/api/client/{client_id}/logs")
def get_client_logs(client_id: int, db: Session = Depends(get_db)):
    logs = db.query(DailyLog).filter(DailyLog.client_id == client_id).order_by(DailyLog.date.desc()).all()
    return [
        {"id": l.id, "date": l.date.strftime("%Y-%m-%d"), "sleep_hours": l.sleep_hours, "stress_level": l.stress_level, "water_liters": l.water_liters, "workout_minutes": l.workout_minutes, "mood": l.mood, "notes": l.notes}
        for l in logs
    ]

# ÚJ VÉGPONT: Kliens eheti tervének frissítése
@app.put("/api/client/{client_id}/plan")
def update_client_plan(client_id: int, plan: PlanUpdate, db: Session = Depends(get_db)):
    client = db.query(User).filter(User.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Kliens nem található")
    client.weekly_plan = plan.weekly_plan
    db.commit()
    return {"message": "Terv sikeresen frissítve!"}