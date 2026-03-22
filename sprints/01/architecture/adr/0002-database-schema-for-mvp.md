# 0002: Database schema for MVP

- **Dátum:** 2025-12-09
- **Státusz:** Elfogadva

## Kontextus
A Boosted MVP célja, hogy a felhasználók rögzíthessék napi **hidratációs** és **hangulat** adataikat, valamint hogy ezeket a dashboardon megjeleníthessék.  
Az adatok tárolásának kellően rugalmasnak és bővíthetőnek kell lennie, hogy a jövőben további metrikákat (pl. alvás, edzés) is támogasson.

## Döntés
Két fő entitást hozunk létre a PostgreSQL adatbázisban:

### Felhasználók (`users`)
| oszlop         | típus         | megjegyzés                     |
|----------------|---------------|--------------------------------|
| id             | UUID (PK)     | Egyedi azonosító               |
| email          | VARCHAR(255)  | Egyedi, kötelező               |
| password_hash  | VARCHAR(255)  | Biztonságos jelszó-tárolás     |
| created_at     | TIMESTAMP     | Fiók létrehozásának ideje      |
| updated_at     | TIMESTAMP     | Utolsó módosítás ideje         |

### Hidratációs adatok (`hydration`)
| oszlop         | típus         | megjegyzés                     |
|----------------|---------------|--------------------------------|
| id             | UUID (PK)     | Egyedi azonosító               |
| user_id        | UUID (FK)     | `users.id`                     |
| amount_ml      | INTEGER       | Fogyasztott vízmennyiség       |
| entry_date     | DATE          | A nap dátuma                   |
| created_at     | TIMESTAMP     | Rögzítés ideje                 |

### Hangulat adatok (`mood`)
| oszlop         | típus         | megjegyzés                     |
|----------------|---------------|--------------------------------|
| id             | UUID (PK)     | Egyedi azonosító               |
| user_id        | UUID (FK)     | `users.id`                     |
| mood_score     | SMALLINT      | Érték 1–5                      |
| entry_date     | DATE          | A nap dátuma                   |
| created_at     | TIMESTAMP     | Rögzítés ideje                 |

### Megfontolt alternatívák
- **Egyetlen táblában minden adat típushoz:**  
  Könnyebb lett volna egy `entries` táblát használni minden metrikára `type` oszloppal, de az osztott táblák jobban olvashatóvá teszik a lekérdezéseket, különösen az MVP-ben.
- **NoSQL (pl. MongoDB):**  
  Rugalmasságot adna a változó adatstruktúrákhoz, de a relációs lekérdezések (összesítések, napi statisztikák) PostgreSQL-ben egyszerűbbek.
- **UUID helyett auto-increment integer:**  
  Egyszerűbb, de UUID biztosítja a globális egyediséget és biztonságosabb a frontend és API integrációban.

## Következmények
- Az MVP során a táblák lehetővé teszik:
  - napi hidratáció és hangulat mentését,
  - aznapi összesítés lekérdezését,
  - a későbbi metrikák bővítését.
- A relációs modell támogatja a felhasználói adatok és a különböző mérések összekapcsolását.
- A jövőben könnyen hozzáadható új entitás (pl. alvás, edzés) anélkül, hogy az alapstruktúrát módosítani kellene.