# Funkcionális és nem funkcionális követelmények: Boosted

## 1. Funkcionális követelmények (MVP fókusz)

| ID | Követelmény | Felhasználói érték | Prioritás | Elfogadási kritérium | Kapcsolódó use case | Kapcsolódó képernyő | Teszt ID |
|---|---|---|---|---|---|---|---|
| **FK-01** | Szerepköralapú hitelesítés (Edző / Kliens) | Csak az arra jogosult adatokhoz férhet hozzá a felhasználó. | Must | Helyes JWT token generálódik a belépéskor, lejárt token esetén 401-es hiba. | UC-01 | SCR-AUTH | TC-AUTH-01 |
| **FK-02** | Zárt, token-alapú kliens csatlakozás | Illetéktelenek nem regisztrálhatnak a rendszerbe, az edző védi a portfólióját. | Must | A kliens csak érvényes, 24 óránál nem régebbi, 32 bájtos kriptográfiai tokennel regisztrálhat. | UC-02 | SCR-INVITE | TC-AUTH-02 |
| **FK-03** | Napi biometrikus naplózás rögzítése | A kliens egyszerűen átadhatja az egészségügyi adatait az edzőnek. | Must | Napi 1 napló rögzíthető (duplikáció 400-as hibát dob). A testsúly mentése frissíti a profil adatlapját is. | UC-03 | SCR-DAILY-LOG | TC-LOG-01 |
| **FK-04** | AI Dashboard generálása (Neural Engine) | Az edző azonnali szakmai következtetéseket és riasztásokat kap a nyers adatokból. | Must | A backend a Gemini modelltől kapott adatot szigorúan érvényes JSON struktúraként adja vissza a frontendnek. | UC-04 | SCR-AI-DASH | TC-AI-01 |
| **FK-05** | Heti edzéstervek létrehozása és kezelése | Strukturált feladatkiosztás a két személyes találkozó között. | Must | Az edző a hétfői kezdőnappal JSON sztringként elmentheti a heti tervet az adatbázisba. | UC-05 | SCR-PLANNER | TC-PLAN-01 |
| **FK-06** | Gamifikáció: Boost küldése | Növeli a kliens elköteleződését és motivációját. | Must | Napi limit: egy kliensnek 24 órán belül csak egy Boost küldhető. A frontend vizuális értesítést ad. | UC-06 | SCR-COACH-DASH | TC-GAM-01 |
| **FK-07** | Kapcsolatbontás és Edzői értékelés | Szabadságot ad a kliensnek, illetve visszajelzést (rating) generál a szakértőnek. | Should | A kapcsolatbontás után a kliens adatai törlődnek, majd értékelheti az edzőt (1-5 csillag), ami módosítja az edző átlagát. | UC-07 | SCR-PROFILE | TC-DISC-01 |
| **FK-08** | PDF Edzésterv exportálás | Offline elérhetőséget biztosít a konditeremben lévő klienseknek. | Should | A jsPDF modul kliensoldalon, olvasható formátumban (Vezetéknév_Keresztnév_Dátum.pdf) legenerálja az aktív heti tervet. | UC-08 | SCR-COACH-DASH | TC-EXP-01 |

## 2. Nem funkcionális követelmények

| ID | Minőségi attribútum | Követelmény | Mérési mód | Célérték | Kapcsolódó teszt |
|---|---|---|---|---|---|
| **NFK-01** | Biztonság (Adatvédelem) | A jelszavak nem tárolhatók egyszerű szövegként az adatbázisban. | Adatbázis rekordok manuális ellenőrzése | 100% bcrypt sós titkosítás | TC-SEC-01 |
| **NFK-02** | Biztonság (API védelem) | Bemeneti adatok (Payload) védelme az injektálás és hibás típusok ellen. | Pydantic backend sémák tesztelése rossz adatokkal | 422 Unprocessable Entity hibaüzenet | TC-SEC-02 |
| **NFK-03** | Reszponzivitás (UX) | A kliensoldali funkciók (különösen a napi naplózás) mobiltelefonon is kompromisszummentesen használhatók legyenek. | Chrome DevTools mobilnézet (iPhone 14 / Pixel 7 méretek) vizuális tesztje | Horizontális görgetősáv (overflow-x) nélküli UI | TC-UX-01 |
| **NFK-04** | Hibatűrés (AI Timeout) | A Google Gemini API válaszképtelensége vagy Rate Limitje nem fagyaszthatja le a React frontendet. | Hálózati megszakítás / Timeout szimulálása | Felhasználóbarát hiba banner jelenik meg a végtelen töltés helyett. | TC-AI-02 |
| **NFK-05** | CI/CD és Reprodukálhatóság | A kód lokális környezetben gépfüggőség nélkül futtatható kell, hogy legyen SQLite memóriával. | Új gép repo klónozása + start-dev.bat futtatása | Sikeres futás < 5 perc alatt | TC-SYS-01 |

## Követelményminőség ellenőrzése
A fenti követelmények a Boosted 2.0 projekt MVP határait írják le. Minden funkcionális követelményhez egyértelmű HTTP végpont (Backend) és UI interakció (Frontend) tartozik, melyek automatizált vagy manuális módon igazolhatóak az elfogadási kritériumok alapján.