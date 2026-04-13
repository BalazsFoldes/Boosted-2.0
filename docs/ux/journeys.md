# Top 3 User Journey (Felhasználói Folyamat)

## 1. Kliens rögzíti a napi biometrikus adatait
**Cím + persona:** Tóth Anna (Kliens) túl van a mai edzésén, és szeretné minél gyorsabban jelezni az edzőjének a teljesítményét, illetve az aktuális fizikai állapotát.
**Belépési pont:** S04 (Kliens Dashboard — a felső figyelemfelkeltő "Ma még nem naplóztál" dobozból indulva).

**Lépések:**
1. (a) **S04**, (b) A felhasználó rákattint a "Napi Napló Hozzáadása" fekete CTA gombra. (c) A háttér elhomályosul, és felugrik az **S10** (Napi Napló Modal). (d) *Hibaág:* Nincs, a modal lokálisan nyílik meg.
2. (a) **S10**, (b) A kliens beállítja a csúszkákat (7 óra alvás, 4-es stressz), a vízmennyiségnél a `+` gombra kattint, majd kiválasztja az "Igen, edzettem" opciót, amely lenyitja az edzésidő csúszkát. Végül rábök a "Szuper" hangulat ikonra. (c) A UI vizuálisan követi az interakciókat: a számértékek valós időben frissülnek, a kiválasztott hangulat kártyája zöld keretet kap. (d) *Hibaág:* Nincs.
3. (a) **S10**, (b) Rákattint a lenti "Mentés" gombra. (c) A gomb állapota "Mentés..."-re vált (loading state és disabled állapot). A szerver válasza után a modal automatikusan bezárul, és egy zöld siker Alert (Popup) jelenik meg. (d) *Hibaág:* Hálózati hiba vagy hiányzó adat esetén a modal nyitva marad, és egy piros Alert ablak jeleníti meg a hiba okát.

**Sikerkritérium:** Az **S04** (Kliens Dashboard) fejléce zöldre vált ("Szuper, ma már naplóztál!"), a figyelmeztető gomb eltűnik, és az új bejegyzés azonnal megjelenik a "Korábbi naplózásaid" listában alul.
**Mért időtartam (kb.):** 15–20 másodperc (5-6 koppintás és csúsztatás).

---

## 2. Edző áttekinti a profitot és motivációs Boost-ot küld
**Cím + persona:** Kovács Péter (Személyi Edző) a nap végén átnézi a kliensei haladását, és szeretné egy apró gamifikációs gesztussal (Boost) motiválni azt a klienst, aki ezen a héten különösen jól teljesít.
**Belépési pont:** S03 (Edző Dashboard).

**Lépések:**
1. (a) **S03**, (b) Az edző beírja a keresőbe a kliens nevét, vagy a listából közvetlenül a megfelelő kliens sorában lévő "Megtekintés" gombra kattint. (c) Az oldal finom animációval betölti az **S05** (Kliens Adatlap) képernyőt. (d) *Hibaág:* Ha a keresőbe olyan nevet ír, ami nem létezik, az oldal egy vizuális "Nincs találat" üres állapotba (empty state) vált.
2. (a) **S05**, (b) Áttekinti az avatár melletti fizikai adatokat, a legutóbbi naplóbejegyzéseket és a Recharts statisztikai grafikont. (c) Látja a kliens aktuális állapotát és trendjeit. (d) *Hibaág:* Ha a kliensnek még nincs naplója, a grafikon helyén egy üres állapot ("Nincs megjeleníthető adat") látható.
3. (a) **S05**, (b) A jobb felső "⚡ Boost küldése" narancssárga gombra kattint. (c) Egy zöld siker popup jelenik meg, az edzői felületen a kliens profilképénél a "Boosted" számláló azonnal nő egyel. A gomb szürke, inaktív "Boost elküldve" állapotba vált. (d) *Hibaág:* Ha a kliens aznap már kapott Boost-ot, a gomb inaktív (disabled), és rákattintva egy információs (kék) Alert figyelmeztet a napi limitre.

**Sikerkritérium:** A rendszer rögzíti az eseményt. Amikor a kliens legközelebb belép az appba, azonnal fogadja őt az **S14** (Boost Modal) a motivációs üzenettel.
**Mért időtartam (kb.):** 10–15 másodperc (2-3 kattintás).

---

## 3. Edző összeállítja a kliens heti edzéstervét
**Cím + persona:** Nagy Gábor (Edző) egy új mikrociklust tervez az egyik kiemelt versenyzőjének, napokra és időpontokra bontva a feladatokat.
**Belépési pont:** S05 (Kliens Adatlap).

**Lépések:**
1. (a) **S05**, (b) A jobb alsó sarokban található "Heti edzésterv" dobozban a "Részletes tervező" gombra kattint. (c) Felugrik az **S09** (Edzői Tervező Modal) egy osztott, kétpaneles nézettel. (d) *Hibaág:* Nincs.
2. (a) **S09**, (b) A bal oldali idővonalon kiválaszt egy adott napot (pl. Kedd), majd a jobb oldali szerkesztőben beállítja az időtartamot (pl. 16:00 - 17:30) és beírja a gyakorlatokat a szövegmezőbe. (c) A bal oldali listában az aktív nap kék kerettel és kék háttérrel kiemelődik ("Szerkesztés" badge). (d) *Hibaág:* Nincs.
3. (a) **S09**, (b) Rákattint a "Mentés" gombra a jobb panel alján. (c) A gomb "Mentés..." állapotba vált, majd egy zöld siker popup jelzi a mentést. A bal oldali listában a szerkesztett nap alatt azonnal frissül a leírás szövege. (d) *Hibaág:* API kapcsolati hiba esetén piros Alert ablak ugrik fel.
4. (a) **S09**, (b) Rákattint a jobb felső "X" (Bezárás) gombra. (c) A modal bezárul, visszatérve az **S05** nézetre. (d) *Hibaág:* Nincs.

**Sikerkritérium:** Az **S05** (Kliens Adatlap) "Heti edzésterv" szekciójában azonnal megjelenik a megírt program. Ezzel egyidőben a kliens az **S04** (Kliens Dashboard) felületén látja az új bejegyzést, kék színű indikátorral a kártyáján.
**Mért időtartam (kb.):** 30–60 másodperc / nap (a begépelt szöveg hosszától függően).