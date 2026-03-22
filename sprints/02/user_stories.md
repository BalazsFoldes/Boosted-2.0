## STORY-1: Hidratáció naplózása (kritikus)
**Story:**  
Regisztrált felhasználóként szeretném rögzíteni a napi vízfogyasztásomat, hogy nyomon követhessem a hidratációs céljaimat.

### Acceptance Criteria (AC)
**AC-1.1**
Scenario: Felhasználó sikeresen rögzíti a vízfogyasztását
    Given be vagyok jelentkezve "Flóra" felhasználóként
    And a dashboard oldalon vagyok
    When beírom a "Vízfogyasztás" mezőbe, hogy "500" ml
    And rákattintok a "Mentés" gombra
    Then a dashboardon megjelenik, hogy a mai vízfogyasztásom "500 ml"

**AC-1.2**
Scenario: Érvénytelen adat bevitele (negatív érték)
    Given be vagyok jelentkezve "Flóra" felhasználóként
    When beírom a "Vízfogyasztás" mezőbe, hogy "-100" ml
    Then a hibajelzés jelenik meg: "Kérjük adj meg pozitív számot."
    And az adat nem kerül mentésre

**AC-1.3**
Scenario: Többszöri mentés összeadódik ugyanazon a napon
    Given be vagyok jelentkezve "Flóra" felhasználóként
    When először mentek "300" ml-t ma
    And másodjára mentek "200" ml-t ma
    Then a dashboardon a mai összes vízfogyasztás "500 ml"


## STORY-2: Hangulat naplózása
**Story:**  
Felhasználóként szeretném rögzíteni a napi hangulatomat (1–5), hogy lássam a trendet és összefüggéseket a többi adatommal.

**AC-2.1**
Scenario: Felhasználó sikeresen rögzíti a mai hangulatát
    Given be vagyok bejelentkezve
    When kiválasztom a hangulatom "4" értéket és rákattintok a "Mentés"-re
    Then a dashboardon megjelenik a mai hangulati érték: "4"

**AC-2.2**
Scenario: Rossz formátumú adat
    Given be vagyok bejelentkezve
    When beírok egy 6-os értéket (skála 1-5)
    Then a hibajelzés jelenik meg:"A hangulat értéke 1 és 5 között lehet."
    And az érték nem mentődik


## STORY-3: Regisztráció és bejelentkezés
**Story:**  
Új felhasználóként szeretnék regisztrálni és bejelentkezni, hogy személyes adataimhoz hozzáférhessek.

**AC-3.1**
Scenario: Sikeres regisztráció és email-verifikáció nélkül (dev mode)
    Given nincs felhasználói fiókom
    When kitöltöm a regisztrációs űrlapot (email, jelszó) és elküldöm
    Then a fiókom létrejön és kapok 201 Created választ

**AC-3.2**
Scenario: Sikeres bejelentkezés
    Given létrehoztam az accountot
    When bejelentkezem az email/jelszó párossal
    Then kapok egy érvényes session token-t / JWT-t


## STORY-4: Dashboard megjelenítés (aznapi adatok)
**Story:**  
Felhasználóként szeretném, hogy a dashboardon lássam az aznapi hidratációs és hangulat adatokat, hogy gyors visszajelzést kapjak.

**AC-4.1**
Scenario: Dashboard megjeleníti az aznapi adatokat
    Given be vagyok jelentkezve
    And ma már mentettem "500 ml" hidratációt és hangulat "4"-et
    When megnyitom a dashboardot
    Then látom: "Mai vízfogyasztás: 500 ml" és "Mai hangulat: 4"

**AC-4.2**
Scenario: Üres állapot
    Given be vagyok bejelentkezve
    And még nem mentettem ma adatot
    When megnyitom a dashboardot
    Then látok egy üzenetet: "Ma még nem rögzítettél adatot — kezdj el ma!"


## STORY-5: Hibakezelés és offline-érzékenység (alap)
**Story:**  
Felhasználóként szeretném, hogy ha a szerver nem érhető el, a rendszer barátságos hibát jelezzen, és megkísérelje újraküldeni (ha offline cache megoldás van).

**AC-5.1**
Scenario: Szerverhiba esetén felhasználói üzenet
    Given be vagyok bejelentkezve
    When a mentési kérést a szerver 5xx-kal visszadobja
    Then az UI megjelenít egy "Hiba történt, próbáld később" üzenetet

**AC-5.2**
Scenario: Offline mentés sorban állítva
    Given nincs hálózat
    When megnyomom a "Mentés" gombot
    Then az adat lokálisan elmentődik és státusza "queued"
    And hálózat visszatérésekor automatikusan elküldésre kerül


---------------------------------------------------

## TASK-8: Smoke Test és Health Check
**Story:**
Fejlesztőként szükségem van egy egyszerű ellenőrző mechanizmusra (Smoke test), hogy telepítés után azonnal lássam, fut-e az alkalmazás.

**AC-8.1**
Scenario: Health check végpont válaszol
    Given az alkalmazás elindult a szerveren
    When meghívom a "/api/healthz" végpontot
    Then a rendszer 200 OK választ ad és egy JSON státuszt {"status": "ok"}

## TASK-10: Infrastructure as Code (IaC)
**Story:**
DevOps mérnökként szeretném az adatbázis infrastruktúrát kódként kezelni (Terraform), hogy a környezet reprodukálható legyen.

**AC-10.1**
Scenario: Terraform validáció
    Given rendelkezem a "infra/terraform" mappában a definíciós fájlokkal
    When lefuttatom a "terraform validate" parancsot
    Then a kimenet megerősíti, hogy a konfiguráció szintaktikailag helyes