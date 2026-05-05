# Modulok, interfészek és API specifikáció: Boosted

## 1. Modulfelelősségek (Szerveroldali rétegek)

Az üzleti logika a FastAPI backendben logikai modulokra (szolgáltatásokra) bomlik, amelyek a routing, a validáció és az adatbázis-műveletek felelősségét osztják meg.

| Modul | Felelősség | Publikus interfész (Belső függvények) | Függőségek | Tesztelési mód |
|---|---|---|---|---|
| **AuthService** | Felhasználók hitelesítése, JWT tokenek generálása, jelszavak sós (bcrypt) titkosítása és ellenőrzése. | `login()`, `register()`, `get_current_user()` | `bcrypt`, `PyJWT`, `SessionLocal` | Unit teszt (jelszó hash), Integrációs teszt (login endpoint). |
| **ClientLogService** | Napi biometrikus naplók (alvás, stressz, víz, edzés) rögzítése, duplikációk szűrése és visszamenőleges lekérdezése. | `create_daily_log()`, `get_client_logs()` | `SessionLocal`, `DailyLog` modell | Unit teszt (duplikáció kiszűrése), Integráció. |
| **CoachDashboardService** | Edzői portfólió adatok agregálása, aktív kliensek szériáinak (streak) számolása és riasztások generálása. | `get_coach_dashboard_stats()`, `calculate_streak()` | `SessionLocal`, `DailyLog` és `User` modellek | Integrációs teszt (adatbázis lekérdezések pontossága). |
| **AIEngineService** | Google Gemini API hívások kezelése, kontextus összeállítása és a strukturált JSON válaszok kikényszerítése. | `generate_ai_dashboard()`, `generate_client_analysis()` | `google.generativeai`, hálózati réteg | Mockolt unit teszt (külső API hívás szimulálása), Timeout teszt. |
| **GamificationService** | Motivációs "Boost" pontok tranzakcionális kezelése az edző és a kliens között. | `send_boost()`, `clear_boost()` | `SessionLocal`, `User` modell | Unit teszt (napi limit és számláló növelés). |

---

## 2. API végpont specifikáció (REST API)

A frontend (React) és a backend (FastAPI) közötti kommunikáció aszinkron HTTP kéréseken alapul. A végpontok JSON formátumban kommunikálnak.

| Végpont | Metódus | Auth | Request (DTO) | Response | Hibakódok | Kapcsolódó Köv. |
|---|:---:|:---:|---|---|---|---|
| `/api/login` | POST | Nincs | `UserLogin` (email, password) | `access_token` (JWT), Profiladatok | 400 (Hibás adat) | FK-01 |
| `/api/user/{id}/profile`| PUT | JWT | `ProfileUpdate` | 200 OK (Sikeres frissítés) | 401, 403, 404 | FK-03 |
| `/api/client/log` | POST | JWT | `DailyLogCreate` (alvás, stressz...) | 200 OK (Napló elmentve) | 400 (Duplikáció), 422 (Típushiba) | FK-03 |
| `/api/coach/{id}/stats` | GET | JWT | Path paraméter (`coach_id`) | Aggregált JSON (kliens szám, átlag stressz, riasztások) | 401, 404 | FK-04 |
| `/api/client/{id}/plan` | PUT | JWT | `PlanUpdate` (hét kezdete, json plan) | 200 OK (Terv frissítve) | 400 (Nem hétfő), 422 | FK-05 |
| `/api/generate-ai-dash` | POST | JWT | `AIDashboardRequest` (kontextus sztring) | Strukturált AI JSON (kártya adatok) | 500 (API Limit / AI Timeout) | FK-04 |
| `/api/disconnect` | POST | JWT | `DisconnectRequest` | 200 OK (Kapcsolat és adatok törölve) | 401, 404 | FK-07 |

---

## 3. Interfészek és Modulhatárok

A rendszer lazán csatolt (decoupled) architektúrájában az interfészek garantálják a típusbiztonságot. Ahelyett, hogy a frontend közvetlenül az adatbázis sémákhoz kötődne, a kommunikáció **Data Transfer Object (DTO)** rétegen keresztül zajlik.

**A Pydantic sémák szerepe (Backend Interfészek):**
A FastAPI a `pydantic` könyvtárat használja a beérkező adatok validálására. Például a `DailyLogCreate` osztály egy olyan interfész, amely garantálja, hogy a frontendről érkező `water_liters` mező kizárólag érvényes lebegőpontos szám (Float) lehessen, a `date` pedig érvényes dátum-sztring. Bármilyen eltérés esetén a modulhatár (API Gateway) automatikusan elutasítja a kérést (422 Unprocessable Entity), így az üzleti logika és az adatbázis védve marad a korrupt adatoktól.

**AI Interfész Szerződés (Prompt Engineering):**
A `AIEngineService` és a Google Gemini közötti modulhatáron a kimeneti interfészt a `response_mime_type: "application/json"` paraméter és a System Prompt szigorú szabályozása garantálja. A rendszer nem engedélyezi a szabad szöveges Markdown válaszokat, kizárólag a frontend által elvárt, előre definiált kulcsokkal rendelkező (pl. `summary_text`, `risk_status`) JSON objektumokat fogadja el.