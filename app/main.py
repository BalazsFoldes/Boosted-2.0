from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.orm import declarative_base, sessionmaker, Session
import hashlib

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

# Táblák létrehozása
Base.metadata.create_all(bind=engine)

app = FastAPI()

# --- CORS beállítás ---
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

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- 4. Végpontok ---

@app.post("/api/register")
def register(user: UserRegister, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Ez az email már regisztrálva van!")

    hashed_pw = hashlib.sha256(user.password.encode()).hexdigest()

    new_user = User(
        email=user.email,
        password_hash=hashed_pw,
        full_name=user.full_name,
        role="COACH"
    )
    db.add(new_user)
    db.commit()

    return {"message": "Sikeres regisztráció!"}

@app.post("/api/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    # 1. Megkeressük a felhasználót email alapján
    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user:
        raise HTTPException(status_code=400, detail="Hibás email vagy jelszó!")

    # 2. Ellenőrizzük a titkosított jelszót
    hashed_pw = hashlib.sha256(user.password.encode()).hexdigest()
    if db_user.password_hash != hashed_pw:
        raise HTTPException(status_code=400, detail="Hibás email vagy jelszó!")

    # 3. Sikeres belépés esetén visszaadjuk a nevét
    return {"message": "Sikeres belépés!", "full_name": db_user.full_name}