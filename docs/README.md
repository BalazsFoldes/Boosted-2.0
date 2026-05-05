# Boosted – Projekt dokumentáció

Ez a mappa a **Boosted** AI-alapú edző-kliens webalkalmazás teljes technikai, biztonsági és felhasználói dokumentációját tartalmazza.

A dokumentáció célja, hogy:
- áttekintést adjon a rendszer architektúrájáról és biztonságáról,
- bemutassa a tervezési döntések hátterét,
- leírja a megvalósítás és futtatás módját,
- transzparensen bemutassa az MI eszközök használatát a fejlesztés során,
- valamint támogassa a felhasználók és fejlesztők munkáját.

A dokumentáció Markdown formátumban készült, verziókövetett módon, a forráskóddal együtt kezelve.

---

## 1. Fő dokumentáció (Gyökérkönyvtár)

Ezek a fájlok a projekt legfontosabb, átfogó leírásait tartalmazzák:

- **[01-architecture.md](./01-architecture.md)** – A rendszer magas szintű architektúrája, komponensei, valamint a frontend–backend kapcsolat leírása.
- **[02-deployment-guide.md](./02-deployment-guide.md)** – A rendszer helyi futtatásának és indításának lépései, környezeti változók beállítása.
- **[03-user-documentation.md](./03-user-documentation.md)** – A rendszer végfelhasználói használatának leírása Edzői és Kliens szerepkörökből.
- **[04-requirements-specification.md](./04-requirements-specification.md)** – A rendszer funkcionális és nem funkcionális követelményeinek összefoglalása az MVP fázisra.
- **[05-developer-guide.md](./05-developer-guide.md)** – A projekt technológiai stackje, mappastruktúrája és a főbb komponensek bemutatása fejlesztők számára.
- **[06-ai-usage.md](./06-ai-usage.md)** – Az MI-eszközök fejlesztés közbeni felhasználásának transzparens naplója és a rendszerbe épített AI modul specifikációja.
- **[07-security.md](./07-security.md)** – A rendszer biztonsági mechanizmusainak (XSS védelem, hitelesítés, adatvalidáció) összefoglalója.

---

## 2. Alátámasztó dokumentumok (`01_alatamaszto_dokumentumok/`)

Ebben a mappában találhatók a szakdolgozatot támogató, részletes mérnöki tervezési és specifikációs fájlok, amelyek a fejlesztés alapját képezték:

- `01_MVP_brief.md` – A projekt alapvető céljai és a Minimum Viable Product meghatározása.
- `02_piaci_elemzes.md` – Konkurenciavizsgálat és piaci pozicionálás.
- `03_kovetelmenyek.md` – Részletes FK és NFK követelménylista.
- `04_use_case.md` – Use case leírások és folyamatok.
- `05_UX_screen_spec.md` – Képernyőspecifikációk és UX/UI tervek.
- `06_architecture_ADR.md` – Architektúra Döntési Napló (Architecture Decision Records).
- `07_adatmodell.md` – Az adatbázis entitások és relációk leírása.
- `08_modulok_interfeszek_API.md` – API végpontok és modulhatárok specifikációja.
- `09_biztonsagi_minimum.md` – Biztonsági ellenőrzőlista.
- `10_teszteles_validacio.md` – Teszttervek, tesztesetek és nyomonkövetési (Traceability) mátrix.
- `11_MI_hasznalati_nyilatkozat_es_naplo.md` – Részletes AI használati log.
- `12_reprodukcios_README.md` – A környezet reprodukálhatósági ellenőrzőlistája.

---

## 3. Táblázatok és Ábrák

- **Táblázatok (`02_excel/`):** 
  - `szakdolgozat_alatamaszto_tablazat.xlsx` – A projekt összes (Use Case, ADR, Traceability, Teszt) táblázatának mesterfájlja.
- **Ábrák (`03_abra/`):** 
  - `adatmodell_mermaid.md` – ER diagram (Entity-Relationship) Mermaid formátumban.
  - `component_architecture.puml` – Rendszerkomponens ábra PlantUML formátumban.
  - `sequence.puml` – Szekvenciadiagram a bejelentkezési folyamathoz.
  - `use_case.puml` – Átfogó Use Case diagram az aktorokkal.

---

## 4. További mellékletek

- **`adr/`** – Egyedi Architektúra Döntési Napló fájlok.
- **`ux/`** – Felhasználói felület (UI) és felhasználói élmény (UX) tervezési dokumentumok.
- **`image.png` / `image-1.png`** – A dokumentációkhoz tartozó beágyazott képek.
- **📄 `szakdolgozat_Foldes_Balazs_NYCLM8.pdf`** – A teljes, hivatalosan leadott szakdolgozat PDF formátumban.

---

## Megjegyzés
Ez a dokumentációs csomag a szakdolgozat szerves részeként és mellékleteként készült. A fájlok folyamatosan bővültek a fejlesztés előrehaladtával, szigorúan lekövetve a Boosted projekt szoftvermérnöki evolúcióját.