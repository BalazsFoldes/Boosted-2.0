# Architektúra és ADR (Architecture Decision Record): Boosted

## 1. Fő minőségi célok
| Attribútum | Elvárás | Következmény a tervben |
|---|---|---|
| **Biztonság** | Érzékeny biometrikus adatok és edzői portfóliók szigorú elkülönítése. | JWT alapú állapotmentes (stateless) hitelesítés, bcrypt jelszótitkosítás, Pydantic alapú szigorú bemenet-validáció. |
| **Karbantarthatóság** | Frontend vizualizáció és Backend üzleti logika lazán csatolt (decoupled) kapcsolata. | Kliens-szerver architektúra REST API-val összekötve. Külön repozitórium vagy logikai mappa a Reactnak és a FastAPI-nak. |
| **Teljesítmény** | Gyors reagálású UI, hálózati blokkolódás nélküli AI API hívások. | Aszinkron (async/await) hívások a backendben, React State alapú UI frissítések oldalújratöltés nélkül. |

---

## 2. Architektúra Döntési Napló (ADR)

### ADR-001: Backend keretrendszer kiválasztása
| Mező | Tartalom |
|---|---|
| **ADR ID** | ADR-001 |
| **Döntési pont** | Backend API keretrendszer és nyelv kiválasztása |
| **Kontextus** | A rendszernek gyors REST API végpontokat kell kiszolgálnia, szigorúan validálnia kell az adatokat (pl. napi naplók), és hatékonyan kell integrálnia a Google Gemini AI-t. |
| **Alternatívák** | Node.js (Express), Python (Django), Python (FastAPI) |
| **Döntés** | **Python (FastAPI)** |
| **Indoklás** | Mivel a mesterséges intelligencia integrációja a projekt kulcseleme, a Python ökoszisztéma használata volt a legésszerűbb. A Django túl robusztus (monolitikus) lett volna egy tisztán API-t szolgáltató backendhez. A FastAPI aszinkron (ASGI) alapú, villámgyors, és natívan integrálja a Pydantic modellt a kérések validálására, így az adatintegritás már a végpontok elérése előtt garantált. |
| **Kockázat** | A FastAPI viszonylag új keretrendszer a Django-hoz képest, a fejlesztői közössége kisebb, így bizonyos egyedi problémákra kevesebb a kész megoldás. |
| **Validáció** | A Pytest és a FastAPI `TestClient` használatával az API végpontok (beleértve a hibaágakat is) sikeresen és gyorsan tesztelhetők memóriaszivárgás nélkül. |

<br>

### ADR-002: Szétválasztott (Decoupled) Felhőarchitektúra
| Mező | Tartalom |
|---|---|
| **ADR ID** | ADR-002 |
| **Döntési pont** | A webalkalmazás élesítési (deployment) stratégiája |
| **Kontextus** | A frontend (React) és a backend (FastAPI) más futtatókörnyezetet igényel. A célnak egy modern, CI/CD-vel támogatott, skálázható architektúrát kell támogatnia. |
| **Alternatívák** | Monolitikus szerver (pl. minden egyetlen VPS-en futtatva), vagy Serverless / PaaS szétválasztás (Vercel + Render + külső DB). |
| **Döntés** | **Szétválasztott PaaS architektúra (Vercel a Frontendnek, Render a Backendnek, Neon.tech a DB-nek)** |
| **Indoklás** | A szétválasztás garantálja, hogy ha a frontend megnövekedett forgalmat kap, a Vercel CDN-je globálisan kiszolgálja azt anélkül, hogy a Python backendet terhelné. A Neon.tech (PostgreSQL) biztosítja, hogy a lokális SQLite fejlesztésből zökkenőmentesen lehessen éles, felhős relációs adatbázisra váltani. |
| **Kockázat** | A különböző szolgáltatások közötti hálózati latencia (késleltetés) megnőhet, és a CORS (Cross-Origin Resource Sharing) beállításokat szigorúan menedzselni kell. |
| **Validáció** | A GitHub commitok automatikusan (CI/CD) triggerelik a build folyamatokat, az alkalmazás a felhőből sikeresen, a `fetch` hívások blokkolása nélkül működik a megadott URL-eken. |