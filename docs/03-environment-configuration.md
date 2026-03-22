# Környezeti Konfiguráció (Environment Configuration)

## 1. Bevezetés
Ez a dokumentum a Boosted alkalmazás környezeti változóit, konfigurációs lehetőségeit és a külső szolgáltatásokhoz való kapcsolódásának feltételeit részletezi. A környezeti konfiguráció célja, hogy elválassza a forráskódot a futtatási környezettől (fejlesztői, teszt vagy éles környezet), biztosítva ezzel a hordozhatóságot és a biztonságot.

## 2. Jelenlegi állapot (MVP fázis)
A projekt jelenlegi szakaszában az alkalmazás alapértelmezett (hard-coded) értékeket használ a helyi fejlesztés megkönnyítése érdekében. Az adatok tárolása in-memory (memóriában tárolt) módon történik, így külső adatbázis-kapcsolati beállításokra jelenleg nincs szükség.

## 3. Frontend konfiguráció (Next.js)
A kliensoldali alkalmazásnak tudnia kell, hogy melyik címen éri el a Backend API-t. A Next.js keretrendszer a gyökérkönyvtárban elhelyezett .env fájlokat használja a változók kezelésére.

* **3.1.** Környezeti változók (.env.local)
A fejlesztés során javasolt egy .env.local fájl létrehozása a projekt gyökerében:

Bash
## A Backend API alapértelmezett elérési útja
NEXT_PUBLIC_API_URL=http://localhost:8000
* **3.2.** Technikai részletek
A NEXT_PUBLIC_ előtaggal ellátott változók a böngészőben futó kliensoldali kód számára is elérhetőek lesznek.

A kódban a hivatkozás módja: process.env.NEXT_PUBLIC_API_URL.

## 4. Backend konfiguráció (FastAPI)
A Python backend jelenleg a main.py fájlban definiált alapértelmezett beállításokat használja. A későbbi fejlesztési szakaszokban (például JWT alapú hitelesítés bevezetésekor) az alábbi változók bevezetése szükséges:

* **4.1.** Tervezett változók (.env)
A backend gyökérkönyvtárában elhelyezendő .env fájl tartalma:

Bash
## Szerver futtatási beállítások
API_HOST=127.0.0.1
API_PORT=8000
DEBUG_MODE=True

## Biztonsági beállítások (JWT-hez)
SECRET_KEY=ide_egy_hosszu_veletlenszeru_karaktersor_kerul
TOKEN_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
## 5. Adatbázis konfiguráció
Mivel az MVP verzió In-Memory adatkezelést használ, az adatok perzisztens tárolása (például PostgreSQL vagy MySQL) a következő fázis feladata.

* **5.1.** Átállás külső adatbázisra (Terv)
A külső adatbázisra való átálláskor az alábbi kapcsolati string (Connection String) megadása lesz szükséges:

Bash
## PostgreSQL példa
DATABASE_URL=postgresql://felhasznalonev:jelszo@localhost:5432/boosted_db
## 6. Biztonság és Git kezelés
A konfigurációs fájlok kezelésekor az alábbi biztonsági irányelveket követjük:

SOHA ne commitolj .env fájlt a Git repository-ba! A privát kulcsok, jelszavak és API kulcsok kiszivárgása kritikus biztonsági kockázatot jelent.

A .gitignore fájlban szerepelnie kell az alábbi bejegyzéseknek:

.env

.env.local

.env.*.local

A fejlesztők segítésére egy .env.example fájlt tartunk a repository-ban, amely tartalmazza a szükséges kulcsokat, de nem tartalmazza a konkrét értékeket.