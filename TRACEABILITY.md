# Nyomonkövethetőség és Minőségbiztosítás

Ez a dokumentum rögzíti a Sprint 2 során megvalósított funkciók nyomonkövethetőségét, valamint a fejlesztési folyamat minőségi kapuit.

## 1. Traceability Matrix (Nyomonkövethetőségi Mátrix)

| User Story ID | Acceptance Criteria | Teszteset ID | Kód modul | CI Lépés |
| :--- | :--- | :--- | :--- | :--- |
| **STORY-1** | AC-1.1: Hidratáció sikeres mentése (pozitív egész szám) | `test_user_can_log_hydration_and_see_total_for_today` | `app/main.py` | `pytest` |
| **STORY-1** | AC-1.2: Hibás hidratáció elutasítása (negatív szám) | `test_invalid_hydration_shows_error` | `app/main.py` | `pytest` |
| **STORY-2** | AC-2.1: Hangulat mentése 1-5 skálán | `test_user_can_log_mood_and_view` | `app/main.py` | `pytest` |
| **STORY-4** | AC-4.1: Dashboard összegzés megjelenítése | `test_user_can_log_hydration_and_see_total_for_today` | `app/main.py` | `pytest` |
| **STORY-4** | AC-4.2: Üres dashboard üzenet megjelenítése | `test_dashboard_shows_message_when_no_data` | `app/main.py` | `pytest` |
| **TASK-8** | AC-8.1: Alkalmazás elindul és válaszol (Health check) | `smoke.sh` (curl /healthz) | `app/main.py` | `smoke test` |
| **TASK-10** | AC-10.1: Infrastruktúra kód szintaktikailag helyes | Terraform validate output | `infra/terraform/main.tf` | `terraform plan` |

---

## 2. Definition of Ready (DoR) - "Mikor állunk készen?"

Egy feladat (User Story vagy Task) akkor vehető be a sprintbe fejlesztésre, ha teljesülnek az alábbiak:

* **Világos leírás:** A feladat célja egyértelműen megfogalmazott (pl. "Mint felhasználó, szeretnék...").
* **Elfogadási Kritériumok (AC):** Definiálva vannak a feltételek, amiknek teljesülniük kell.
* **Függőségek tisztázva:** Minden szükséges eszköz, hozzáférés vagy előfeltétel rendelkezésre áll.
* **Becsülhető:** A feladat mérete elég kicsi ahhoz, hogy a sprintben teljesíthető legyen.

---

## 3. Definition of Done (DoD) - "Mikor vagyunk készen?"

Egy feladat akkor tekinthető befejezettnek, ha teljesülnek az alábbiak:

1.  **Kódolás:**
    * A funkció implementálva van és megfelel az elfogadási kritériumoknak (AC).
    * A kód követi a projekt stílusirányelveit.
2.  **Tesztelés:**
    * Unit/Acceptance tesztek megírva.
    * Minden teszt sikeresen lefut (Green build).
    * A tesztlefedettség eléri a minimum 60%-ot.
3.  **Dokumentáció:**
    * Traceability mátrix frissítve.
    * Releváns dokumentumok (pl. Wireframes, Terraform plan) csatolva.
4.  **Verifikáció:**
    * A CI/CD pipeline (Smoke test, Linting) hiba nélkül lefutott.
    * A változtatások bekerültek a verziókezelőbe (Git push).