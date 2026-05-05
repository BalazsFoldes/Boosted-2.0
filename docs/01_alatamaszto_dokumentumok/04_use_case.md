# Use case specifikáció: Boosted

## 1. Use case lista
| ID | Név | Aktor | Rövid cél | Prioritás | Érintett követelmények |
|---|---|---|---|---|---|
| **UC-01** | Szerepköralapú bejelentkezés | Vendég | Hozzáférés a zárt edzői vagy kliens funkciókhoz. | Must | FK-01, NFK-01, NFK-02 |
| **UC-02** | Kliens meghívása és regisztrációja | Edző, Vendég | Új kliens hozzákapcsolása az edző portfóliójához biztonságos tokennel. | Must | FK-02, NFK-01 |
| **UC-03** | Napi biometrikus naplózás rögzítése | Kliens | Életmódbeli adatok (alvás, stressz, stb.) mentése az adatbázisba. | Must | FK-03, NFK-03 |
| **UC-04** | Dinamikus AI Dashboard elemzés | Edző, Kliens | Generatív AI segítségével összefüggések keresése a naplózott adatokban. | Must | FK-04, NFK-04 |
| **UC-05** | Heti edzésterv szerkesztése | Edző | Strukturált, idősávos edzésterv összeállítása a kliens számára. | Must | FK-05 |
| **UC-06** | Motivációs Boost küldése | Edző | Gamifikált pozitív visszajelzés küldése az aktív kliensnek. | Must | FK-06 |
| **UC-07** | Kapcsolat megszakítása | Edző, Kliens | Közös munka befejezése és a kliens adatainak biztonságos törlése. | Should | FK-07 |

---

## 2. Use case részletes lapok (Kritikus MVP folyamatok)

### UC-02: Kliens meghívása és regisztrációja
| Mező | Tartalom |
|---|---|
| **ID** | UC-02 |
| **Név** | Kliens meghívása és regisztrációja |
| **Elsődleges aktor** | Edző (generálás), Vendég (felhasználás) |
| **Előfeltétel** | Az Edző be van jelentkezve a rendszerbe. |
| **Trigger** | Az Edző az "Új kliens meghívása" gombra kattint, majd a Vendég megnyitja a kapott URL-t. |
| **Fő sikeres lefutás** | 1. Az edző generál egy 32 bájtos URL-safe tokent. <br> 2. A rendszer elmenti az `invites` táblába a tokent a 24 órás lejárati idővel és az edző azonosítójával (coach_id). <br> 3. A vendég megnyitja a linket (`/register-client?token=...`). <br> 4. A frontend (Next.js) ellenőrzi a tokent a backend API-n keresztül. <br> 5. Sikeres validáció esetén a vendég megadja a jelszavát és a nevét. <br> 6. A backend bcrypt-tel hasheli a jelszót, elmenti a usert `CLIENT` szerepkörrel, hozzáköti az edzőhöz (`coach_id`), majd "használtra" (`used=True`) állítja a tokent. |
| **Alternatív lefutás (Hibaágak)** | - A link több mint 24 órás (lejárt token): Hibaüzenet, a regisztrációs űrlap nem jelenik meg. <br> - A linket már felhasználták (`used=True`): 404 Not Found vagy 400 Bad Request HTTP hiba. <br> - A kliens által megadott email már létezik: 400-as hiba, "Ez az email már regisztrálva van!". |
| **Utófeltétel** | Új Kliens jön létre, aki automatikusan az őt meghívó Edző portfóliójához tartozik. |
| **Tesztek** | TC-AUTH-02 |

<br>

### UC-03: Napi biometrikus naplózás rögzítése
| Mező | Tartalom |
|---|---|
| **ID** | UC-03 |
| **Név** | Napi biometrikus naplózás rögzítése |
| **Elsődleges aktor** | Kliens |
| **Előfeltétel** | A kliens érvényes JWT tokennel be van jelentkezve. A mai napra még nem rögzített adatot. |
| **Trigger** | A kliens a "Adatok Rögzítése" gombra kattint a Dashboardon, és beküldi a DailyLog űrlapot. |
| **Fő sikeres lefutás** | 1. A React kliens összeállítja a payloadot (alvás, stressz, víz, hangulat, lépés, súly). <br> 2. A FastAPI backend a `DailyLogCreate` Pydantic sémával validálja a típusokat. <br> 3. A backend ellenőrzi, hogy van-e már a mai napon rekord az adatbázisban a `client_id` alapján. <br> 4. Új `DailyLog` entitás jön létre. Ha a payloadban volt testsúly, a `users` táblában lévő `current_weight` oszlop is frissül. <br> 5. A frontend sikeres választ kap (200 OK), a széria (Streak) újraszámolódik, a "Napi Feladat" banner állapota zöldre (teljesítve) vált. |
| **Alternatív lefutás (Hibaágak)** | - A kliens ma már naplózott (Dátumütközés): A backend 400-as hibát dob, "Erre a napra már rögzítettél adatot!". <br> - Érvénytelen adattípus (pl. szöveg a liter helyén): A Pydantic 422 Unprocessable Entity hibát dob, az adatbázis nem sérül. |
| **Utófeltétel** | A napló megjelenik a Kliens előzményeiben, és az Edző azonnal látja a Recharts grafikonjain. |
| **Tesztek** | TC-LOG-01, TC-SEC-02 |

<br>

### UC-04: Dinamikus AI Dashboard elemzés
| Mező | Tartalom |
|---|---|
| **ID** | UC-04 |
| **Név** | Dinamikus AI Dashboard elemzés |
| **Elsődleges aktor** | Edző, Kliens |
| **Előfeltétel** | Érvényes bejelentkezés, és megfelelő mennyiségű történeti adat a rendszerben. |
| **Trigger** | A felhasználó az "AI Asszisztens" fülre (lapfülre) kattint. |
| **Fő sikeres lefutás** | 1. A React kliens érzékeli a tab-váltást, és megjeleníti a "Neural Engine" töltőképernyőt. <br> 2. A frontend szerepkör alapján nyers sztringgé fűzi az aktuális kontextust (Kliens esetén: elmúlt 3 nap naplói; Edző esetén: csapat átlag stressz, riasztások). <br> 3. A backend a `generate_content` függvénnyel meghívja a Gemini (3.1 Flash Lite) API-t egy System Prompttal és a `{"response_mime_type": "application/json"}` direktívával. <br> 4. A Google szervereiről visszakapott JSON választ a backend feldolgozza (`json.loads`). <br> 5. A React frontend lecseréli a töltőképernyőt a strukturált, elemző "Bento Grid" kártyákra. |
| **Alternatív lefutás (Hibaágak)** | - Google API Rate Limit (túl sok kérés): A frontend elkapja az 500-as HTTP hibát, és a rendszerösszeomlás (fehér képernyő) helyett egy biztonságos, előre definiált "fallback" hibaállapotot (Hálózati Hiba kártya) renderel ki a felhasználónak. <br> - Nincs elég naplózott adat: Az AI elemzés el sem indul, a frontend figyelmezteti a klienst/edzőt az adathiányra. |
| **Utófeltétel** | A felhasználó a nyers adatok helyett egy strukturált, magyar nyelvű, proaktív mérnöki javaslatcsomagot olvas a képernyőn. |
| **Tesztek** | TC-AI-01, TC-AI-02 |