# UX és képernyőspecifikáció: Boosted

## 1. Design célok
- **Szerepköralapú vizuális elkülönítés:** Az edzői felületek (mélykék/lila - megbízhatóság, fókusz), míg a kliens felületek (smaragdzöld/narancs - egészség, energia) eltérő színkódolást kaptak a gyors tájékozódás érdekében.
- **"Bento Grid" és "Glassmorphism":** Modern, kártyaalapú, áttetsző elrendezés az információk vizuális csoportosítására, elkerülve a TrainingPeaks-féle adatsűrűséget.
- **Teljeskörű reszponzivitás szerepkör-fókusszal:** A webalkalmazás mindkét szerepkör (Edző és Kliens) számára teljes értékű, mobilbarát (reszponzív) felülettel rendelkezik. A UI/UX tervezésénél azonban figyelembe vettem a várható használati szokásokat: a kliensek elsősorban mobiltelefonon fogják gyorsan rögzíteni az adataikat (ezért az ő felületük nagyméretű, mobilon könnyen tapintható elemekre és csúszkákra épül), míg az edzők a komplex grafikonok, a heti tervező és a portfólió áttekintése miatt várhatóan asztali gépen (desktop) fogják használni a rendszert.
- **Állapotvisszajelzések:** Dinamikus töltőképernyők (Spinners) a hosszú hálózati kéréseknél (pl. AI generálás), és színkódolt, felugró AppAlert értesítések (Siker/Hiba) a műveletek végén.

## 2. Képernyőspecifikáció (Fő nézetek)

| Képernyő ID | Név | Cél | Fő elemek | Kapcsolódó use case | Állapotok | Hibák és üzenetek | Reszponzivitás / Kialakítás |
|---|---|---|---|---|---|---|---|
| **SCR-AUTH** | Bejelentkezés / Regisztráció | Felhasználó azonosítása vagy szakértői regisztráció. | "Split-panel" űrlap, Email, Jelszó, Szerepkör választó, Belépés gomb. | UC-01 | Üres, Kitöltve, Betöltés (gomb letiltva) | 400-as backend hiba esetén dedikált AppAlert hibaüzenet (pl. "Hibás jelszó"). | Mobilon a panel függőlegesre vált, a branding kép eltűnik. |
| **SCR-COACH-DASH** | Edzői Dashboard | Portfólió és napi riasztások áttekintése. | Napi statisztika kártyák, AI Riasztások doboz, Klienslista (keresővel). | UC-06 | Betöltés (Adatok szinkronizálása spinner), Aktív, Üres (nincs kliens) | Ha nincs kliens, egy dedikált "Üres állapot" (Empty state) jelenik meg hívószóval a meghívó generálására. | Teljesen reszponzív, de asztali (desktop) használatra optimalizált, széles kártyás "Bento" elrendezés. |
| **SCR-CLIENT-DASH** | Kliens Dashboard | Napi teendők elvégzése és a fejlődés követése. | Napi Naplózó Banner (Dinamikus szín), Heti Fókusz naptár, Korábbi naplók listája. | UC-03 | Banner piros (nincs napló), Banner zöld (kész) | - | Várhatóan mobilon használt felület: a naptár horizontálisan görgethető (snap-x), a kártyák egymás alá rendeződnek. |
| **SCR-DAILY-LOG** | Napi Naplózó (Modál) | A napi életmód adatok gyors rögzítése. | Csúszkák (Alvás, Stressz, Intenzitás), Hangulat gombok, Mentés. | UC-03 | Csak "Edzettem" esetén nyílik le az intenzitás csúszka (Feltételes renderelés) | A validációt a backend Pydantic végzi, a hiba AppAlert-ben jelenik meg. | Kifejezetten ujjbegyes érintésre (Touch) méretezett csúszkák és gombok. |
| **SCR-AI-DASH** | AI Elemző Központ | A Gemini AI elemzéseinek megjelenítése. | Neural Engine töltőképernyő, 3 dinamikus kártya (Javaslatokkal), Összegző doboz. | UC-04 | Betöltés (Speciális AI spinner), Megjelenítve, API Hiba | Rate limit esetén biztonságos "Fallback" kártya jelenik meg ("Szerver túlterhelt"). | Futurisztikus, sötét témájú felület, mobilon a kártyák oszlopba rendeződnek. |

## 3. UX validáció és iterációk
A fejlesztés korai szakaszában a UI prototípust leteszteltem. A teszt során a következő feladatokat hajtottuk végre, és az alábbi visszajelzéseket építettem be a végleges (MVP) verzióba:

1. **Feladat: Napi biometrikus napló kitöltése mobiltelefonon (Kliens teszt)**
   * *Visszajelzés:* Az eredeti HTML text input (szám) mezők mobilon aprók voltak, és a billentyűzet megnyílása folyton eltakarta az űrlap alsó részét, frusztrálóvá téve az 1 perces naplózást.
   * *Módosítás:* A beviteli mezőket lecseréltem nagyméretű, színes `range input` csúszkákra (Slider), így a billentyűzet egyáltalán nem nyílik meg, az adatbevitel 3 másodpercre csökkent.
2. **Feladat: Értelmezni az AI által generált szöveges jelentést (Edző teszt)**
   * *Visszajelzés:* Az AI eredetileg egy hosszú, több bekezdéses folyószöveget (Markdown) adott vissza, amit a képernyőn nehéz volt gyorsan átfutni (skimming).
   * *Módosítás:* Megváltoztattam a Gemini System Promptját, és kikényszerítettem a `application/json` kimenetet. A szöveg helyett most rövidebb kulcs-érték párokat kap a backend, amelyeket a frontend különálló, könnyen olvasható kártyákra ("Javaslat" és "Mintázat" szekciók) bontva renderel ki.
3. **Feladat: Kliens keresése a listában (Edző teszt)**
   * *Visszajelzés:* Ha a listában sok kliens van, a felhasználó görgetéssel lassan találta meg a keresett személyt.
   * *Módosítás:* Beépítettem a listanézet fölé egy valós idejű, React State (`searchQuery`) alapú keresőmezőt, amely gépelés közben azonnal szűri a klienseket név és email cím alapján.