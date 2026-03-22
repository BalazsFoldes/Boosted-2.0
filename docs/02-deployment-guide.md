# Telepítési és Indítási Útmutató

## 1. Bevezetés

Ez a dokumentum részletesen bemutatja a **Boosted** webalkalmazás fejlesztői környezetben (Localhost) történő telepítésének és futtatásának lépéseit.

A rendszer architektúrája **Full-Stack** felépítésű, amely két fő komponensből áll:
1. **Backend:** Python (FastAPI) alapú REST API.
2. **Frontend:** Next.js (React) alapú felhasználói felület.

A futtatáshoz mindkét komponenst külön-külön terminálablakban kell elindítani.

---

## 2. Előfeltételek (Prerequisites)

Az alkalmazás futtatásához az alábbi szoftverek telepítése szükséges a gazdagépen:

* **Python** (3.8 vagy újabb verzió)
    * Ellenőrzés: `python --version`
    * Letöltés: [python.org](https://www.python.org/)
* **Node.js** (18.x vagy újabb LTS verzió)
    * Ellenőrzés: `node -v` és `npm -v`
    * Letöltés: [nodejs.org](https://nodejs.org/)
* **Git** verziókezelő
    * Ellenőrzés: `git --version`
    * Letöltés: [git-scm.com](https://git-scm.com/)

---

## 3. A projekt letöltése

Nyiss egy terminált (parancssort), navigálj a kívánt mappába, és klónozd le a repository-t:

* **```bash**
    * git clone <A_TE_REPO_URL_CIMED>
    * cd boosted
        (Amennyiben ZIP formátumban töltötted le a forráskódot, csomagold ki, és nyiss egy terminált a főkönyvtárban.)

## 4. Backend (Szerver) indítása
A backend kiszolgáló elindításához nyisd meg az első terminálablakot (Terminal 1).

* **4.1.** Virtuális környezet létrehozása (Ajánlott)
    A függőségek izolálása érdekében ajánlott virtuális környezetet használni.

* Windows:

Bash
python -m venv venv
venv\Scripts\activate
macOS / Linux:

Bash
python3 -m venv venv
source venv/bin/activate

* **4.2.** Függőségek telepítése
Telepítsd a projekthez szükséges Python csomagokat:

Bash
pip install fastapi uvicorn
(Megjegyzés: Ha a projekt tartalmaz requirements.txt fájlt, használd a pip install -r requirements.txt parancsot.)

* **4.3.** Szerver indítása
Indítsd el a FastAPI szervert fejlesztői módban (hot-reload funkcióval):

Bash
uvicorn main:app --reload
Sikeres indítás esetén a terminálban megjelenik: Uvicorn running on http://127.0.0.1:8000.

API végpont: http://localhost:8000

Dokumentáció (Swagger UI): http://localhost:8000/docs

## 5. Frontend (Kliens) indítása
Hagyd futni a backendet az első ablakban, és nyiss egy második, teljesen új terminálablakot (Terminal 2).

* **5.1.** Navigálás és telepítés
Győződj meg róla, hogy a projekt gyökérkönyvtárában vagy (ahol a package.json található).

Bash
npm install
Ez a parancs letölti a Next.js-t, a Reactot és az egyéb szükséges JavaScript könyvtárakat a node_modules mappába.

* **5.2.** Fejlesztői szerver indítása
Indítsd el a frontend alkalmazást:

Bash
npm run dev
Sikeres indítás esetén a terminálban megjelenik: ready - started server on 0.0.0.0:3000, url: http://localhost:3000.

## 6. Az alkalmazás használata
Nyisd meg a böngésződet, és írd be a következő címet:

http://localhost:3000

Ekkor meg kell jelennie a Boosted bejelentkezési képernyőjének. Mivel az adatbázis jelenleg In-Memory (memóriában tárolt), minden szerver-újraindításkor az adatok törlődnek.

Első lépések:

Kattints a "Regisztrálj" gombra.

Hozz létre egy fiókot (pl. email: teszt@user.hu, jelszó: 1234).

Jelentkezz be a megadott adatokkal.

## 7. Hibaelhárítás (Troubleshooting)
Port ütközés (EADDRINUSE)
Ha a 3000-es vagy 8000-es port már foglalt egy másik futó program által:

Zárd be a másik alkalmazást.

Vagy módosítsd a portot indításkor (pl. uvicorn main:app --reload --port 8001).

"Module not found" hiba (Python)
Ha a backend indításakor ilyen hibát kapsz, valószínűleg nem aktiváltad a virtuális környezetet, vagy nem futtattad le a pip install parancsot. Ismételd meg a 4.1 és 4.2 lépéseket.

Hálózati hiba (Frontend)
Ha a frontend betölt, de hibaüzenetet kapsz bejelentkezéskor (pl. "Network Error"), ellenőrizd a Terminal 1 ablakot, hogy fut-e a backend szerver. A frontend csak akkor működik, ha a backend is elérhető.