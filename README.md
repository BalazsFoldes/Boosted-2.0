# Boosted 2.0 – Next-Gen Personal Trainer Management & AI Analytics

A **Boosted 2.0** a szakdolgozatom központi eleme: egy modern, adatközpontú és gamifikált platform, amely forradalmasítja a személyi edzők és klienseik közös munkáját. 

A platform célja, hogy az edzők túlmutassanak a hagyományos (csak súlyokat és ismétléseket rögzítő) edzésterveken. A Boosted segítségével a szakértők átfogó képet kapnak a kliensek biometrikus adatairól (alvás, stressz, folyadékbevitel, hangulat), miközben a **Google Gemini AI** automatizált trendelemzésekkel, prediktív sérülés-előrejelzéssel és okos riasztásokkal segíti a munkájukat.

## Főbb funkciók

* 📊 **Dinamikus Edzői Dashboard:** Átlátható, statisztikákkal és interaktív grafikonokkal (Recharts) felszerelt felület a kliensek fejlődésének követésére. Csapat szintű átlagok és okos riasztások (pl. tartósan magas stresszszint esetén).
* 🧠 **Gemini AI Asszisztens (Neural Engine):** A napi naplók és edzői jegyzetek alapján az MI személyre szabott kockázatelemzést (sérülés, kiégés), célelőrejelzést és rejtett mintázatok felismerését végzi el mind az edző, mind a kliens számára.
* ⚡ **Gamifikáció (Boost Rendszer):** Beépített motivációs eszközök a kliensek számára. Folyamatos naplózásért járó "Széria" (Streak) számláló, valamint az edző által küldhető azonnali "Boost" értesítések.
* 📝 **Részletes Napi Naplózás:** Modern, csúszkás (slider) felület a klienseknek, ahol 1 perc alatt rögzíthető az alvás, a stressz, a víz, az edzésintenzitás, a lépésszám és a napi hangulat.
* 📅 **Heti Tervező & PDF Export:** Az edzők napra lebontva tervezhetik meg az edzéseket, amelyeket egy kattintással formázott, offline is használható PDF formátumba exportálhatnak a klienseknek.
* 🔐 **Biztonságos Meghívó Rendszer:** Exkluzív csatlakozási folyamat, ahol a kliensek csak az edző által generált egyedi, időkorlátos tokenekkel (linkekkel) regisztrálhatnak.

## Technológiai Stack

**Frontend:**
* **Keretrendszer:** Next.js (App Router), React
* **Dizájn & UI:** Tailwind CSS v4, teljesen reszponzív, modern "glassmorphism" felületek
* **Adatvizualizáció & Export:** Recharts (oszlop- és vonaldiagramok), jsPDF

**Backend:**
* **Keretrendszer:** Python 3.x, FastAPI (aszinkron, villámgyors REST API)
* **Mesterséges Intelligencia:** Google Generative AI (Gemini modell) a komplex kontextuselemzéshez és strukturált JSON válaszok generálásához.
* **Adatbázis & ORM:** SQLite (MVP fázisban), SQLAlchemy ORM, Pydantic (szigorú adatvalidáció)
* **Biztonság:** Hash-alapú authentikáció, CORS middleware.

## 📂 Repository Felépítése

```text
Boosted-2.0/
├── boosted.db          # SQLite adatbázis (fejlesztői környezet)
├── frontend/           # A Next.js webalkalmazás (UI, kliens és edzői nézetek)
│   ├── src/app/        # Oldalak és komponensek (page.js)
│   └── public/         # Statikus fájlok
├── app/                # A FastAPI szerver
│   ├── main.py         # API végpontok, AI logika, DB modellek és Pydantic sémák
└── docs/               # Szakdolgozati dokumentációk és UX tervek
    ├── ux/             # Wireframe-ek, Pageflow, Képernyőképek
    ├── system/         # Architektúra tervek
    └── szakdolgozat_Foldes_Balazs_NYCLM8.pdf/         # Szakdolgozat minta/alapja



⚙️ Futtatási útmutató (Development)
1. Előfeltételek
A gyökérkönyvtárban hozz létre egy .env fájlt az alábbi tartalommal:
GEMINI_API_KEY=IDE_A_TE_KULCSOD

2. Telepítés
Telepítsd a szükséges függőségeket (érdemes virtuális környezetben):

Bash
# Backend
pip install fastapi uvicorn sqlalchemy bcrypt PyJWT python-dotenv google-generativeai

# Frontend
cd frontend
npm install
3. Indítás
Windows alatt egyszerűen futtasd a gyökérben található parancsfájlt:

Bash
start-dev.bat
Ez automatikusan elindítja a backendet (port 8000) és a frontendet (port 3000).

✅ Tesztelés
A backend tesztek futtatásához használd a következő parancsot az app mappában:

Bash
python -m pytest test_main.py -v
