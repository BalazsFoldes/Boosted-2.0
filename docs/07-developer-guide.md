# Developer Guide (Fejlesztői Útmutató)

## 1. Bevezetés
Ez a dokumentum a **Boosted** alkalmazás forráskódjának felépítését és a fejlesztői környezet részleteit mutatja be.

---

## 2. Projektstruktúra (Refaktorált)

A projekt egyértelműen elkülönített backend és frontend modulokból áll a könnyebb karbantarthatóság érdekében:

* **`app/`**: A Python alapú kiszolgáló oldali kód. Itt található a `main.py`, amely a FastAPI végpontokat és az in-memory adatbázist kezeli.
* **`frontend/`**: A Next.js (React) keretrendszerre épülő kliensoldali alkalmazás.
    * `frontend/app/`: Itt találhatók az oldal-komponensek (`page.js`) és a globális stílusok.
* **`docs/`**: A projekt teljes dokumentációs anyaga, beleértve az Architecture Decision Record (ADR) fájlokat is.
* **`README.md`**: A projekt gyökérkönyvtárában elhelyezett gyorsindítási útmutató.

---

## 3. Technikai specifikációk

### Backend (FastAPI)
- **Belépési pont:** `app/main.py`
- **Adatkezelés:** Pydantic modellek használata a kérések validálására.
- **Logika:** A `get_dashboard` függvény végzi az összesített napi adatok (víz, hangulat) és a gamifikációs értékek (XP, szint) kiszámítását.

### Frontend (Next.js)
- **Komponens alapú felépítés:** A navigáció (`Navbar`) és az interaktív elemek (`MoodIcon`, `Accordion`) külön logikai egységekbe lettek szervezve.
- **Állapotkezelés:** React `useState` és `useEffect` hookok segítségével szinkronizáljuk a kliens állapotát a Backend API-val.

---

## 4. Karbantartás és bővítés
A fejlesztőknek javasolt a backend és frontend függőségek külön terminálban történő kezelése a `app/` és `frontend/` mappákból indítva.