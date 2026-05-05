# Adatmodell: Boosted

## 1. Entitásleírás

| Entitás | Felelősség | Fontos mezők | Kapcsolatok | Validáció | Biztonsági megjegyzés |
|---|---|---|---|---|---|
| **Felhasználó** (`User`) | Rendszerszereplők (Edző, Kliens) azonosítása, profiladatok és gamifikációs állapot tárolása. | `id`, `email`, `password_hash`, `role`, `coach_id`, `total_boosts` | 1:N kapcsolat a naplókkal, tervekkel, értékelésekkel és meghívókkal. (Self-referencing jelleg a `coach_id` által). | `email` egyediség (Unique), kötelező szerepkör (COACH/CLIENT). | A jelszót sosem tároljuk nyíltan, csak a bcrypt hash-t. A kliens csak a saját adatait módosíthatja. |
| **Napi Napló** (`DailyLog`) | A kliensek napi biometrikus (alvás, stressz, víz) és edzésadatainak rögzítése. | `id`, `client_id`, `date`, `sleep_hours`, `stress_level`, `workout_minutes` | N:1 kapcsolat a `User` táblával (kizárólag CLIENT role-al). | Adattípus validáció Pydantic-kal. Napi szintű egyediség (egy kliens egy napra csak egyet menthet). | Kliens csak sajátot hozhat létre, edző csak a hozzárendelt kliensét olvashatja. |
| **Heti Edzésterv** (`WeeklyPlan`) | A szakértők által kiírt edzésprogramok tárolása. | `id`, `client_id`, `week_start_date`, `plan_data` | N:1 kapcsolat a `User` táblával (kliens célobjektum). | A `week_start_date` kizárólag hétfői nap lehet. | Kliens csak `Read` joggal rendelkezik, új tervet csak a jogosult edző hozhat létre/módosíthat. |
| **Meghívó** (`Invite`) | A zárt, biztonságos regisztráció (edző -> kliens meghívás) tranzakcionális kezelése. | `id`, `token`, `coach_id`, `client_email`, `expires_at`, `used` | N:1 kapcsolat a `User` táblával (edző mint generáló). | Lejárati idő (24 óra) és felhasználtsági állapot (`used` boolean) ellenőrzése. | A `token` kriptográfiailag biztonságos (`secrets.token_urlsafe`), illetéktelenek nem regisztrálhatnak. |
| **Értékelés** (`Review`) | Az edzői teljesítmény kliens általi (opcionális) minősítése. | `id`, `coach_id`, `client_id`, `rating`, `review_text` | N:1 kapcsolat az edzővel és a klienssel. | Az értékelés (rating) 1-5 közötti skálára korlátozott. | Csak a kapcsolat megszakításakor (Disconnect) jön létre, védve a visszaélésektől. |

## 2. Adatmodell döntések (Architekturális kompromisszumok)

A Boosted adatrétege egy hibrid megközelítést alkalmazó **relációs adatmodellre** épül, amelynek megvalósítását az SQLAlchemy ORM keretrendszer végzi.

**Dinamikus adatbázis-motor váltás (Környezeti adaptáció)**
A rendszer a környezeti változók (`DATABASE_URL`) alapján dinamikusan dönt az alkalmazott adatbázis-motorról. 
* A fejlesztési (lokális) fázisban és a bírálói reprodukálhatóság biztosítása érdekében a projekt a fájlalapú **SQLite**-ot használja. Mivel az SQLite natívan nem támogatja a konkurens szálakat úgy, mint a nagy szerverek, a `check_same_thread=False` argumentum alkalmazásával garantálom, hogy a FastAPI aszinkron működése ne okozzon zárolási (lock) hibákat.
* Éles (production) környezetben a kód automatikusan, átírás nélkül használható dedikált PostgreSQL szerverrel (pl. Neon.tech), elhagyva a lokális paramétereket.

**Miért relációs adatbázis (SQL)?**
A rendszer magját képező entitások (Edzők és Kliensek) közötti viszonyok szigorúan strukturáltak. Egy kliens egy adott edzőhöz tartozik, a naplók pedig egyértelműen a kliensekhez rendelhetők. A relációs modell garantálja a magas szintű adatintegritást: nem fordulhat elő, hogy egy napló "árván" maradjon az adatbázisban, ha a kliens fiókját töröljük (Kapcsolat megszakítása use case).

**A hibrid kompromisszum (JSON tárolása relációs táblában):**
A `WeeklyPlan` (Heti Edzésterv) tábla a `plan_data` oszlopban a feladatokat JSON formátumú sztringként tárolja. 
* *Miért?* Egy edzésterv napokra és órákra bontott adatszerkezete rendkívül dinamikus. Ha tisztán relációs modellt alkalmaztam volna, minden edzésnaphoz és feladathoz külön táblát és kapcsolatot kellett volna fenntartani, ami drasztikusan lelassította volna a lekérdezéseket és túlbonyolította volna a kódolást.
* *A kompromisszum:* A JSON tárolás hátránya, hogy az adatbázis szintjén nehezebb belekérdezni a szöveg belsejébe (pl. "Listázd az összes keddi guggolást"). A Boosted esetében ez a kompromisszum vállalható, mivel a rendszer mindig teljes heteket kér le a megjelenítéshez (`week_start_date` alapján), a feladatok darabolását pedig a React kliensoldal (Frontend) végzi el a megjelenítés (Bento Grid naptár) során.

**Elkülönített validáció (Pydantic):**
Az adatmodell fizikai felépítése (SQLAlchemy) és a beérkező HTTP adatok ellenőrzése tudatosan külön van választva. A Pydantic adatcsere-objektumok (DTO-k) garantálják, hogy a nyers adatok már a REST API végponton, a hálózati rétegben elakadjanak (422 Unprocessable Entity hiba), ha formátumuk hibás, így az SQLite adatbázist nem terhelik felesleges hibás tranzakciók.