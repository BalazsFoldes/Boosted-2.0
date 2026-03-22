# Boosted – Projekt dokumentáció

Ez a mappa a **Boosted** AI-alapú egészség- és fitnesz webalkalmazás
teljes technikai és felhasználói dokumentációját tartalmazza.

A dokumentáció célja, hogy:
- áttekintést adjon a rendszer architektúrájáról,
- bemutassa a tervezési döntések hátterét,
- leírja a megvalósítás és futtatás módját,
- valamint támogassa a felhasználók és fejlesztők munkáját.

A dokumentáció Markdown formátumban készült, verziókövetett módon,
a forráskóddal együtt kezelve.

---

## 📌 Dokumentáció felépítése

### Architektúra és tervezés

- **[Software Architecture Document](./01-architecture.md)**  
  A rendszer magas szintű architektúrája, komponensei, valamint a frontend–backend kapcsolat leírása.

- **[Architecture Decision Records](./adr/0001-first-tech-choice.md)**  
  A technológiai stack kiválasztásának dokumentált indoklása, beleértve a FastAPI-re történő áttérést.

---

### Infrastruktúra és üzemeltetés (light)

- **[Deployment Guide](./02-deployment-guide.md)**  
  A rendszer helyi futtatásának és indításának lépései.

- **[Environment Configuration Guide](./03-environment-configuration.md)**  
  Környezeti változók, konfigurációs elvek és éles környezetre vonatkozó megfontolások.

---

### AI-asszisztált fejlesztés

- **[AI Development Log](./04-ai-development-log.md)**  
  Az AI-eszközök fejlesztés közbeni felhasználásának naplója, valamint az emberi döntések és módosítások bemutatása.

---

### Felhasználói és üzleti dokumentáció

- **[User Documentation](./05-user-documentation.md)**  
  A rendszer végfelhasználói használatának leírása (regisztráció, bejelentkezés, adatbevitel, dashboard).

- **[Requirements Specification](./06-requirements-specification.md)**  
  A rendszer funkcionális követelményeinek összefoglalása.

---

### Fejlesztői dokumentáció

- **[Developer Guide](./07-developer-guide.md)**  
  A projekt technológiai stackje, mappastruktúrája és a főbb komponensek bemutatása fejlesztők számára.

---

## Megjegyzés

A dokumentáció a szakdolgozat részeként készült, és annak mellékleteként is értelmezhető.
A fájlok folyamatosan bővültek a fejlesztés előrehaladtával, követve a projekt evolúcióját.
