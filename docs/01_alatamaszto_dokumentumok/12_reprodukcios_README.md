# Reprodukciós README: Boosted

Ez a dokumentum a Boosted alkalmazás lokális környezetben történő telepítéséhez és futtatásához szükséges lépéseket tartalmazza.

## 1. Projekt futtatása

A rendszer szétválasztott architektúrája miatt a backend és a frontend alkalmazásokat külön terminálban kell elindítani.

### Szerveroldal (FastAPI Backend)
A backend futtatásához Python 3.10+ környezet szükséges.

1. Navigálj a projekt gyökerébe (E:\SZAKDOGA\Boosted), majd hozd létre a virtuális környezetet:
   python -m venv .venv

2. Aktiváld a virtuális környezetet:
   .\.venv\Scripts\activate

3. Függőségek telepítése:
   pip install -r requirements.txt

4. Környezeti változók beállítása:
   cp app/.env.example app/.env

5. Fejlesztői szerver indítása (a projekt gyökeréből futtatva):
   uvicorn app.main:app --reload

### Kliensoldal (React Frontend)
A frontend futtatásához Node.js és npm szükséges.

1. Navigálj a frontend mappába:
   cd frontend

2. Függőségek telepítése:
   npm install

3. Fejlesztői szerver indítása:
   npm run dev

---

## 2. Környezeti változók

A backend működéséhez az app/ mappában elhelyezett .env fájlban az alábbi változók megadása kötelező:

| Név | Mire való | Példa | Kötelező? |
|---|---|---|---|
| DATABASE_URL | SQLite adatbázis elérési útja | sqlite:///./boosted.db | Igen |
| SECRET_KEY | JWT tokenek aláírásához használt kulcs | egy_nagyon_titkos_veletlen_sztring | Igen |
| GEMINI_API_KEY | Google Gemini AI szolgáltatás kulcsa | AIzaSyB... | Csak MI funkciókhoz |

---

## 3. Demo adatok

Az alkalmazás alapértelmezés szerint egy lokális app/boosted.db fájlt használ. A bírálat megkönnyítése érdekében a rendszer az alábbi előre rögzített tesztfiókokkal kipróbálható:

* Szakértő (Edző) fiók:
    * Email: edzo@boosted.hu
    * Jelszó: demo1234
* Kliens fiók:
    * Email: kliens@boosted.hu
    * Jelszó: demo1234

*Megjegyzés: A tesztfiókok már össze vannak kapcsolva, így az AI Dashboard és a heti tervek azonnal megtekinthetők.*

---

## 4. Tesztek futtatása

A rendszer automatizált egységtesztjei a tests/ mappában találhatók. A tesztek futtatásához a virtuális környezet aktiválása után használd az alábbi parancsot a projekt gyökeréből:

python -m pytest tests/test_main.py -v

A tesztek futtatása során a rendszer egy izolált adatbázist (tests/test_boosted.db) hoz létre, így a tesztfolyamat nem módosítja a fejlesztői/demó adatbázist.