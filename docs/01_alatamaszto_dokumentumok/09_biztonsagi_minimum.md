# Biztonsági minimum (Security Baseline): Boosted

## 1. Ellenőrző lista

| Terület | Kötelező ellenőrzés | Bizonyíték a projektben | Eredmény |
|---|---|---|:---:|
| **XSS (Cross-Site Scripting)** | A felhasználók által bevitt szövegek (pl. Edzői jegyzetek, Kliens célok) nem futhatnak le kódként a böngészőben. | A Frontend kizárólag a React keretrendszert használja a megjelenítésre. A React (JSX) beépítetten automatikusan escape-eli (stringgé alakítja) a megjelenített változókat, megelőzve az XSS támadásokat. Kivétel a Quill rich text editor, ami dedikált sanitizációt alkalmaz. | OK |
| **SQL / Data Injection** | Rosszindulatú SQL parancsok vagy érvénytelen típusok nem juthatnak el az adatbázisig. | A Backend a FastAPI Pydantic sémáit (DTO) használja bemenet-validációra. Az adatbázis hívásokat kizárólag az SQLAlchemy ORM kezeli parametrizált lekérdezésekkel, így a közvetlen SQL injektálás fizikailag lehetetlen. | OK |
| **Titokkezelés (Credentials)** | Nincsenek kódba égetett jelszavak, adatbázis URL-ek vagy API kulcsok a GitHub repóban. | Minden érzékeny adat a szerveren lévő környezeti változókból (Environment Variables) töltődik be (`os.getenv()`). A repóban csak egy `env.example` fájl található. | OK |
| **Hitelesítés és Jelszóvédelem** | Jelszavak biztonságos tárolása és állapotmentes (stateless) hitelesítés. | A jelszavak nyílt szöveg helyett sós `bcrypt` lenyomatként (hash) kerülnek tárolásra. A hozzáférés JWT (JSON Web Token) alapú, `HTTPBearer` védelemmel és 7 napos lejárati idővel (Expiration). | OK |
| **Jogosultság (Authorization)** | Kliens nem férhet hozzá az edző adataihoz, és egy edző nem láthatja másik edző kliensét. | Szerepköralapú hozzáférés-vezérlés (RBAC). Az API végpontokon (pl. profil frissítés) az `Auth Guard` (`get_current_user`) ellenőrzi a felhasználó azonosságát és szerepkörét. | OK |
| **Fiókregisztráció védelme** | Csak meghívott kliens regisztrálhat. | A meghívó linkek generálásához a Python `secrets.token_urlsafe(32)` modulját használom, amely kriptográfiailag biztonságos tokeneket hoz létre, megakadályozva a "találgatásos" (brute-force) támadásokat. | OK |

---

## 2. Biztonsági architektúra leírása (Releváns támadási felületek)

Az egészségtudatos életmód-alkalmazások esetében (amelyek biometrikus és stressz-adatokat is kezelnek) a személyes adatok védelme kiemelten fontos. A Boosted 2.0 fejlesztése során az alábbi három fő támadási felületre koncentráltam:

### A. Jelszószivárgás elleni védelem (Adatbázis szint)
A legkritikusabb hiba, ha egy adatbázis-szivárgás esetén a támadó nyíltan olvashatja a felhasználók jelszavait. Ennek elkerülése érdekében az elavult, egyszerű MD5 vagy SHA algoritmusok helyett az iparági standard **bcrypt** algoritmust alkalmaztam. A bcrypt nemcsak titkosít (hashel), hanem minden egyes jelszóhoz egyedi "sót" (salt) is generál, így még azonos jelszavak esetén is teljesen eltérő hash lenyomatok keletkeznek az adatbázisban, kivédve a szivárványtáblás (rainbow table) támadásokat. 

```python
def get_password_hash(password: str) -> str:
    pwd_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(password=pwd_bytes, salt=salt)
    return hashed_password.decode('utf-8')
```

### B. Jogosulatlan végpont-hozzáférés (Hálózati szint)
Az alkalmazás REST API-ja nyitott az internet felé. Ahhoz, hogy egy bejelentkezett felhasználó ne tudja lekérdezni vagy módosítani más felhasználó adatait (például egy másik kliens profilját az ID átírásával), a JWT alapú állapotmentes hitelesítést (Stateless Auth) implementáltam egy központi őr (Guard) segítségével.

```python
def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        
        user_id_str = payload.get("sub")
        if user_id_str is None:
            raise HTTPException(status_code=401, detail="Érvénytelen token (nincs user_id)")
        
        user_id = int(user_id_str)
        
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="A token lejárt! Kérlek lépj be újra.")
    except Exception as e:
        print(f"JWT Hiba a visszafejtésnél: {e}")
        raise HTTPException(status_code=401, detail="Érvénytelen token!")
        
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=401, detail="A tokenhez tartozó felhasználó nem található.")
    return user
```

Bármilyen adatbázis-módosítási műveletnél (pl. profil mentése) a végpont a JWT tokenből kinyert ID-t összeveti a módosítani kívánt erőforrás ID-jával. Ha az eltér, a szerver egy `403 Forbidden` hibát dob, megvédve az adatokat.

### C. Sérült vagy rosszindulatú adat bevitele (Alkalmazás szint)
Mivel az alkalmazás biometrikus értékeket és számokat vár (pl. 5.5 liter víz, vagy 8 óra alvás), egy rosszindulatú vagy hibás kérés (pl. SQL parancs vagy betűk küldése a szám helyére) összeomlaszthatná a szervert vagy a mesterséges intelligencia modellt. Ennek védelmét a **Pydantic DTO (Data Transfer Object)** réteg látja el a végpontok bejáratánál.

```python
class DailyLogCreate(BaseModel):
    client_id: int
    date: str 
    sleep_hours: int
    stress_level: int
    water_liters: float
    workout_minutes: int
    mood: str
    notes: str = None
    workout_intensity: int = 0
    steps: int = None
    weight: float = None
```

Mivel az ORM (SQLAlchemy) réteg automatikusan parametrizálja az összes lekérdezést, a Pydantic pedig kizárólag érvényes, a modellnek megfelelő típusokat enged be, a backend bombabiztos az adatinjektálásos (SQL Injection) támadásokkal szemben.