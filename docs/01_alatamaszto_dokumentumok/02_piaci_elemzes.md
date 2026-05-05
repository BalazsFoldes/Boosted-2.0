# Piaci / területi elemzés: Boosted

## Cél
A Boosted koncepciójának megalkotása előtt a piacvezető edzésnaplózó és edző-kliens platformokat vizsgáltam meg. A cél annak bizonyítása, hogy a Boosted nem csupán egy létező applikáció klónja, hanem a versenytársak hiányosságaira – különös tekintettel az AI integrációra, az adatvezérelt életmód-naplózásra és a gamifikációra – ad konkrét mérnöki választ.

## Összehasonlító táblázat

| Megoldás | Célcsoport | Fő funkciók | Erősségek | Hiányosságok | UX tanulság | Technológiai / biztonsági tanulság | Saját rendszerre következtetés | Forrás |
|---|---|---|---|---|---|---|---|---|
| **Trainerize** | Személyi edzők, fitneszstúdiók | Heti edzéstervezés, videós gyakorlatok, alap fizikai paraméterek rögzítése. | Zárt, meghívó-alapú rendszer, kiterjedt portfóliómenedzsment. | Túlzott fókusz a súlyokra/ismétlésekre; az életmódbeli (alvás, stressz) naplózás nem hangsúlyos. Nincs AI elemzés. | A funkciók túlzsúfoltsága sokszor lassítja a napi használatot. | A privát meghívórendszer (token-alapú regisztráció) biztonsági szempontból bevált módszer. | Átveszem a zárt regisztráció logikáját (csak token alapú kliens csatlakozás). | [trainerize.com](https://www.trainerize.com) |
| **MyFitnessPal** | Végfelhasználók (átlagos kliensek) | Táplálkozásnaplózás, kalóriaszámlálás, lépésszám és vízfogyasztás követése. | Hatalmas adatbázis, gamifikált beviteli elemek, könnyű napi használat. | Nincs dedikált "Edzői" nézet és portfóliókezelés, így a közös munka transzparenciája hiányzik. | A napi adatbevitelnek másodpercek alatt kell megtörténnie, különben a felhasználó lemorzsolódik. | A harmadik féltől származó adatbázisok (étel makrók) bevonása MVP szinten túl nagy komplexitást jelent. | A napi naplózást csúszkákkal (slider) gyorsítom fel, és elhagyom a komplex kalóriaszámolást a biometrikus trendek (stressz, alvás) javára. | [myfitnesspal.com](https://www.myfitnesspal.com) |
| **TrainingPeaks** | Professzionális állóképességi sportolók és edzőik | Adatalapú teljesítménykövetés, grafikonok, túlterhelés-figyelmeztetések. | Extrém részletes analitika és privát edzői jegyzetelési lehetőség. | Elavult, túlzsúfolt UI. Átlagos fitneszcélú felhasználók számára túl komplex. | A túl sok adat vizuális zajt okoz, ami elriasztja az átlagos klienst. | A riasztási rendszerek működnek, de statikus küszöbértékeken alapulnak, nem dinamikus (AI) mintázatfelismerésen. | A UI-t Bento Grid és Glassmorphism stílusokkal teszem letisztulttá. A nyers adatok helyett az AI (Gemini) értelmezi a trendeket, és szöveges javaslatokat ad az edzőnek. | [trainingpeaks.com](https://www.trainingpeaks.com) |

## Kötelező konklúzió

**Milyen hiányt találtam a meglévő megoldásokban?**
A piacon jól elkülönülnek a laikusoknak szóló, egyszerű applikációk (MyFitnessPal) és a túlzottan komplex edzői rendszerek (TrainingPeaks). Hiányzik a híd a kettő között: egy olyan platform, ahol az adatbevitel játékos és gyors (mint a végfelhasználói appoknál), de a háttérben mély, szakmai elemzést nyújt az edző számára. Továbbá a vizsgált rendszerek egyike sem integrál modern LLM (Large Language Model) alapú AI-t a megelőző egészségügyi elemzésekhez.

**Milyen funkciókat érdemes megtartani az MVP-ben?**
- Zárt, token-alapú edző-kliens kapcsolatfelvétel (biztonság).
- Heti tervező és privát edzői jegyzetek.
- Napi életmódbeli adatok (stressz, alvás, víz) grafikonos vizualizációja.

**Milyen funkciókat kell tudatosan kihagyni?**
- Élelmiszer-adatbázis és vonalkód-olvasó integrálása (túl nagy API függőség, nem a projekt fő profilja).
- Részletes pulzus- és watt-alapú edzéstervezés (a TrainingPeaks komplexitásának elkerülése).
- Beépített videós gyakorlatkönyvtár saját hosztolással (a fájltárolás drága és lelassítaná az MVP-t).

**Milyen UX vagy biztonsági hibákat kell elkerülni?**
- **UX:** El kell kerülni az "adatsűrűséget". A klienseknek csak a legszükségesebb információkat és egyértelmű napi teendőket (pl. "Napi Feladat" banner) szabad látniuk. Az összetett grafikonokat az Edzői Dashboardra kell korlátozni.
- **Biztonság:** Mivel életmódbeli és egészségügyi (súly, stressz) adatokról van szó, a kliensek regisztrációját nem szabad publikusan nyitottá tenni. A regisztrációs URL-eknek kriptográfiailag biztonságos (`secrets.token_urlsafe`) tokeneket kell használniuk, hogy az edző portfóliójába illetéktelenek ne csatlakozhassanak.