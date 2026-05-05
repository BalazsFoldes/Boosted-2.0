# Developer Guide (Fejlesztői Útmutató)

## 1. Bevezetés
Ez a dokumentum a **Boosted 2.0** alkalmazás forráskódjának felépítését, az alkalmazott technológiákat és a fejlesztői környezet részleteit mutatja be. Célja, hogy egy új fejlesztő gyorsan átlássa az architektúrát és a modulok közötti kapcsolatokat.

## 2. Projektstruktúra

A projekt szétválasztott (decoupled) architektúrára épül, elkülönítve a klienst és a szervert:

*   **`backend/`**: A FastAPI alapú Python szerver.
    *   `main.py`: Az API végpontok (routers) és az alkalmazás belépési pontja.
    *   `models.py` / `schemas.py`: Az SQLAlchemy adatbázis modellek és a Pydantic adatvalidációs sémák.
    *   `auth.py`: A JWT tokenek generálását és a jelszavak (bcrypt) kezelését végző modul.
    *   `ai_engine.py` (vagy hasonló): A Google Gemini API-val kommunikáló integrációs réteg.
    *   `tests/`: A pytest keretrendszerre épülő automatizált egység- és integrációs tesztek.
*   **`frontend/`**: A React (vagy Next.js) keretrendszerre épülő Single Page Application (SPA).
    *   `src/components/`: Újrahasználható UI elemek (gombok, kártyák, modalok).
    *   `src/pages/`: A fő képernyők (Login, CoachDashboard, ClientDashboard).
*   **`docs/`**: A szoftvermérnöki dokumentáció (ADR, Traceability, UML ábrák).

## 3. Technikai specifikációk és Modulok

### Backend (FastAPI & SQLAlchemy)
*   **Adatkezelés (ORM):** A rendszer az SQLite adatbázissal kommunikál SQLAlchemy ORM-en keresztül. Az MVP fázis után ez a `.env` fájlban lévő `DATABASE_URL` módosításával könnyen átállítható PostgreSQL-re.
*   **Jogosultság-kezelés:** Minden védett végpont a `Depends(get_current_user)` middleware-t használja, amely ellenőrzi a HTTP Bearer token érvényességét, és visszaadja az azonosított User objektumot, biztosítva a szerepkör-alapú hozzáférést (IDOR védelem).
*   **AI Integráció:** A prediktív dashboard adatokat a Google Generative AI SDK (`google.generativeai`) állítja elő. A `response_mime_type="application/json"` paraméter biztosítja, hogy az LLM szigorúan strukturált adatot adjon vissza a frontend kártyáinak rendereléséhez.

### Frontend (React SPA)
*   **Állapotkezelés:** React Hookok (`useState`, `useEffect`) felelnek az UI reaktivitásáért.
*   **API Kommunikáció:** A frontend aszinkron `fetch` hívásokkal (vagy Axios-szal) kommunikál a backenddel, a JWT tokent minden kérés `Authorization: Bearer <token>` fejlécében elküldve.
*   **Biztonság:** A React automatikusan escape-eli a dinamikus tartalmakat, így a Cross-Site Scripting (XSS) sebezhetőségek kockázata minimális.

## 4. Tesztelés és Futtatás
A fejlesztői minőségbiztosítás alapja az automatizált tesztelés. 
*   A backend logikát a `pytest` modul ellenőrzi. A `tests/test_main.py` fájlban lévő tesztesetek egy izolált in-memory (vagy dedikált fájl alapú, pl. `test_boosted.db`) adatbázist használnak, így a tesztek futtatása nem korrumpálja a valós fejlesztői adatokat.
*   A titkos kulcsokat (JWT Secret, Gemini API Key) szigorúan a `.env` fájl tárolja, amely a `.gitignore` listán szerepel. Új környezet beállításakor a `.env.example` fájlt kell alapul venni.