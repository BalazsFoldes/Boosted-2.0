from fastapi.testclient import TestClient
from main import app  # Importáljuk a te FastAPI alkalmazásodat

# Létrehozunk egy virtuális klienst, ami képes kéréseket küldeni az appodnak
client = TestClient(app)

def test_get_nonexistent_route():
    """1. TESZT: Általános 404-es hibakezelés egy nem létező végponton."""
    response = client.get("/api/valami_nem_letezo_vegpont")
    assert response.status_code == 404

def test_register_missing_fields():
    """2. TESZT: Pydantic adatvalidáció tesztelése. Ha hiányosak az adatok, 422-es hibát kell kapnunk."""
    # Direkt csak emailt küldünk, jelszót és neveket nem!
    response = client.post("/api/register", json={
        "email": "hianyos@email.com"
    })
    # 422 Unprocessable Entity - ez a FastAPI hivatalos kódja a validációs hibára
    assert response.status_code == 422 

def test_login_wrong_credentials():
    """3. TESZT: Hibás bejelentkezési adatok tesztelése (400-as hiba)."""
    response = client.post("/api/login", json={
        "email": "senki@email.com", 
        "password": "nagyonrosszjelszo"
    })
    assert response.status_code == 400
    assert response.json() == {"detail": "Hibás email vagy jelszó!"}

def test_protected_profile_route_without_token():
    """4. TESZT: Biztonság (JWT Auth) tesztelése. Token nélkül nem lehet profilt módosítani."""
    payload = {
        "first_name": "Hacker",
        "last_name": "Pista",
        "height": 180,
        "current_weight": 80,
        "goal_weight": 75,
        "primary_goal": "Feltörés",
        "diet_allergies": "Nincs"
    }
    
    # Szándékosan NE küldjünk "Authorization" headert a kérésben!
    response = client.put("/api/user/1/profile", json=payload)
    
    # A HTTPBearer 403 Forbidden hibát dob, ha nincs karszalag (token)
    assert response.status_code == 401

def test_invalid_invite_token():
    """5. TESZT: Lejárt vagy hamisított edzői meghívó token ellenőrzése."""
    response = client.get("/api/invite/ez_egy_hamis_token_12345")
    assert response.status_code == 404
    assert response.json() == {"detail": "Ez a meghívó érvénytelen vagy már felhasználták!"}

def test_create_daily_log_invalid_date():
    """6. TESZT: Egyéni dátum validáció tesztelése a napi naplónál."""
    payload = {
        "client_id": 1,
        "date": "2026.04.15",  # Direkt rossz formátum (YYYY-MM-DD kellene!)
        "sleep_hours": 8,
        "stress_level": 5,
        "water_liters": 2.0,
        "workout_minutes": 60,
        "mood": "Jó"
    }
    response = client.post("/api/client/log", json=payload)
    
    assert response.status_code == 400
    assert response.json() == {"detail": "Hibás dátum formátum!"}

def test_update_plan_not_monday():
    """7. TESZT: Üzleti logika tesztelése - A heti terv kezdőnapja csak hétfő lehet."""
    payload = {
        "week_start_date": "2026-04-15", # Ez egy szerdai nap a naptárban
        "plan_data": "{}",
        "difficulty_level": "Közepes"
    }
    response = client.put("/api/client/1/plan", json=payload)
    
    assert response.status_code == 400
    assert response.json() == {"detail": "A kezdő dátumnak hétfőnek kell lennie!"}