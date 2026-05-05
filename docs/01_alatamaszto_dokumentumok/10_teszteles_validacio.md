# Tesztelés és validáció: Boosted

## 1. Tesztterv (Kritikus MVP funkciók)

Az alábbi tesztek a rendszer legfontosabb üzleti folyamataira (meghívás, napló, AI riport, hibatűrés) fókuszálnak, ahogy azt a projektkövetelmények előírták.

| Teszt ID | Típus | Cél | Előfeltétel | Lépések | Várt eredmény | Kapcsolódó követelmény | Eredmény |
|---|---|---|---|---|---|---|---|
| **TC-INV-01** | API / Funkcionális | Sikeres kliens meghívás | Edzői jogosultság (JWT) | 1. `/api/invite` hívása. 2. Frontend URL generálása. | 32 bájtos kriptográfiai token jön létre, 24 órás lejárattal. | FK-02 | Sikeres |
| **TC-INV-02** | API / Hibaág | Lejárt vagy használt token védelme | Használt token (used=True) | 1. `/api/register-client` hívása a régi tokennel. | 400 Bad Request: "Érvénytelen vagy lejárt meghívó!". | FK-02 | Sikeres |
| **TC-LOG-01** | API / Funkcionális | Napi napló (Daily Log) rögzítése | Kliens jogosultság (JWT) | 1. Payload összeállítása (testsúllyal). 2. POST `/api/client/log` | 200 OK. A napló létrejön, ÉS a Kliens profilján a `current_weight` is frissül. | FK-03 | Sikeres |
| **TC-LOG-02** | API / Hibaág | Napi duplikáció megakadályozása | Kliens aznap már naplózott | 1. POST `/api/client/log` ismételt hívása azonos dátummal. | 400 Bad Request hiba, az adatbázis nem rögzít duplikátumot. | FK-03 | Sikeres |
| **TC-REP-01** | API / Funkcionális | AI Riport generálása (JSON kényszerítés) | Adatokkal rendelkező kliens | 1. AI Dashboard fül megnyitása. 2. Kontextus küldése a Gemini API-nak. | A Gemini válasza szigorúan formázott JSON, Markdown (```json) jelölések nélkül. | FK-04 | Sikeres |
| **TC-AI-01** | UX / Hibatűrés | AI Timeout és Rate Limit kezelése | Hálózati hiba vagy túllépett Gemini API limit | 1. AI generálás indítása. 2. 500/503 hiba szimulálása. | A frontend nem fagy le (nincs végtelen spinner), hanem egy "Szerver túlterhelt" fallback kártyát jelenít meg. | NFK-04 | Sikeres |

---

## 2. Validációs bizonyítékok

**1. Funkcionális tesztlista és automatizáció**
A FastAPI backend védelmi vonalait és az üzleti logikát (pl. a `WeeklyPlan` hétfői kezdőnapjának ellenőrzése, a Pydantic modellek típusvalidációja) automatizált Pytest tesztekkel (`TestClient`) validáltam. Összesen 10 átfogó egységteszt futott le sikeresen a fejlesztés során, amelyek bizonyítják a jogosultságok és az adatbázis integritását.

**2. Security minimum ellenőrzés**
A biztonsági validációt az ADR-ben és a Security dokumentumban leírtak szerint végeztem:
* Secret scan: A repozitóriumba nem került fel `.env` fájl (csak `.env.example`).
* Jelszavak: Az adatbázisban (SQLite/PostgreSQL) manuálisan ellenőriztem, hogy a `password_hash` oszlopban kizárólag sós bcrypt lenyomatok szerepelnek.
* Auth Guard: Manuálisan (Postman/Thunder Client segítségével) érvénytelen és lejárt JWT tokenekkel teszteltem a végpontokat, mindegyik szabályos `401 Unauthorized` hibát adott.

**3. Reprodukálható futtatás**
A backend úgy lett felépítve, hogy fejlesztési környezetben automatikusan SQLite adatbázist használ (`check_same_thread=False` beállítással), így a bírálónak nem kell PostgreSQL szervert konfigurálnia a projekt elindításához. A rendszer egyetlen parinccsal lokálisan is futtatható a `README.md` alapján.

**4. Teljesítmény és UX validáció**
A kliensoldali felületet Chrome DevTools mobil szimulátorral (iPhone 14 és Pixel 7 méreteken) validáltam. A napi naplózó modális ablak input mezőit a tesztek során ujjbegyes (Touch) csúszkákra (range slider) cseréltem, ami megszüntette a mobil billentyűzet általi takarást és felgyorsította az adatbevitelt.