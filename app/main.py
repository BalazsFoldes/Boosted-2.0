from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String, DateTime, Boolean, Date, Float, ForeignKey
from sqlalchemy.orm import declarative_base, sessionmaker, Session, relationship
import bcrypt
import secrets
import json
from datetime import datetime, timedelta
from typing import Optional
import google.generativeai as genai
from dotenv import load_dotenv
import os
import jwt
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

load_dotenv()

# --- 1. Adatbázis Beállítás (SQLite) ---
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./boosted.db")

# Ha SQLite-ot használunk, kell a check_same_thread paraméter
if "sqlite" in SQLALCHEMY_DATABASE_URL:
    engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
else:
    # Ha a felhőben vagyunk (PostgreSQL), ez a paraméter nem kell
    engine = create_engine(SQLALCHEMY_DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# --- 1.5 Gemini AI ---
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise RuntimeError("HIBA: Nincs beállítva a GEMINI_API_KEY a .env fájlban!")

genai.configure(api_key=GEMINI_API_KEY)


# --- Jelszótitkosítás beállítása (Tiszta Bcrypt) ---
def get_password_hash(password: str) -> str:
    # A bcrypt bájtokat vár, ezért utf-8-ra kódoljuk
    pwd_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(password=pwd_bytes, salt=salt)
    # Visszaalakítjuk stringgé, hogy az adatbázis el tudja menteni
    return hashed_password.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    password_bytes = plain_password.encode('utf-8')
    hashed_bytes = hashed_password.encode('utf-8')
    return bcrypt.checkpw(password=password_bytes, hashed_password=hashed_bytes)


# --- 2. Modellek ---
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    
    first_name = Column(String)
    last_name = Column(String)
    
    role = Column(String, default="COACH")
    coach_id = Column(Integer, nullable=True)
    specialization = Column(String, nullable=True)
    weekly_plan = Column(String, default="{}")
    coach_notes = Column(String, default="") 
    
    # Eredeti Profil adatok
    height = Column(Integer, nullable=True)
    current_weight = Column(Float, nullable=True)
    goal_weight = Column(Float, nullable=True)
    primary_goal = Column(String, nullable=True)
    diet_allergies = Column(String, nullable=True)
    
    # ÚJ: Bővített profil és identitás adatok
    join_date = Column(DateTime, default=datetime.utcnow) # Automatikus csatlakozási idő
    profile_picture_url = Column(String, nullable=True) # Profilkép linkje
    city = Column(String, nullable=True) # Város
    bio = Column(String, nullable=True) # Bemutatkozás
    experience_years = Column(String, nullable=True) # Tapasztalat évei
    motivation_quote = Column(String, nullable=True) # Jelige / Motiváció
    
    # Gamifikáció oszlopok a kliensnek
    total_boosts = Column(Integer, default=0)
    has_unseen_boost = Column(Boolean, default=False)

    average_rating = Column(Float, default=0.0)
    review_count = Column(Integer, default=0)

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
    # ÚJ: Nehézségi szint
    difficulty_level = Column(String, default="Közepes") 

class Review(Base):
    __tablename__ = "reviews"
    id = Column(Integer, primary_key=True, index=True)
    coach_id = Column(Integer, index=True)
    client_id = Column(Integer)
    rating = Column(Integer)
    review_text = Column(String, nullable=True)

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
    height: Optional[int] = None
    current_weight: Optional[float] = None
    goal_weight: Optional[float] = None
    primary_goal: Optional[str] = None
    diet_allergies: Optional[str] = None
    # ÚJ: Beküldhető opcionális mezők
    city: Optional[str] = None
    bio: Optional[str] = None
    experience_years: Optional[str] = None
    motivation_quote: Optional[str] = None
    profile_picture_url: Optional[str] = None

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
    # ÚJ: Beküldhető nehézségi szint
    difficulty_level: str = "Közepes"

class NoteUpdate(BaseModel): 
    coach_notes: str


class DisconnectRequest(BaseModel):
    client_id: int
    coach_id: int

class ReviewCreate(BaseModel):
    client_id: int
    rating: int
    review_text: str = ""

class ChatMessageItem(BaseModel):
    role: str # "user" vagy "assistant"
    content: str

class ChatRequest(BaseModel):
    messages: list[ChatMessageItem]
    user_type: str # "COACH" vagy "CLIENT", hogy az AI tudja, kivel beszél

class AIDashboardRequest(BaseModel):
    user_type: str
    context_data: str

class ClientAnalysisRequest(BaseModel):
    context_data: str

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_monday(d: datetime.date) -> datetime.date:
    return d - timedelta(days=d.weekday())

# --- JWT Authentikáció beállítása ---
SECRET_KEY = "boosted_super_secret_jwt_key_for_thesis_defense"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7 # 7 napig érvényes token

security = HTTPBearer()

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    
    # Létrehozzuk a tokent
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    
    # BIZTOSÍTÉK: Ha a Python verziód miatt 'bytes'-ot generálna, szöveggé alakítjuk!
    if isinstance(encoded_jwt, bytes):
        return encoded_jwt.decode('utf-8')
    return encoded_jwt

# Ezt a függvényt fogjuk rárakni a végpontokra "őrként"
def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        
        # BIZTOSÍTÉK: Kiolvassuk a 'sub'-ot és azonnal számmá alakítjuk
        user_id_str = payload.get("sub")
        if user_id_str is None:
            raise HTTPException(status_code=401, detail="Érvénytelen token (nincs user_id)")
        
        user_id = int(user_id_str)
        
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="A token lejárt! Kérlek lépj be újra.")
    except Exception as e:
        # Ha bármi más hiba van a tokenben, kiírjuk a konzolba, hogy lássuk mi az!
        print(f"JWT Hiba a visszafejtésnél: {e}")
        raise HTTPException(status_code=401, detail="Érvénytelen token!")
        
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=401, detail="A tokenhez tartozó felhasználó nem található.")
    return user

