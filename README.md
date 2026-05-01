# Boosted – Next-Gen Personal Trainer Management & AI Analytics

A **Boosted** a szakdolgozatom központi eleme: egy modern, adatközpontú és gamifikált platform, amely forradalmasítja a személyi edzők és klienseik közös munkáját.

A platform célja, hogy az edzők túlmutassanak a hagyományos (csak súlyokat és ismétléseket rögzítő) edzésterveken. A Boosted segítségével a szakértők átfogó képet kapnak a kliensek biometrikus adatairól (alvás, stressz, folyadékbevitel, hangulat), miközben a **Google Gemini AI** automatizált trendelemzésekkel, prediktív sérülés-előrejelzéssel és okos riasztásokkal segíti a munkájukat.

## Élesített verzió
Az alkalmazás egy elosztott felhőarchitektúrában (CI/CD) fut:
* **Kliensoldal (Vercel):** [https://boosted-app.vercel.app/](https://boosted-app.vercel.app/)
* **Szerveroldal (Render):** [https://boosted-backend-bvvv.onrender.com/docs](https://boosted-backend-bvvv.onrender.com/docs) *(Swagger UI API Dokumentáció)*

---

## Főbb funkciók

* 📊 **Dinamikus Edzői Dashboard:** Átlátható, statisztikákkal és interaktív grafikonokkal (Recharts) felszerelt felület a kliensek fejlődésének követésére. Csapat szintű átlagok és okos riasztások (pl. tartósan magas stresszszint esetén).
* 🧠 **Gemini AI Asszisztens (Neural Engine):** A napi naplók és edzői jegyzetek alapján az MI személyre szabott kockázatelemzést (sérülés, kiégés), célelőrejelzést és rejtett mintázatok felismerését végzi el mind az edző, mind a kliens számára.
* ⚡ **Gamifikáció (Boost Rendszer):** Beépített motivációs eszközök a kliensek számára. Folyamatos naplózásért járó "Széria" (Streak) számláló, valamint az edző által küldhető azonnali "Boost" értesítések.
* 📝 **Részletes Napi Naplózás:** Modern, csúszkás (slider) felület a klienseknek, ahol 1 perc alatt rögzíthető az alvás, a stressz, a víz, az edzésintenzitás, a lépésszám és a napi hangulat.
* 📅 **Heti Tervező & PDF Export:** Az edzők napra lebontva tervezhetik meg az edzéseket, amelyeket egy kattintással formázott, offline is használható PDF formátumba exportálhatnak a klienseknek.
* 🔐 **Biztonságos Meghívó Rendszer:** Exkluzív csatlakozási folyamat, ahol a kliensek csak az edző által generált egyedi, időkorlátos tokenekkel (linkekkel) regisztrálhatnak.

---

## Technológiai Stack

**Frontend (Hosztolás: Vercel):**
* **Keretrendszer:** Next.js (App Router), React
* **Dizájn & UI:** Tailwind CSS v4, teljesen reszponzív, modern "glassmorphism" felületek
* **Adatvizualizáció & Export:** Recharts (oszlop- és vonaldiagramok), jsPDF

**Backend (Hosztolás: Render.com):**
* **Keretrendszer:** Python 3.x, FastAPI (aszinkron, villámgyors REST API)
* **Mesterséges Intelligencia:** Google Generative AI (Gemini 3.1 Flash Lite modell) a komplex kontextuselemzéshez és strukturált JSON válaszok generálásához.
* **Adatbázis & ORM:** Neon.tech Serverless PostgreSQL (Éles környezet) / SQLite (Lokális fejlesztés), SQLAlchemy ORM.
* **Biztonság és Validáció:** Pydantic (szigorú adatvalidáció), Bcrypt (jelszó hashelés), JWT (JSON Web Token) alapú állapotmentes hitelesítés, CORS middleware.

---

## 📂 Repository Felépítése
```text
Boosted-2.0/
├── frontend/                                           # A Next.js webalkalmazás (UI, kliens és edzői nézetek)
│   ├── app/                                            # Oldalak és komponensek (page.js)
│   ├── public/                                         # Statikus fájlok
│   └── package.json                                    # Node.js függőségek
├── main.py                                             # A FastAPI szerver, végpontok, AI logika és DB modellek
├── requirements.txt                                    # Python függőségek a backendhez
├── boosted.db                                          # SQLite adatbázis (CSAK lokális fejlesztői környezethez)
└── docs/                                               # Szakdolgozati dokumentációk és UX tervek
    ├── ux/                                             # Wireframe-ek, Pageflow, Képernyőképek
    ├── system/                                         # Architektúra tervek
    └── szakdolgozat_Foldes_Balazs.pdf                  # Szakdolgozat


⚙️ Futtatási útmutató (Lokális Fejlesztés)
1. Előfeltételek
A gyökérkönyvtárban hozz létre egy .env fájlt az alábbi tartalommal:

Kódrészlet
# Kötelező az AI funkciókhoz:
GEMINI_API_KEY=IDE_A_TE_KULCSOD

# Opcionális (ha nem adod meg, lokálisan a http://localhost:3000-et és SQLite-ot használ):
FRONTEND_URL=http://localhost:3000
DATABASE_URL=sqlite:///./boosted.db
2. Telepítés
Telepítsd a szükséges függőségeket (a backendhez érdemes virtuális környezetet használni):

Bash
# Backend függőségek telepítése
pip install -r requirements.txt

# Frontend függőségek telepítése
cd frontend
npm install
3. Indítás
Windows alatt egyszerűen futtasd a gyökérben található parancsfájlt:

Bash
start-dev.bat
Ez automatikusan elindítja a backendet (http://localhost:8000) és a frontendet (http://localhost:3000).

✅ Tesztelés
A backend API végpontok és az üzleti logika automatizált egységtesztjeinek (Unit tests) futtatásához használd a következő parancsot a backend mappájában:

Bash
python -m pytest test_main.py -v
