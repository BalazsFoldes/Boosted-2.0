# Követelmény Specifikáció (Requirements Specification)

## 1. Bevezetés
Ez a dokumentum a Boosted 2.0 alkalmazás funkcionális és nem funkcionális követelményeit rögzíti. A specifikáció célja, hogy pontos képet adjon a szoftver képességeiről, a mesterséges intelligencia (MI) integráció korlátairól, valamint a felhasználói és üzleti elvárásokról.

## 2. Felhasználói célcsoport
Az alkalmazás egy kétoldalú (two-sided) platform, amelynek célcsoportjai:
*   **Személyi edzők (Coaches):** Akik időt szeretnének spórolni a kliensek adatainak adminisztrációjával, és prediktív MI elemzésekre támaszkodva szeretnék megelőzni a kliensek lemorzsolódását vagy sérülését.
*   **Kliensek (Clients):** Akik strukturált edzésterveket várnak az edzőjüktől, és egy egyszerű, súrlódásmentes felületen szeretnék rögzíteni a napi fizikai és mentális paramétereiket (alvás, stressz, víz, edzés).

## 3. Funkcionális követelmények (Functional Requirements)
A funkcionális követelmények (FK) leírják a platform magfunkcióit az MVP fázisban:

*   **FK-01: Hitelesítés és Jogosultság:** A rendszernek JWT alapú, biztonságos bejelentkezést kell biztosítania, szigorúan elválasztva az Edzői és Kliens szerepköröket.
*   **FK-02: Edző-Kliens Kapcsolat:** Az edzőknek képesnek kell lenniük egyedi token alapú meghívó linkek generálására új kliensek csatlakoztatásához.
*   **FK-03: Napi Naplózás:** A kliensek napi szinten rögzíthetik a fizikai adataikat (duplikáció szűrésével).
*   **FK-04: Heti Tervezés:** Az edzők strukturált, hétfői kezdődátumú edzésterveket adhatnak ki a klienseknek.
*   **FK-05: AI Dashboard:** A rendszernek a Google Gemini API használatával prediktív, JSON-alapú statisztikákat és riasztásokat kell generálnia a kliens adatai alapján.
*   **FK-06: Szerepkör-specifikus AI Chat:** Beépített intelligens asszisztens, amely a bejelentkezett felhasználó szerepköre alapján kontextualizálja a válaszokat (szakmai segítség az edzőnek, motiváció a kliensnek).
*   **FK-07: Gamifikáció (Boost):** Az edzők egyetlen kattintással motivációs pontokat küldhetnek a klienseknek a lemorzsolódás csökkentése érdekében.
*   **FK-08: Értékelési rendszer:** A kliensek 1-5 csillagos skálán értékelhetik edzőjüket.

## 4. Nem funkcionális követelmények (Non-functional Requirements)
Ezek a követelmények a rendszer minőségére, biztonságára és működési tulajdonságaira vonatkoznak.

*   **4.1. Felhasználói felület (UI/UX) és Akadálymentesség**
    *   **Modern elrendezés:** A felület (Dashboard) modern "Bento Grid" kártyás elrendezést használ az átláthatóság érdekében.
    *   **Állapotok láthatósága:** Aszinkron és AI hívások alatt a rendszer "Skeleton loading" (betöltési csontváz) animációkkal jelzi a folyamatot.
    *   **Reszponzivitás:** A UI komponensek mobil és asztali böngészőkre is optimalizáltak.

*   **4.2. Teljesítmény és Robusztusság**
    *   **API válaszidő:** A standard (nem AI) backend lekérdezések p95-ös válaszideje lokális környezetben nem haladhatja meg az 500ms-ot.
    *   **AI Hibatűrés:** Külső API (Gemini) kimaradás vagy timeout esetén a backend nem omlik össze, hanem 500-as fallback hibát és barátságos hibaüzenetet küld a frontendnek.

*   **4.3. Biztonság**
    *   **Jelszóvédelem:** A jelszavak "salted bcrypt" algoritmussal hashelve kerülnek az adatbázisba (sima szöveg tárolása tilos).
    *   **SQL Injection védelem:** Minden adatbázis-művelet az SQLAlchemy ORM rétegén keresztül történik, paraméterezett lekérdezésekkel.
    *   **Adatvalidáció:** A FastAPI Pydantic sémákkal kényszeríti ki a bemeneti adatok típushelyességét (HTTP 422 védelem).

## 5. Jövőbeli fejlesztési lehetőségek (Out of Scope)
Az alábbi funkciók a tudatos MVP "scope management" miatt a jelenlegi fázisban nem kerültek beépítésre, de a jövőbeli skálázódás alapját képezik:
*   Fizetési kapu (Stripe/PayPal) integrációja az edzői előfizetések kezelésére.
*   Okosórák (Apple HealthKit / Google Fit) integrációja az alvás/pulzus adatok automatikus szinkronizálásához a manuális napi napló helyett.
*   Valós idejű, WebSocket alapú chat az edző és a kliens között (jelenleg az MI chat az elsődleges).