# --- 4. Végpontok ---
@app.post("/api/register")
def register(user: UserRegister, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Ez az email már regisztrálva van!")
    hashed_pw = get_password_hash(user.password)
    
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
    if not db_user or not verify_password(user.password, db_user.password_hash):
        raise HTTPException(status_code=400, detail="Hibás email vagy jelszó!")
    
    current_plan = "{}"
    coach_name = None
    coach_data = None

    if db_user.role == "CLIENT":
        monday = get_monday(datetime.now().date())
        plan = db.query(WeeklyPlan).filter(WeeklyPlan.client_id == db_user.id, WeeklyPlan.week_start_date == monday).first()
        if plan:
            current_plan = plan.plan_data
        
        if db_user.coach_id:
            coach = db.query(User).filter(User.id == db_user.coach_id).first()
            if coach:
                coach_name = f"{coach.last_name} {coach.first_name}"
                # ÚJ: Kinyerjük az edző publikus adatait
                coach_data = {
                    "id": coach.id,
                    "city": coach.city,
                    "bio": coach.bio,
                    "experience_years": coach.experience_years,
                    "motivation_quote": coach.motivation_quote,
                    "join_date": coach.join_date.strftime("%Y.%m.%d") if coach.join_date else None,
                    "profile_picture_url": coach.profile_picture_url,
                    "average_rating": coach.average_rating,
                    "review_count": coach.review_count
                }

    join_date_str = db_user.join_date.strftime("%Y.%m.%d") if db_user.join_date else None

    access_token = create_access_token(data={"sub": str(db_user.id), "role": db_user.role})

    return {
        "message": "Sikeres belépés!",
        "access_token": access_token,
        "token_type": "bearer",
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
        "coach_data": coach_data,
        "height": db_user.height,
        "current_weight": db_user.current_weight,
        "goal_weight": db_user.goal_weight,
        "primary_goal": db_user.primary_goal,
        "diet_allergies": db_user.diet_allergies,
        "join_date": join_date_str,
        "city": db_user.city,
        "bio": db_user.bio,
        "experience_years": db_user.experience_years,
        "motivation_quote": db_user.motivation_quote,
        "profile_picture_url": db_user.profile_picture_url,
        "average_rating": db_user.average_rating,
        "review_count": db_user.review_count
    }

# Profil frissítése (JAVÍTVA)
@app.put("/api/user/{user_id}/profile")
def update_profile(
    user_id: int, 
    profile: ProfileUpdate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)  # <--- EZ AZ ŐR! Itt kérjük el a JWT tokent!
):
    # Biztonsági ellenőrzés: Csak a saját profilját módosíthatja!
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Nincs jogosultságod ezt a profilt szerkeszteni!")
        
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
    
    # ÚJ MEZŐK MENTÉSE:
    if profile.city is not None: user.city = profile.city
    if profile.bio is not None: user.bio = profile.bio
    if profile.experience_years is not None: user.experience_years = profile.experience_years
    if profile.motivation_quote is not None: user.motivation_quote = profile.motivation_quote
    if profile.profile_picture_url is not None: user.profile_picture_url = profile.profile_picture_url
    
    db.commit()
    return {"message": "Profil sikeresen frissítve!"}

