from fastapi import FastAPI, HTTPException, Header, Depends
from pydantic import BaseModel
from typing import Optional, Dict
from datetime import datetime

app = FastAPI()

# --- 1. Adatmodellek ---
class UserLogin(BaseModel):
    email: str
    password: str

class UserRegister(BaseModel):
    email: str
    password: str
    full_name: str
    gender: str

class DailyLog(BaseModel):
    hydration_ml: Optional[int] = None
    mood: Optional[int] = None

class XpReward(BaseModel):
    amount: int

class UserUpdate(BaseModel):
    full_name: str
    height: int
    weight: int

# in memory adatbázis
fake_db = {
    "users": {}, 
    "logs": {}
}

# --- User azonosítása ---
def get_current_user(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Nincs bejelentkezve")
    
    token = authorization.replace("Bearer ", "")
    
    if token not in fake_db["users"]:
        raise HTTPException(status_code=401, detail="Érvénytelen felhasználó")
    
    return token

# --- 3. API Végpontok ---

@app.post("/api/register")
def register(user: UserRegister):
    if user.email in fake_db["users"]:
        raise HTTPException(status_code=400, detail="Ez az email már regisztrálva van!")
    
    fake_db["users"][user.email] = {
        "password": user.password,
        "full_name": user.full_name,
        "gender": user.gender,
        "xp": 0,
        "height": 175,
        "weight": 75
    }
    fake_db["logs"][user.email] = []
    
    return {"message": "Sikeres regisztráció!"}

@app.post("/api/login")
def login(user: UserLogin):
    user_data = fake_db["users"].get(user.email)
    
    if not user_data or user_data["password"] != user.password:
        raise HTTPException(status_code=400, detail="Hibás email vagy jelszó")
    
    return {
        "access_token": user.email, 
        "token_type": "bearer",
        "full_name": user_data["full_name"] 
    }

@app.put("/api/profile")
def update_profile(data: UserUpdate, current_user: str = Depends(get_current_user)):
    user_data = fake_db["users"][current_user]
    
    # adatok frissítése
    user_data["full_name"] = data.full_name
    user_data["height"] = data.height
    user_data["weight"] = data.weight
    
    return {"status": "success", "message": "Profil frissítve"}

@app.post("/api/daily-log")
def create_daily_log(log: DailyLog, current_user: str = Depends(get_current_user)):
    user_logs = fake_db["logs"][current_user]
    user_data = fake_db["users"][current_user]
    
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M")
    earned_xp = 0

    if log.hydration_ml is not None:
        if log.hydration_ml < 0:
            raise HTTPException(status_code=400, detail="Kérjük adj meg pozitív számot")
        user_logs.append({"type": "hydration", "value": log.hydration_ml, "timestamp": now_str})
        earned_xp += 2 # +2 XP vízért

    if log.mood is not None:
        if log.mood < 1 or log.mood > 5:
            raise HTTPException(status_code=400, detail="A hangulatnak 1 és 5 között kell lennie")
        user_logs.append({"type": "mood", "value": log.mood, "timestamp": now_str})
        earned_xp += 2 # +2 XP hangulatért
        
    # XP Mentése a userhez
    if "xp" not in user_data: 
        user_data["xp"] = 0
    user_data["xp"] += earned_xp

    return {"status": "success", "earned_xp": earned_xp}

@app.get("/api/dashboard/today")
def get_dashboard(current_user: str = Depends(get_current_user)):
    user_logs = fake_db["logs"][current_user]
    user_data = fake_db["users"][current_user]
    
    hydration_logs = [item["value"] for item in user_logs if item["type"] == "hydration"]
    mood_logs = [item["value"] for item in user_logs if item["type"] == "mood"]
    
    total_hydration = sum(hydration_logs)
    last_mood = mood_logs[-1] if mood_logs else None

    history = list(reversed(user_logs))

    # --- XP ÉS SZINT SZÁMÍTÁS ---
    current_xp = user_data.get("xp", 0)
    
    # Szint számítás: 50 pontonként szintlépés. 
    # 0-49 XP = 1. szint, 50-99 XP = 2. szint, stb.
    level = (current_xp // 50) + 1
    
    # Következő szinthez mennyi kell?
    next_level_xp = level * 50
    progress_in_level = current_xp % 50 # Mennyi van meg a jelenlegi 50-ből

    return {
        "hydration_ml": total_hydration,
        "mood": last_mood,
        "user_name": user_data["full_name"],
        "history": history,
        "xp": current_xp,
        "level": level,
        "progress_xp": progress_in_level,
        "height": user_data.get("height", 175),
        "weight": user_data.get("weight", 75),
        "gender": user_data.get("gender", "Egyéb")
    }

@app.post("/api/claim-xp")
def claim_xp(reward: XpReward, current_user: str = Depends(get_current_user)):
    user_data = fake_db["users"][current_user]
    
    # hozzáadjuk a kapott XP-t
    if "xp" not in user_data:
        user_data["xp"] = 0
    user_data["xp"] += reward.amount
    
    return {"status": "success", "new_total_xp": user_data["xp"]}