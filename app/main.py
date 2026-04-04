from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String, DateTime, Boolean, Date, Float, ForeignKey
from sqlalchemy.orm import declarative_base, sessionmaker, Session, relationship
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
    
    # ÚJ: Név szétbontva
    first_name = Column(String)
    last_name = Column(String)
    
    role = Column(String, default="COACH")
    coach_id = Column(Integer, nullable=True)
    specialization = Column(String, nullable=True)
    weekly_plan = Column(String, default="{}")
    coach_notes = Column(String, default="") 
    
    # ÚJ: Profil adatok (Klienseknek és Edzőknek is lehet, de főleg Kliens fókuszú)
    height = Column(Integer, nullable=True)
    current_weight = Column(Float, nullable=True)
    goal_weight = Column(Float, nullable=True)
    primary_goal = Column(String, nullable=True)
    diet_allergies = Column(String, nullable=True)
    
    # Gamifikáció oszlopok a kliensnek
    total_boosts = Column(Integer, default=0)
    has_unseen_boost = Column(Boolean, default=False)

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
    workout_minutes = Column(Integer, default=0)
    mood = Column(String)
    notes = Column(String, nullable=True)
    workout_intensity = Column(Integer, default=0)
    steps = Column(Integer, nullable=True)
    weight = Column(Float, nullable=True)

class WeeklyPlan(Base):
    __tablename__ = "weekly_plans"
    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, index=True)
    week_start_date = Column(Date, index=True)
    plan_data = Column(String, default="{}")

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
    first_name: str
    last_name: str
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
    first_name: str
    last_name: str

class ProfileUpdate(BaseModel):
    first_name: str
    last_name: str
    height: int = None
    current_weight: float = None
    goal_weight: float = None
    primary_goal: str = None
    diet_allergies: str = None

class DailyLogCreate(BaseModel):
    client_id: int
    date: str 
    sleep_hours: int
    stress_level: int
    water_liters: float
    workout_minutes: int
    mood: str
    notes: str = None
    workout_intensity: int = 0
    steps: int = None
    weight: float = None

class PlanUpdate(BaseModel):
    week_start_date: str 
    plan_data: str 

class NoteUpdate(BaseModel): 
    coach_notes: str

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_monday(d: datetime.date) -> datetime.date:
    return d - timedelta(days=d.weekday())