@app.post("/api/invite")
def create_invite(req: InviteRequest, db: Session = Depends(get_db)):
    token = secrets.token_urlsafe(32)
    expires = datetime.now() + timedelta(hours=24)
    new_invite = Invite(coach_id=req.coach_id, client_email=req.email, token=token, expires_at=expires)
    db.add(new_invite)
    db.commit()
    
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
    
    return {"message": "Link sikeresen generálva!", "link": f"{frontend_url}/register-client?token={token}"}

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

    hashed_pw = get_password_hash(req.password)
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
            "weekly_plan": plan_data, 
            "coach_notes": c.coach_notes,
            "total_boosts": c.total_boosts,
            "join_date": c.join_date.strftime("%Y.%m.%d") if c.join_date else None,
            "city": c.city,
            "profile_picture_url": c.profile_picture_url,
            "weekly_plan_difficulty": plan.difficulty_level if plan else "Közepes",
            "height": c.height,
            "current_weight": c.current_weight,
            "goal_weight": c.goal_weight,
            "primary_goal": c.primary_goal,
            "diet_allergies": c.diet_allergies
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
    # ÚJ: A nehézségi szintet is visszaadjuk a kliensnek
    return [{"week_start": p.week_start_date.strftime("%Y-%m-%d"), "plan_data": p.plan_data, "difficulty_level": p.difficulty_level} for p in plans]

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
        existing_plan.difficulty_level = plan.difficulty_level # JAVÍTÁS
    else:
        new_plan = WeeklyPlan(client_id=client_id, week_start_date=week_start, plan_data=plan.plan_data, difficulty_level=plan.difficulty_level)
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

# ==========================================
# ÚJ: DASHBOARD STATISZTIKÁK ÉS RIASZTÁSOK
# ==========================================
def calculate_streak(logs):
    if not logs: return 0
    unique_dates = sorted(list(set(l.date for l in logs)), reverse=True)
    streak = 0
    today = datetime.now().date()
    yesterday = today - timedelta(days=1)
    
    # Ha az utolsó naplózás régebbi, mint tegnap, megszakadt a széria
    if unique_dates[0] < yesterday:
        return 0
        
    target = unique_dates[0]
    for d in unique_dates:
        if d == target:
            streak += 1
            target = target - timedelta(days=1)
        else:
            break
    return streak

@app.get("/api/coach/{coach_id}/dashboard-stats")
def get_coach_dashboard_stats(coach_id: int, db: Session = Depends(get_db)):
    clients = db.query(User).filter(User.role == "CLIENT", User.coach_id == coach_id).all()
    client_ids = [c.id for c in clients]
    total_clients = len(clients)

    if total_clients == 0:
        return {
            "today_logs_count": 0, "total_clients": 0,
            "top_streak_client": "-", "top_streak_days": 0,
            "average_stress": 0.0, "alerts": []
        }

    today = datetime.now().date()
    seven_days_ago = today - timedelta(days=7)
    
    # Mai naplózások száma
    today_logs = db.query(DailyLog).filter(DailyLog.client_id.in_(client_ids), DailyLog.date == today).all()
    today_logs_count = len(set(l.client_id for l in today_logs))

    # Utolsó 7 nap naplói
    recent_logs = db.query(DailyLog).filter(DailyLog.client_id.in_(client_ids), DailyLog.date >= seven_days_ago).all()
    
    # Átlagos stressz
    avg_stress = 0.0
    if recent_logs:
        avg_stress = round(sum(l.stress_level for l in recent_logs) / len(recent_logs), 1)

    alerts = []
    top_client_name = "-"
    max_streak = 0

    for c in clients:
        # Kliens összes naplója a streak számoláshoz
        c_all_logs = db.query(DailyLog).filter(DailyLog.client_id == c.id).order_by(DailyLog.date.desc()).all()
        current_streak = calculate_streak(c_all_logs)
        
        if current_streak > max_streak:
            max_streak = current_streak
            top_client_name = f"{c.last_name} {c.first_name}"

        # Riasztások logikája
        c_recent_logs = [l for l in recent_logs if l.client_id == c.id]
        
        # 1. Több mint 3 napja nem naplózott
        if not c_recent_logs or (today - c_recent_logs[0].date).days >= 3:
            alerts.append({
                "type": "missing",
                "client_name": f"{c.last_name} {c.first_name}",
                "message": "Több mint 3 napja nem naplózott. Érdemes ráírni, hogy minden rendben van-e, elvesztette-e a motivációt."
            })
        
        # 2. Kritikus stressz (8 vagy felette)
        if c_recent_logs and c_recent_logs[0].stress_level >= 8:
            alerts.append({
                "type": "stress",
                "client_name": f"{c.last_name} {c.first_name}",
                "message": f"A stresszszintje kritikus ({c_recent_logs[0].stress_level}/10). Fokozottan ajánlott az edzésterv könnyítése."
            })

    # Riasztások rendezése és vágása (max 4, hogy ne árassza el a képernyőt)
    alerts = sorted(alerts, key=lambda x: x["type"])[:4]

    return {
        "today_logs_count": today_logs_count,
        "total_clients": total_clients,
        "top_streak_client": top_client_name,
        "top_streak_days": max_streak,
        "average_stress": avg_stress,
        "alerts": alerts
    }


