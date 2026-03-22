# Software Architecture Document (SAD)

## 1. Bevezetés

Ez a dokumentum a **Boosted** nevű webalkalmazás szoftverarchitektúráját mutatja be.
A Boosted egy **adatvezérelt** egészség- és fitnesz alkalmazás, amelynek célja, hogy a
felhasználók napi egészségügyi adatait (pl. hidratáció, hangulat) egységes
felületen kezelje, vizualizálja, **és gamifikációs elemekkel motiválja a fejlődést.**

A dokumentum célja:
- a rendszer magas szintű felépítésének bemutatása,
- a fő komponensek és azok kapcsolódásának leírása,
- valamint a legfontosabb architekturális döntések összefoglalása.

---

## 2. Rendszer áttekintés

A Boosted egy **full-stack webalkalmazás**, amely három fő rétegre bontható:

1. **Frontend réteg**
   - Böngészőben futó felhasználói felület (SPA - Single Page Application)
   - A felhasználó itt végzi az adatbevitelt, a statisztikák megtekintését és a profil kezelését.

2. **Backend réteg**
   - REST API-kat biztosító szerveroldali alkalmazás
   - Feladata az üzleti logika kezelése, adatok validálása, és az adatok kiszolgálása.

3. **Adatréteg**
   - MVP fázisban egy egyszerű, in-memory adatstruktúra
   - A későbbi fejlesztések során relációs adatbázissal (pl. PostgreSQL) kiváltható.

A rendszer célja a **gyors prototípus-fejlesztés (MVP)**, miközben az architektúra
lehetővé teszi a későbbi bővíthetőséget (pl. AI modulok illesztése) és skálázhatóságot.

---

## 3. Frontend–backend kapcsolat

A frontend és a backend **HTTP-alapú REST kommunikáción** keresztül kapcsolódik egymáshoz.

### Frontend
- **Next.js (React)** alapú kliensalkalmazás
- A felhasználói interakciók (bejelentkezés, adatbevitel) JavaScript eseményeken keresztül történnek
- Az adatok lekérése `fetch` API segítségével valósul meg

### Backend
- **FastAPI (Python)** alapú REST API
- JSON formátumú requesteket fogad és válaszol
- Az autentikáció MVP szinten egyszerű token-alapú megoldással történik

### Kommunikációs példa
- `POST /api/login` – felhasználó bejelentkezés
- `POST /api/daily-log` – napi hidratáció vagy hangulat rögzítése
- `GET /api/dashboard/today` – összesített napi adatok lekérése

A frontend kizárólag a backend API-n keresztül fér hozzá az adatokhoz, közvetlen
adatbázis-hozzáférés nem történik.

---

## 4. Fő komponensek

### 4.1 Frontend komponensek
- **Oldal komponensek (Views)**
  - Bejelentkezési és regisztrációs felület (Auth)
  - Dashboard nézet (Napi összefoglaló és adatbevitel)
  - Profil oldal **(BMI kalkulátorral és szerkesztővel)**
  - **Mood oldal (Hangulat analitika és tanácsadó modul)**
  - **Quest oldal (Heti kihívások és jutalmak)**
- **UI komponensek**
  - **Lebegő Navigációs sáv (Glassmorphism stílusban)**
  - Hangulat-ikon megjelenítő komponens
  - **Accordion (Lenyíló információs panelek)**
- **Állapotkezelés**
  - React `useState`, `useEffect` és `useRef` hookok

### 4.2 Backend komponensek
- **FastAPI alkalmazás**
  - API végpontok definíciója és routing
- **Adatmodellek**
  - Pydantic modellek (pl. `UserRegister`, `DailyLog`, `UserUpdate`)
- **Üzleti logika**
  - Validáció (pl. hangulat értéke 1–5 között)
  - Napi adatok összesítése és átlagszámítás
  - **XP (Tapasztalati pont) rendszer és szintlépés számítása**
- **Autentikáció**
  - Token-alapú azonosítás (MVP megoldás)

### 4.3 Adatkezelés
- In-memory adatszerkezet (dictionary)
- Felhasználók, naplók és aktivitások elkülönített kezelése
- A megoldás célja a gyors fejlesztés, nem az éles üzem

---

## 5. Architekturális döntések és ADR hivatkozás

A projekt során a technológiai stack kiválasztása és módosítása
**Architecture Decision Record (ADR)** formájában került dokumentálásra.

A backend technológia kiválasztásának részletes indoklása az alábbi dokumentumban található:

- **[ADR #0001 – Technology Stack Selection](./adr/0001-first-tech-choice.md)**

Az ADR bemutatja:
- a kezdeti technológiai elképzelést,
- az alternatívák elemzését,
- valamint a **FastAPI** végleges kiválasztásának indokait.

---

## 6. Összegzés

A Boosted architektúrája egy egyszerű, de jól tagolt felépítést követ,
amely alkalmas egy MVP gyors megvalósítására.
A frontend és backend világos szétválasztása, valamint a dokumentált
architekturális döntések biztosítják a rendszer későbbi továbbfejlesztésének lehetőségét,
**például a jelenlegi statikus tanácsadó modul kiváltását egy valós idejű AI (LLM) integrációval.**