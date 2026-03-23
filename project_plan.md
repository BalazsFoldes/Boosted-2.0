# Project Plan – Boosted

## Egy mondatos értékajánlat
Egy adatközpontú, gamifikált menedzsment platform személyi edzőknek és klienseiknek, amely a napi biometrikus adatokból (alvás, stressz, víz, hangulat) automatizált, AI-alapú trendelemzéseket és kiégés-megelőző riportokat készít.

## Képességek

| Képesség | Kategória | Komplexitás | Miért nem triviális? |
|---|---|---|---|
| **AI-alapú trendelemzés és riportok** | Value | L | Nyers idősoros adatok (time-series) előkészítése az LLM számára, prompt engineering, strukturált (JSON) válaszok kikényszerítése és API rate limit kezelése. |
| **Adatbázis architektúra és Data Pipeline** | Productization | L | Relációs adatmodell (SQLAlchemy) kialakítása edzők, kliensek és naplók között. Adatmigrációk (Alembic) és a későbbi elemzésekhez optimalizált lekérdezések írása. |
| **Szerepkör-alapú auth és meghívó rendszer** | Productization | M | Két eltérő útvonal (Coach regisztráció vs. Token-alapú Client onboarding). Lejáró JWT/biztonsági tokenek generálása és a Route-ok védelme (RBAC) a frontenden és backenden. |
| **Napi biometrikus naplózás és Gamifikáció** | Value | M | Dinamikus XP számítás, szinteződési logika, és visszamenőleges adatok integritásának biztosítása (kliens csak saját adatot írhat/olvashat). |
| **Interaktív Edzői Dashboard (UI/UX)** | Value | M | Összetett adathalmazok vizualizációja (kliens listák, trendek), aszinkron adatlekérések optimalizálása, React állapotkezelés (state management) és reszponzivitás. |
| **Egységes hibakezelés és adatvalidáció** | Productization | S | Pydantic modellek a backend API bemenetének szűrésére, valamint barátságos, felhasználóközpontú hibaüzenetek (pl. lejárt token, rossz jelszó) lekezelése a UI-on. |

*(Megjegyzés: 6 képesség, 3 Value, 3 Productization, 2 'L' komplexitású.)*

## A legnehezebb rész
Az AI integráció stabilizálása és a "hallucinációk" elkerülése. Nem fog elsőre tökéletesen működni, hogy az AI a kliens nyers, számszerű adataiból (pl. 3 napnyi 4 órás alvás és 5-ös stresszszint) egy olyan strukturált, szakmailag helyes riportot adjon vissza az edzőnek, ami vizuálisan is jól megjeleníthető a frontenden. Az LLM-ek hajlamosak eltérni a kért JSON formátumtól, így a válaszok validálása (Retry logika) komoly kihívás lesz.

## Tech stack – indoklással
| Réteg | Technológia | Miért ezt és nem mást? |
|---|---|---|
| **UI** | Next.js 14+ (React), Tailwind CSS v4 | A Next.js App Router kiválóan kezeli a szerepkör-alapú elrendezéseket (Layouts), a Tailwind pedig villámgyors és modern MVP fejlesztést tesz lehetővé. |
| **Backend / logika** | FastAPI (Python), Pydantic | A Python natív ökoszisztémája (Data Engineering, Pandas, OpenAI SDK) miatt kötelező. A FastAPI aszinkron sebessége és automatikus adatvalidációja iparági standard. |
| **Adattárolás** | SQLite (MVP) → PostgreSQL | A relációs integritás (Edző-Kliens kapcsolatok) miatt SQL szükséges. Az SQLAlchemy ORM biztonságos és könnyen skálázhatóvá teszi az átállást Postgres-re. |
| **Auth** | JWT (JSON Web Tokens), bcrypt | Lehetővé teszi a stateless (állapotmentes) hitelesítést a Next.js és a FastAPI között, harmadik feles szolgáltatók (pl. Firebase) korlátozásai és vendor lock-in nélkül. |

## Ami kimarad (non-goals)
- Valós idejű chat (WebSocket) funkció az edző és a kliens között.
- Beépített fizetési kapu (Stripe/PayPal) integrálása az első verzióban.
- Komplex étrend-tervező és kalóriaszámláló modul (más a projekt fókusza).

## Ami még nem tiszta
- Melyik AI modell lesz a legköltséghatékonyabb és legpontosabb a riportok generálására (pl. OpenAI GPT-4o-mini vs. Gemini 1.5 Flash).
- A kliens oldali állapotkezeléshez (State Management) elég lesz-e a React beépített eszközkészlete (Context API, useState), vagy szükség lesz egy külső könyvtárra (pl. Zustand), ahogy bonyolódik a Dashboard.