# ==========================================
# ÚJ: ÁLTALÁNOS AI CHAT ASSZISZTENS (GEMINI)
# ==========================================
@app.post("/api/chat")
def chat_with_ai(req: ChatRequest):
    # 1. Személyiség (System Prompt) beállítása szerepkör alapján
    if req.user_type == "COACH":
        system_instruction = "Te egy szuperintelligens szakmai asszisztens vagy személyi edzők számára a Boosted platformon. Tegeződj. Segítesz edzésterveket írni, anatómiát elemezni, táplálkozási makrókat számolni és kliens-stratégiákat alkotni. Légy lényegretörő és szakmai."
    else:
        system_instruction = "Te egy motiváló AI edző és életmód tanácsadó vagy a Boosted platformon. Tegeződj. Segítesz a klienseknek a fitnesz céljaik elérésében, táplálkozási tippeket adsz és motiválod őket. Légy barátságos, empatikus, és adj gyakorlatias tippeket."

    try:
        # 2. Modell inicializálása a rendszer-utasítással
        model = genai.GenerativeModel(
            model_name="gemini-3.1-flash-lite-preview",
            system_instruction=system_instruction,
            generation_config={"response_mime_type": "application/json"}
        )

        # 3. Beszélgetési előzmények (history) formázása a Gemini számára
        # A frontend "assistant"-et küld, de a Gemini "model"-t használ.
        formatted_history = []
        
        # Ha van előzmény, az utolsó üzenet KIVÉTELÉVEL mindent a history-ba rakunk
        if len(req.messages) > 1:
            for msg in req.messages[:-1]:
                role = "model" if msg.role == "assistant" else "user"
                formatted_history.append({"role": role, "parts": [msg.content]})

        # Az utolsó üzenet az, amit most küldött a felhasználó
        last_user_message = req.messages[-1].content

        # 4. Chat indítása és üzenet küldése
        chat = model.start_chat(history=formatted_history)
        response = chat.send_message(last_user_message)
        
        return {"reply": response.text}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gemini AI Hiba: {str(e)}")
    

# ==========================================
# ÚJ: KAPCSOLAT MEGSZAKÍTÁSA ÉS ÉRTÉKELÉS
# ==========================================
@app.post("/api/disconnect")
def disconnect_users(req: DisconnectRequest, db: Session = Depends(get_db)):
    client = db.query(User).filter(User.id == req.client_id, User.role == "CLIENT").first()
    if not client or client.coach_id != req.coach_id:
        raise HTTPException(status_code=404, detail="Kapcsolat nem található.")
    
    # 1. Töröljük a klienshez tartozó naplókat és terveket, hogy ne szemeteljenek
    db.query(DailyLog).filter(DailyLog.client_id == client.id).delete()
    db.query(WeeklyPlan).filter(WeeklyPlan.client_id == client.id).delete()
    
    # 2. Véglegesen töröljük magát a kliens fiókot
    db.delete(client)
    db.commit()
    
    return {"message": "Kapcsolat megszakítva és a kliens fiók véglegesen törölve."}

