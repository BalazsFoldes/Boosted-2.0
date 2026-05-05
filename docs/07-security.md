# Biztonsági összefoglaló

A Boosted platform fejlesztése során kiemelt figyelmet kapott a biztonságtudatos tervezés (Security by Design). Az alábbiakban a rendszer legfontosabb védelmi vonalait foglalom össze.

## Cross-Site Scripting (XSS)

A felhasználók által megadott adatok (pl. bemutatkozás szövege, napló megjegyzések, AI chat üzenetek) sosem futnak le nyers HTML vagy JavaScript kódként a felületen. A React keretrendszer beépített adatkötési mechanizmusa automatikusan "escape"-eli a bemeneteket, így a rosszindulatú scriptek beágyazása és lefutása megelőzhető.

## Input validáció

A kliensoldali űrlap-ellenőrzésen túl a legfőbb védvonalat a szerveroldal jelenti. A FastAPI keretrendszerbe integrált Pydantic modellek (pl. `ProfileUpdate`, `DailyLogCreate`) szigorúan ellenőrzik a beérkező adatok típusát és formátumát. Hibás adatszerkezet esetén a szerver a feldolgozás megkezdése előtt automatikus HTTP 422 (Unprocessable Entity) hibát dob. További mélységi védelem az SQL Injection (SQLi) ellen az SQLAlchemy ORM használata, amely automatikusan paraméterezett lekérdezéseket futtat a nyers SQL stringek helyett.

## AAA és Credential-kezelés

*   **Hitelesítés (Authentication) és Jelszavak:** A felhasználók azonosítása állapotmentes JSON Web Tokenekkel (JWT) történik. A jelszavak sosem kerülnek egyszerű szövegként (plain-text) mentésre; a rendszer a kriptográfiailag biztonságos, "sózott" (salted) `bcrypt` algoritmust használja a jelszó-hashek tárolására.
*   **Jogosultság (Authorization):** A védett végpontokon egy központi `get_current_user` API őr (guard) ellenőrzi a token érvényességét. A rendszer szerepkör-alapú ellenőrzést (IDOR védelem) is végez az üzleti logikában: egy kliens tokenjével például szerveroldalról le van tiltva, hogy egy másik felhasználó profilját módosítsa, vagy edzői funkciókat érjen el.
*   **Titkosítás (Credential Management):** Az alkalmazás kritikus kulcsai (JWT `SECRET_KEY`, `GEMINI_API_KEY`) környezeti változókból (`.env` fájl) töltődnek be a futtatókörnyezetben. A verziókövető rendszerbe (Git) kizárólag egy minta fájl (`.env.example`) kerül fel, így nullára csökken a valós titkok kiszivárgásának esélye a forráskódból.

## Naplózás és Hibakezelés

Az alkalmazás robusztus hibakezeléssel rendelkezik. A szerver belső működését, a memóriacímeket, az adatbázis hibaüzeneteket vagy a külső szolgáltatók által visszaadott nyers válaszokat az API sosem küldi ki a kliens felé (ezzel elkerülve az architektúra információ-szivárgását). A külső AI szolgáltatások hívásait `try-except` blokkok védik, amelyek meghibásodás (pl. timeout vagy API korlátozás) esetén egy biztonságos HTTP 500-as fallback hibát generálnak, biztosítva, hogy az alkalmazás magja zavartalanul működjön tovább.

## Függőségek vizsgálata (Dependency Scan)

A harmadik féltől származó csomagok potenciális sérülékenységeit minimalizáljuk. A projekt a hivatalos csomagkezelők (`requirements.txt`, `package.json`) rögzített verziószámaira épít. További fejlesztési lépcsőként a repository integrálható a GitHub Dependabot szolgáltatásával, amely automatikus elemzést végez és riasztást küld, ha valamelyik felhasznált keretrendszerben biztonsági rést fedeznek fel.