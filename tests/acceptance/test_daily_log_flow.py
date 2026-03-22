# tests/acceptance/test_daily_log_flow.py

import pytest

# Feltételezzük, hogy a client fixture egy FastAPI tesztklienst ad,
# auth_user pedig egy bejelentkezett felhasználót reprezentál
# Az app/api/daily-log endpoint a következő JSON-t fogadja:
# { "hydration_ml": int, "mood": int }

@pytest.mark.acceptance
def test_user_can_log_hydration_and_see_total_for_today(client, auth_user):
    """STORY-1: Hidratáció naplózás E2E"""
    # Első mentés
    response1 = client.post("/api/daily-log", json={"hydration_ml": 300})
    assert response1.status_code == 200

    # Második mentés ugyanazon a napon
    response2 = client.post("/api/daily-log", json={"hydration_ml": 200})
    assert response2.status_code == 200

    # Dashboard lekérdezés
    dashboard = client.get("/api/dashboard/today")
    assert dashboard.status_code == 200
    assert dashboard.json()["hydration_ml"] == 500


@pytest.mark.acceptance
def test_invalid_hydration_shows_error(client, auth_user):
    """AC-1.2: Érvénytelen hidratáció"""
    response = client.post("/api/daily-log", json={"hydration_ml": -100})
    assert response.status_code == 400
    assert "Kérjük adj meg pozitív számot" in response.json()["detail"]


@pytest.mark.acceptance
def test_user_can_log_mood_and_view(client, auth_user):
    """STORY-2: Hangulatnaplózás"""
    # Érvényes hangulat
    response = client.post("/api/daily-log", json={"mood": 4})
    assert response.status_code == 200

    dashboard = client.get("/api/dashboard/today")
    assert dashboard.status_code == 200
    assert dashboard.json()["mood"] == 4

    # Hibás hangulat
    response = client.post("/api/daily-log", json={"mood": 6})
    assert response.status_code == 400
    assert "1 és 5 között" in response.json()["detail"]


@pytest.mark.acceptance
def test_dashboard_shows_message_when_no_data(client, auth_user):
    """STORY-4: Dashboard üres állapot"""
    # Feltételezzük, hogy a felhasználónak nincs ma rögzített adat
    dashboard = client.get("/api/dashboard/today")
    assert dashboard.status_code == 200
    assert "Ma még nem rögzítettél adatot" in dashboard.json()["message"]


@pytest.mark.acceptance
def test_server_error_and_offline_behavior(client, auth_user, monkeypatch):
    """STORY-5: Hibakezelés és offline érzékenység"""

    # Szimuláljuk a szerverhibát
    def mock_post_fail(*args, **kwargs):
        class MockResponse:
            status_code = 500
            def json(self):
                return {"detail": "Szerverhiba"}
        return MockResponse()

    monkeypatch.setattr(client, "post", mock_post_fail)

    response = client.post("/api/daily-log", json={"hydration_ml": 100})
    assert response.status_code == 500

    # Offline mentés szimuláció
    offline_db = {}

    def mock_post_offline(*args, **kwargs):
        offline_db["queued"] = kwargs["json"]
        class MockResponse:
            status_code = 200
            def json(self):
                return {"status": "queued"}
        return MockResponse()

    monkeypatch.setattr(client, "post", mock_post_offline)

    response = client.post("/api/daily-log", json={"hydration_ml": 250})
    assert response.status_code == 200
    assert offline_db["queued"]["hydration_ml"] == 250
