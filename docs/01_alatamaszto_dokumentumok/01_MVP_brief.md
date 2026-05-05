# MVP brief: Boosted

## 1. Probléma és cél
- **Megoldandó probléma:** A piacon lévő hagyományos edzésnaplózók nem biztosítanak proaktív, valós idejű kapcsolatot az edző és a kliens között. A két személyes találkozó között a kritikus biometrikus és életmódbeli információk (alvás, stressz, folyadékbevitel) elvesznek, így a túledzés és a lemorzsolódás kockázata rejtve marad.
- **Célfelhasználók:** 
  1. Személyi edzők (szakértők), akik strukturáltan szeretnék menedzselni a portfóliójukat és skálázni a praxisukat.
  2. Kliensek, akik letisztult formában szeretnék rögzíteni a napi adataikat és strukturált visszajelzéseket várnak.
- **A termék ígérete:** Egy modern, adatalapú webalkalmazás, amely a napi naplózást összeköti a Gemini AI prediktív elemzéseivel. Automatikus kockázatelemzéssel (sérülés, kiégés) és beépített gamifikációval (szériák, Boost pontok) teszi biztonságosabbá, transzparensebbé és hatékonyabbá a közös munkát.

## 2. MVP határ
| Elem | MVP-ben benne van? | Indoklás | Elfogadási jel |
|---|:---:|---|---|
| Szerepköralapú hitelesítés és zárt meghívórendszer | Igen | Kritikus a jogosultságok elkülönítéséhez és az edző-kliens kapcsolat biztonságos fizikai összekötéséhez. | Kliens csak érvényes edzői tokennel tud regisztrálni, és csak a saját adatait látja. |
| Napi biometrikus naplózás és grafikonos vizualizáció | Igen | Az adatalapú működés és az AI elemzés elengedhetetlen alapfeltétele. | Kliens rögzíti az adatokat (csúszkákkal), az edző a Recharts grafikonokon azonnal látja azokat. |
| AI prediktív műszerfal (Neural Engine) | Igen | A projekt legfőbb innovációja; tehermentesíti az edzőt a nyers adatok elemzése alól. | A Gemini modell a naplókból strukturált, érvényes JSON formátumú kockázat- és célelemzést generál. |
| Rendszerszintű automatikus riasztások | Igen | Proaktív edzői beavatkozáshoz szükséges. | Az edzői Dashboardon megjelennek a figyelmeztetések (pl. 3 napja nem naplózott, vagy kritikus a stressz). |
| Gamifikációs modul (Boost és Streak) | Igen | A kliensek motivációjának fenntartásához elengedhetetlen (UX cél). | Széria számláló pontosan működik, a Boost küldése vizuális értesítést vált ki. |
| Heti edzésterv PDF exportálása | Igen | Az edzői szakmai munka offline átadásának bizonyítása (jsPDF integráció). | Kliens adatlapjáról generált, formázott PDF fájl tölthető le. |
| Külső okoseszköz szinkronizáció (Apple Health, Garmin) | Nem | Későbbi értéknövelő funkció, az MVP-ben túl nagy komplexitást jelentene. | Kézi adatbevitel hibátlanul működik az UI-on. |
| Valós fizetési kapu (Stripe) integrálása | Nem | A monetizáció nem része az MVP-nek. | A PRO csomag felülete (PremiumView) edukációs UI demóként jelenik meg. |

## 3. Nem célok
Ide kerülnek azok a dolgok, amelyek a szakdolgozatban leírt továbbfejlesztési lehetőségek részei, de tudatos mérnöki döntés alapján az MVP-ből kimaradtak a túlzott komplexitás elkerülése végett:
- Okosóra és egészségügyi API-k (Garmin, Apple Health) közvetlen integrálása.
- Makrotápanyag és kalória szintű komplex ételadatbázis létrehozása (a rendszer a fitnesz és biometria adatokra fókuszál, nem kalóriaszámláló).
- Natív mobilalkalmazás (App Store / Google Play) fejlesztése (helyette egy teljesen reszponzív, Tailwind CSS alapú "mobile-first" webalkalmazás készült).
- Valós fizetési rendszer (Stripe/PayPal) működtetése a prémium funkciók feloldásához.

## 4. Sikerességi mérőszámok
| Mérőszám | Célérték | Mérés módja |
|---|:---:|---|
| Kritikus API végpontok (Use case-ek) működése | 100% | Pytest alapú automatizált egységtesztek. |
| AI API válasz formátuma | 100% strukturált JSON | Nincs Markdown/HTML szivárgás a válaszban (Prompt engineering validáció). |
| Jogosultságkezelés (Auth Guards) | Hibátlan elkülönítés | Edző nem fér kliens végponthoz, lejárt JWT tokent a rendszer elutasít (401). |
| Sikeres telepítés és élesítés (CI/CD) | Igen | A repo README futtatási útmutatója alapján lokálisan indul, valamint a Vercel/Render felhőben fut. |