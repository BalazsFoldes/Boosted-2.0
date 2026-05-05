# Architektúra rövid összefoglaló

A Boosted platform egy modern, szétválasztott (decoupled) architektúrára épül, amely egy kliensoldali Single Page Application (SPA) és egy szerveroldali RESTful API kommunikációjából áll, integrálva egy külső mesterséges intelligencia szolgáltatással.

## Rendszerkomponensek és modulhatárok

*   **Frontend (Web kliens):** React alapú felhasználói felület, amely a megjelenítésért, az aszinkron adatkérésekért és a kliensoldali állapotkezelésért (state management) felel.
*   **Backend API (FastAPI):** Aszinkron REST API, amely az üzleti logikát és a végpontok (routing) kiszolgálását végzi.
*   **Auth Guard (Modul):** A backend middleware rétege, amely a JWT tokenek dekódolását, érvényességük ellenőrzését és a jogosultságok kiosztását végzi.
*   **Adat-réteg (ORM és DB):** SQLAlchemy objektum-relációs leképző (ORM), amely hidat képez a Python kód és az SQLite relációs adatbázis között, biztosítva a relációk (1:N) kezelését.
*   **AI Engine:** Külső integráció a Google Gemini API-val, amely a prediktív elemzéseket és a chat funkciót biztosítja, a backend által szigorúan megkövetelt JSON kimeneti struktúrában.

## Architektúra Döntési Napló (ADR) kivonat

*   **ADR-001 (Frontend):** React SPA választása a gyors, komponens-alapú UI fejlesztés és a kiterjedt ökoszisztéma miatt.
*   **ADR-002 (Backend API):** FastAPI alkalmazása a beépített aszinkron támogatás és a Pydantic-alapú automatikus adatvalidáció miatt.
*   **ADR-003 (Hitelesítés):** Állapotmentes (stateless) JWT token alapú hitelesítés az API biztonsága és az egyszerű skálázhatóság érdekében.
*   **ADR-004 (Adatbázis):** Lokális SQLite használata az MVP fázishoz, a gyors iterációhoz és az egyszerű reprodukálhatósághoz.
*   **ADR-005 (ORM):** SQLAlchemy alkalmazása az SQL Injection elleni beépített védelem és a Python-alapú deklaratív adatmodellezés miatt.
*   **ADR-006 (AI Szolgáltató):** Google Gemini 3.1 Flash használata a gyors válaszidő és a megbízhatóan strukturált JSON adatok generálása céljából.
*   **ADR-007 (Tesztelés):** Pytest keretrendszer választása a fixture-támogatás (pl. izolált teszt-adatbázisok) és a tömör szintaktika miatt.

## Minőségi attribútumok

*   **Teljesítmény:** Az aszinkron FastAPI és a kliensoldali React renderelés súrlódásmentes és gyors felhasználói élményt biztosít.
*   **Biztonság:** "Security by design" elvek alkalmazása a jelszótárolásnál (bcrypt), a jogosultság-ellenőrzésnél és a végpont-szintű adatvalidációnál.
*   **Karbantarthatóság:** A moduláris felépítés (Single Responsibility Principle) és a frontend-backend szétválasztása biztosítja, hogy a platform a későbbiekben is könnyen skálázható és fejleszthető maradjon.