# --- 4. Végpontok ---
@app.post("/api/register")
def register(user: UserRegister, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Ez az email már regisztrálva van!")
    hashed_pw = hashlib.sha256(user.password.encode()).hexdigest()
    
    new_user = User(
        email=user.email, password_hash=hashed_pw, 
        first_name=user.first_name, last_name=user.last_name, 
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
    
    current_plan = "{}"
    coach_name = None 

    if db_user.role == "CLIENT":
        monday = get_monday(datetime.now().date())
        plan = db.query(WeeklyPlan).filter(WeeklyPlan.client_id == db_user.id, WeeklyPlan.week_start_date == monday).first()
        if plan:
            current_plan = plan.plan_data
        
        if db_user.coach_id:
            coach = db.query(User).filter(User.id == db_user.coach_id).first()
            if coach:
                coach_name = f"{coach.last_name} {coach.first_name}"

    return {
        "message": "Sikeres belépés!", 
        "first_name": db_user.first_name, 
        "last_name": db_user.last_name, 
        "coach_id": db_user.coach_id, 
        "user_id": db_user.id,        
        "role": db_user.role, 
        "specialization": db_user.specialization,
        "weekly_plan": current_plan,
        "total_boosts": db_user.total_boosts,
        "has_unseen_boost": db_user.has_unseen_boost,
        "coach_name": coach_name,
        # Profil adatok visszaadása
        "height": db_user.height,
        "current_weight": db_user.current_weight,
        "goal_weight": db_user.goal_weight,
        "primary_goal": db_user.primary_goal,
        "diet_allergies": db_user.diet_allergies
    }

# ÚJ VÉGPONT: Profil frissítése
@app.put("/api/user/{user_id}/profile")
def update_profile(user_id: int, profile: ProfileUpdate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Felhasználó nem található")
    
    user.first_name = profile.first_name
    user.last_name = profile.last_name
    user.height = profile.height
    user.current_weight = profile.current_weight
    user.goal_weight = profile.goal_weight
    user.primary_goal = profile.primary_goal
    user.diet_allergies = profile.diet_allergies
    
    db.commit()
    return {"message": "Profil sikeresen frissítve!"}

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
    return {"valid": True, "coach_name": f"{coach.last_name} {coach.first_name}", "prefilled_email": invite.client_email}

@app.post("/api/register-client")
def register_client(req: ClientRegister, db: Session = Depends(get_db)):
    invite = db.query(Invite).filter(Invite.token == req.token, Invite.used == False).first()
    if not invite or invite.expires_at < datetime.now():
        raise HTTPException(status_code=400, detail="Érvénytelen vagy lejárt meghívó!")
        
    if db.query(User).filter(User.email == req.email).first():
        raise HTTPException(status_code=400, detail="Ez az email már regisztrálva van!")

    hashed_pw = hashlib.sha256(req.password.encode()).hexdigest()
    new_client = User(
        email=req.email, password_hash=hashed_pw, 
        first_name=req.first_name, last_name=req.last_name, 
        role="CLIENT", coach_id=invite.coach_id 
    )
    invite.used = True 
    db.add(new_client)
    db.commit()
    return {"message": "Sikeres kliens regisztráció!"}

@app.get("/api/coach/{coach_id}/clients")
def get_coach_clients(coach_id: int, db: Session = Depends(get_db)):
    clients = db.query(User).filter(User.role == "CLIENT", User.coach_id == coach_id).all()
    
    result = []
    monday = get_monday(datetime.now().date())
    for c in clients:
        plan = db.query(WeeklyPlan).filter(WeeklyPlan.client_id == c.id, WeeklyPlan.week_start_date == monday).first()
        plan_data = plan.plan_data if plan else "{}"
        result.append({
            "id": c.id, 
            "first_name": c.first_name,
            "last_name": c.last_name,
            "email": c.email, 
            "weekly_plan": plan_data, "coach_notes": c.coach_notes,
            "total_boosts": c.total_boosts 
        })
        
    return result

@app.post("/api/client/log")
def create_daily_log(log: DailyLogCreate, db: Session = Depends(get_db)):
    try:
        log_date = datetime.strptime(log.date, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Hibás dátum formátum!")

    existing_log = db.query(DailyLog).filter(DailyLog.client_id == log.client_id, DailyLog.date == log_date).first()
    if existing_log:
        raise HTTPException(status_code=400, detail="Erre a napra már rögzítettél adatot!")

    new_log = DailyLog(
        client_id=log.client_id, date=log_date, sleep_hours=log.sleep_hours,
        stress_level=log.stress_level, water_liters=log.water_liters, 
        workout_minutes=log.workout_minutes, mood=log.mood, notes=log.notes,
        workout_intensity=log.workout_intensity,
        steps=log.steps,
        weight=log.weight
    )
    db.add(new_log)
    
    # Súly automatikus frissítése a profilon, ha naplózta
    if log.weight:
        client = db.query(User).filter(User.id == log.client_id).first()
        if client:
            client.current_weight = log.weight

    db.commit()
    return {"message": "Napi napló sikeresen elmentve!"}

@app.get("/api/client/{client_id}/logs")
def get_client_logs(client_id: int, db: Session = Depends(get_db)):
    logs = db.query(DailyLog).filter(DailyLog.client_id == client_id).order_by(DailyLog.date.desc()).all()
    return [
        {"id": l.id, "date": l.date.strftime("%Y-%m-%d"), "sleep_hours": l.sleep_hours, "stress_level": l.stress_level, "water_liters": l.water_liters, "workout_minutes": l.workout_minutes, "mood": l.mood, "notes": l.notes, "workout_intensity": l.workout_intensity,"steps": l.steps,"weight": l.weight}
        for l in logs
    ]

@app.get("/api/client/{client_id}/plans")
def get_client_plans(client_id: int, db: Session = Depends(get_db)):
    plans = db.query(WeeklyPlan).filter(WeeklyPlan.client_id == client_id).order_by(WeeklyPlan.week_start_date.desc()).all()
    return [{"week_start": p.week_start_date.strftime("%Y-%m-%d"), "plan_data": p.plan_data} for p in plans]

@app.put("/api/client/{client_id}/plan")
def update_client_plan(client_id: int, plan: PlanUpdate, db: Session = Depends(get_db)):
    try:
        week_start = datetime.strptime(plan.week_start_date, "%Y-%m-%d").date()
        if week_start.weekday() != 0:
            raise HTTPException(status_code=400, detail="A kezdő dátumnak hétfőnek kell lennie!")
    except ValueError:
        raise HTTPException(status_code=400, detail="Hibás dátum formátum!")

    existing_plan = db.query(WeeklyPlan).filter(WeeklyPlan.client_id == client_id, WeeklyPlan.week_start_date == week_start).first()
    
    if existing_plan:
        existing_plan.plan_data = plan.plan_data
    else:
        new_plan = WeeklyPlan(client_id=client_id, week_start_date=week_start, plan_data=plan.plan_data)
        db.add(new_plan)
        
    db.commit()
    return {"message": "Terv sikeresen frissítve!"}

@app.put("/api/client/{client_id}/notes")
def update_client_notes(client_id: int, note_data: NoteUpdate, db: Session = Depends(get_db)):
    client = db.query(User).filter(User.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Kliens nem található")
    client.coach_notes = note_data.coach_notes
    db.commit()
    return {"message": "Jegyzet sikeresen mentve!"}

@app.post("/api/client/{client_id}/boost")
def send_boost(client_id: int, db: Session = Depends(get_db)):
    client = db.query(User).filter(User.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Kliens nem található")
    
    client.total_boosts += 1
    client.has_unseen_boost = True
    db.commit()
    return {"message": "Boost elküldve!", "total_boosts": client.total_boosts}

@app.post("/api/client/{client_id}/clear-boost")
def clear_boost(client_id: int, db: Session = Depends(get_db)):
    client = db.query(User).filter(User.id == client_id).first()
    if client:
        client.has_unseen_boost = False
        db.commit()
    return {"message": "Boost láttamozva"}