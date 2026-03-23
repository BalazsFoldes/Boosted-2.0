# 0001: Kezdeti technológiai stack kiválasztása

- Dátum: 2026-03-23
- Státusz: Elfogadva

## Kontextus
A Boosted 2.0 egy AI-alapú személyi edző és kliensmenedzsment webalkalmazás. A projekt célja egy olyan adatközpontú platform létrehozása, ahol a kliensek egyszerűen naplózhatják biometrikus adataikat (alvás, stressz, víz, hangulat), az edzők pedig egy átfogó dashboardon követhetik ezeket. A rendszer legfőbb értéke a Data Engineering és az AI-integráció: az adatokból automatizált trendelemzések és riportok készülnek.

## Döntés
A frontendhez **Next.js (React)** keretrendszert választunk **TypeScript** és a legújabb **Tailwind CSS v4** támogatással, mivel:
- Modern, gyors és reszponzív UI-t biztosít mind az edzői dashboard, mind a kliens mobilnézete számára.
- A beépített útválasztás (App Router) megkönnyíti a szerepkörök (Coach/Client) szerinti oldal-elkülönítést.
- A csapatnak (nekem) már van React- és Tailwind-tapasztalata.

A backend **FastAPI (Python)** lesz **PostgreSQL** adatbázissal (fejlesztés alatt SQLite), mert:
- **Data Engineering fókusz:** A Python natív ökoszisztémája (Pandas, NumPy) és a FastAPI aszinkron sebessége tökéletes az adatfeldolgozáshoz.
- Egyszerű AI integráció: Az OpenAI/Gemini API-k hívása Pythonból a legstabilabb.
- A Pydantic modellek (FastAPI alapja) automatikus adatvalidációt biztosítanak a bejövő kliensnaplókra.

## Megfontolt alternatívák
- **Django + PostgreSQL:** Bár a beépített admin felület és ORM kényelmes, a mi API-first, mikroszolgáltatás jellegű, adatelemzésre fókuszáló architektúránkhoz túlságosan robusztus és lassabb lett volna.
- **Node.js (Express) + PostgreSQL:** Gyors lett volna a frontend-backend nyelvi egyezés (Full-Stack JS) miatt, de a Python AI és adatelemző könyvtárainak hiánya miatt elvetettük.

## Következmények
- **Monorepo struktúra:** Két különálló környezetet (NPM a frontendnek, Pip/Venv a backendnek) kell karbantartani egy repón belül.
- **Adatbiztonság és skálázhatóság:** A FastAPI és a PostgreSQL párosa garantálja, hogy a komplex SQL lekérdezések (pl. "mutasd az összes kliensem heti stressz-átlagát") villámgyorsak maradjanak.
- **Fejlesztési fókusz:** Az autentikációt és az adatbázis-sémát (SQLAlchemy) az alapoktól precízen fel kell építeni, ami kiváló mérnöki (Data Engineer) gyakorlat.