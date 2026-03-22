import pytest
from fastapi.testclient import TestClient
import uuid

# FONTOS: Importáljuk az app-ot ÉS a fake_db-t a main.py-ból
# (Ellenőrizd, hogy a main.py-ban a 'fake_db' változó globális szinten van, ahogy az előző kódban küldtem)
from app.main import app, fake_db 

@pytest.fixture
def client():
    return TestClient(app)

# EZT A RÉSZT ADD HOZZÁ:
@pytest.fixture(autouse=True)
def clear_db():
    """
    Ez a fixture minden egyes teszt előtt automatikusan lefut (autouse=True).
    A feladata, hogy kiürítse a memóriában lévő adatbázist.
    """
    fake_db["logs"] = []  # Kiürítjük a listát, hogy minden teszt üres állapottal induljon
    yield

@pytest.fixture
def auth_user(client):
    unique_email = f"test_{uuid.uuid4()}@example.com"
    password = "password123"
    
    # Mivel a fake_db most már törlődik, itt nem lesz ütközés, 
    # de a biztonság kedvéért jó, ha a regisztráció logikája is "fake".
    # A main.py-ban lévő /api/register és /api/login endpointok már kezelik ezt.
    
    client.post("/api/register", json={"email": unique_email, "password": password})
    response = client.post("/api/login", json={"email": unique_email, "password": password})
    
    token = response.json().get("access_token")
    client.headers.update({"Authorization": f"Bearer {token}"})
    
    return client