@app.post("/api/coach/{coach_id}/review")
def submit_review(coach_id: int, review: ReviewCreate, db: Session = Depends(get_db)):
    coach = db.query(User).filter(User.id == coach_id, User.role == "COACH").first()
    if not coach:
        raise HTTPException(status_code=404, detail="Edző nem található.")
    
    # Értékelés mentése
    new_review = Review(coach_id=coach_id, client_id=review.client_id, rating=review.rating, review_text=review.review_text)
    db.add(new_review)
    db.commit() # Először mentjük, hogy benne legyen az adatbázisban
    
    # Edző átlagának újraszámolása
    all_reviews = db.query(Review).filter(Review.coach_id == coach_id).all()
    coach.review_count = len(all_reviews)
    if coach.review_count > 0:
        coach.average_rating = round(sum(r.rating for r in all_reviews) / coach.review_count, 1)
    
    db.commit()
    return {"message": "Értékelés sikeresen elmentve!"}

# ==========================================
# ÚJ: DINAMIKUS AI DASHBOARD GENERÁLÓ (GEMINI 2.5 FLASH)
# ==========================================
@app.post("/api/generate-ai-dashboard")
def generate_ai_dashboard(req: AIDashboardRequest):
    system_instruction = (
        "Te egy profi fitnesz adatelemző AI vagy a Boosted platformon. "
        "A válaszod KIZÁRÓLAG egy érvényes JSON objektum lehet, mindenféle markdown jelölés (pl. ```json) nélkül. "
        "A JSON struktúra pontosan a következő mezőkből álljon: "
        "card1_title, card1_text, card1_action, "
        "card2_title, card2_text, card2_action, "
        "card3_title, card3_text, card3_action, "
        "summary_title, summary_text. "
        "A szövegek magyar nyelvűek, lényegretörőek és szakmaiak legyenek."
    )
    
    role_desc = "edzőnek a klienseiről" if req.user_type == "COACH" else "kliensnek a saját fejlődéséről"
    prompt = f"Készíts elemzést egy {role_desc}. Itt vannak a valós adatok: {req.context_data}. "

    try:
        # A listádból a legújabb, villámgyors modellt használjuk!
        model = genai.GenerativeModel(
            model_name="gemini-3.1-flash-lite-preview",
            system_instruction=system_instruction,
            generation_config={"response_mime_type": "application/json"}
        )

        response = model.generate_content(prompt)
        
        # A kapott szöveget JSON-né alakítjuk és visszaküldjük a frontendnek
        return json.loads(response.text)
        
    except Exception as e:
        print(f"Hiba az AI generálás során: {str(e)}")
        raise HTTPException(status_code=500, detail="Az AI motor nem tudta feldolgozni az adatokat.")
    

@app.post("/api/generate-client-analysis")
def generate_client_analysis(req: ClientAnalysisRequest):
    system_instruction = (
        "Te egy profi fitnesz adatelemző és prediktív AI vagy a Boosted platformon. "
        "A válaszod KIZÁRÓLAG egy érvényes JSON objektum lehet, markdown nélkül. "
        "A JSON KÖTELEZŐ struktúrája pontosan a következő legyen: "
        "{\"summary_text\": \"...\", \"risk_status\": \"Kritikus, Figyelmeztetés vagy Stabil\", \"risk_desc\": \"...\", "
        "\"risk_action\": \"...\", \"goal_status\": \"Kiváló, Stagnál vagy Visszaesés\", \"goal_metric\": \"Rövid metrika, pl. -2kg vagy 5 nap\", "
        "\"goal_desc\": \"...\", \"goal_action\": \"...\", \"pattern1_icon\": \"Egyetlen emoji\", \"pattern1_title\": \"...\", "
        "\"pattern1_desc\": \"...\", \"pattern2_icon\": \"Egyetlen emoji\", \"pattern2_title\": \"...\", \"pattern2_desc\": \"...\"}. "
        "A szövegek magyar nyelvűek, lényegretörőek és professzionálisak legyenek."
    )
    
    try:
        model = genai.GenerativeModel(
            model_name="gemini-3.1-flash-lite-preview", 
            system_instruction=system_instruction,
            generation_config={"response_mime_type": "application/json"}
        )
        response = model.generate_content(req.context_data)
        return json.loads(response.text)
    except Exception as e:
        print(f"Hiba a Kliens AI generálás során: {str(e)}")
        raise HTTPException(status_code=500, detail="Az AI motor nem tudta feldolgozni a kliens adatokat.")