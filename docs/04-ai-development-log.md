# AI Development Log (AI Fejlesztési Napló)

## 1. Bevezetés
Ez a dokumentum a Boosted webalkalmazás fejlesztése során alkalmazott mesterséges intelligencia (AI) segítségnyújtás folyamatát, módszertanát és az elért eredményeket részletezi. A fejlesztés során az AI nem csupán kódgeneráló eszközként, hanem architekturális tanácsadóként és hibakereső partnerként is közreműködött.

## 2. Fejlesztési mérföldkövek és AI interakciók
* **2.1.** Architektúra és adatmodell tervezés
    Az AI segítségével határoztuk meg a rendszer rétegeit.

    AI hozzájárulása: A Pydantic modellek (User, DailyLog) struktúrájának kialakítása a FastAPI backendhez, biztosítva a típusbiztonságot és az automatikus validációt.

    Döntés: Az in-memory adatbázis melletti döntés az MVP fázisban a gyors prototipizálás érdekében.

* **2.2.** Frontend UI és Glassmorphism dizájn
    A felhasználói felület modern, lebegő navigációs sávjának és kártyáinak stílusát AI javaslatok alapján alakítottuk ki.

    AI hozzájárulása: Tailwind CSS osztályok generálása a "Glassmorphism" effekt eléréséhez (backdrop-blur-xl, bg-white/80).

    Komponens logika: Az Accordion és a dinamikus MoodIcon komponensek állapotalapú működésének implementálása.

* **2.3.** Gamifikációs logika (XP és Szintek)
    A rendszer magját képező tapasztalati pont (XP) számítás logikáját AI támogatással finomítottuk.

    AI hozzájárulása: Az algoritmus kidolgozása, amely 50 pontonként lépteti a szintet, és kiszámolja a következő szintig hátralévő százalékos haladást.

## 3. Prompt Engineering példák
A fejlesztés során az alábbi típusú utasításokat (prompteket) használtuk:

Strukturális prompt: "Készíts egy FastAPI végpontot, ami kezeli a napi hidratáció és hangulat rögzítését, adjon érte XP-t, és validálja a bemeneti adatokat."

UI/UX prompt: "Módosítsd a React Navbar komponensemet úgy, hogy egérmozgásra reagáló dinamikus gradiens fényt kapjon a háttérben."

Hibakeresési prompt: "A frontend 'Network Error'-t dob bejelentkezéskor, pedig a backend fut. Vizsgáld meg a CORS beállításokat és a fetch kérést."

## 4. Reflexió az AI használatára
Előnyök:
Gyorsaság: A boilerplate kódok (pl. API routerek, alap UI elemek) megírása töredék időt vett igénybe.

Tanulás: Az AI által javasolt megoldások (pl. useCallback használata a fetch függvényeknél) segítettek a React best-practice-ek mélyebb megismerésében.

Dokumentálás: Az architektúra és a telepítési útmutatók vázlatának elkészítése jelentősen felgyorsult.

## Kihívások:

Környezeti kontextus: Az AI néha olyan könyvtárakat javasolt, amelyek nem voltak a projekt részei, így manuális finomhangolásra volt szükség.

Logikai koherencia: A frontend és backend közötti adatstruktúra-egyezést folyamatosan ellenőrizni kellett.

## 5. Jövőbeli AI integráció (Roadmap)
A projekt távlati célja a jelenlegi statikus tanácsadó modul kiváltása egy valós idejű LLM (Large Language Model) integrációval, amely a rögzített hangulat és vízfogyasztási adatok alapján személyre szabott egészségügyi tanácsokat generál a felhasználónak.