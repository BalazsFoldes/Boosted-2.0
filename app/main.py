from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String, DateTime, Boolean
from sqlalchemy.orm import declarative_base, sessionmaker, Session
import hashlib
import secrets
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

class Invite(Base):
    __tablename__ = "invites"
    id = Column(Integer, primary_key=True, index=True)
    coach_id = Column(Integer, index=True)
    client_email = Column(String, nullable=True)
    token = Column(String, unique=True, index=True)
    expires_at = Column(DateTime)
    used = Column(Boolean, default=False)

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
    new_user = User(email=user.email, password_hash=hashed_pw, full_name=user.full_name, role="COACH")
    db.add(new_user)
    db.commit()
    return {"message": "Sikeres regisztráció!"}

@app.post("/api/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user or db_user.password_hash != hashlib.sha256(user.password.encode()).hexdigest():
        raise HTTPException(status_code=400, detail="Hibás email vagy jelszó!")
    return {"message": "Sikeres belépés!", "full_name": db_user.full_name, "coach_id": db_user.id, "role": db_user.role}

@app.post("/api/invite")
def create_invite(req: InviteRequest, db: Session = Depends(get_db)):
    token = secrets.token_urlsafe(32)
    expires = datetime.now() + timedelta(hours=24)
    new_invite = Invite(coach_id=req.coach_id, client_email=req.email, token=token, expires_at=expires)
    db.add(new_invite)
    db.commit()
    return {"message": "Link sikeresen generálva!", "link": f"http://localhost:3000/register-client?token={token}"}

# --- ÚJ: TOKEN ELLENŐRZÉSE ÉS EDZŐ NEVÉNEK LEKÉRÉSE ---
@app.get("/api/invite/{token}")
def check_invite(token: str, db: Session = Depends(get_db)):
    invite = db.query(Invite).filter(Invite.token == token, Invite.used == False).first()
    
    if not invite:
        raise HTTPException(status_code=404, detail="Ez a meghívó érvénytelen vagy már felhasználták!")
    if invite.expires_at < datetime.now():
        raise HTTPException(status_code=400, detail="Ez a meghívó lejárt (24 óra letelt)!")
        
    coach = db.query(User).filter(User.id == invite.coach_id).first()
    
    return {
        "valid": True, 
        "coach_name": coach.full_name, 
        "prefilled_email": invite.client_email
    }

# --- ÚJ: KLIENS REGISZTRÁCIÓJA TOKEN ALAPJÁN ---
@app.post("/api/register-client")
def register_client(req: ClientRegister, db: Session = Depends(get_db)):
    invite = db.query(Invite).filter(Invite.token == req.token, Invite.used == False).first()
    if not invite or invite.expires_at < datetime.now():
        raise HTTPException(status_code=400, detail="Érvénytelen vagy lejárt meghívó!")
        
    if db.query(User).filter(User.email == req.email).first():
        raise HTTPException(status_code=400, detail="Ez az email már regisztrálva van!")

    hashed_pw = hashlib.sha256(req.password.encode()).hexdigest()
    
    new_client = User(
        email=req.email, 
        password_hash=hashed_pw, 
        full_name=req.full_name, 
        role="CLIENT", 
        coach_id=invite.coach_id # Összekötjük az edzővel!
    )
    
    invite.used = True # Elégetjük a tokent, hogy ne lehessen újra használni
    
    db.add(new_client)
    db.commit()
    return {"message": "Sikeres kliens regisztráció!"}

# --- ÚJ: EDZŐ KLIENSEINEK LEKÉRÉSE ---
@app.get("/api/coach/{coach_id}/clients")
def get_coach_clients(coach_id: int, db: Session = Depends(get_db)):
    # Lekérjük az összes usert, aki CLIENT, és ehhez az edzőhöz tartozik
    clients = db.query(User).filter(User.role == "CLIENT", User.coach_id == coach_id).all()
    
    # Visszaadjuk egy formázott listában
    return [{"id": c.id, "full_name": c.full_name, "email": c.email} for c in clients]