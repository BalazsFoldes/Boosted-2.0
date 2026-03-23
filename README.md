# Boosted 2.0 – Personal Trainer Management & AI Analytics

Ez a projekt a szakdolgozatom központi eleme, amely egy modern, adatközpontú platformot kínál személyi edzők és klienseik számára. A **Boosted 2.0** célja, hogy az edzők ne csak a súlyokat és az ismétlésszámokat lássák, hanem a klienseik biometrikus és életmódbeli adatait (alvás, stressz, energia) is, amelyekből az MI automatizált riportokat generál.

## 🚀 Főbb funkciók
- **Coach Dashboard:** Átlátható felület az edzőknek a kliensek napi állapotának követésére.
- **Client Daily Logs:** Egyszerű, csúszkás felület a klienseknek (alvás, stressz, víz, hangulat).
- **AI-Powered Insights:** Automatikus trendelemzés és összefoglaló jelentések készítése a napi adatokból.
- **Invitation System:** Biztonságos, edző által generált meghívó alapú regisztráció a klienseknek.

## 🛠 Technológiai stack
- **Frontend:** Next.js 16+, Tailwind CSS 4, TypeScript
- **Backend:** Python 3.x, FastAPI
- **Database:** PostgreSQL (vagy SQLite fejlesztés alatt)
- **Data Engineering:** Pandas az adatelemzéshez, OpenAI/Gemini API a riportokhoz.

## 📂 Felépítés
- `/frontend`: A Next.js webalkalmazás
- `/app`: A FastAPI szerver és az adatbázis-logika
- `/docs`: Dokumentáció és tervek