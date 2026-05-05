# MI-használat

Ide kerül az MI-használati napló rövidített, szakdolgozathoz illeszthető változata.

## 12. Mesterséges intelligencia használata a fejlesztés során

A modern szoftvermérnöki gyakorlatnak napjainkra szerves részévé vált a mesterséges intelligencia (MI) alapú asszisztensek használata. A Boosted webalkalmazás fejlesztése során az MI nem a programozói munkát helyettesítő eszközként, hanem egyfajta "junior páros-programozóként" (pair-programmer) és hibakeresési (debugging) segédként volt jelen. Ennek a fejezetnek a célja, hogy transzparensen és kritikus mérnöki szemlélettel mutassa be a fejlesztés során alkalmazott nyelvi modellek használatát, azok előnyeit, valamint a velük járó veszélyeket és korlátokat.

### 12.1. Alkalmazott eszközök és feladatkörök

A projekt során a teljes rendszerarchitektúrát, az adatbázis-modellt és a funkcionális logikát magam terveztem meg és kódoltam le. Az ismétlődő, monoton feladatok felgyorsítására a **GitHub Copilot** szolgáltatását vettem igénybe a VS Code fejlesztőkörnyezeten belül. Ez az eszköz a már általam megírt kódminták alapján kiválóan alkalmas volt a statikus Tailwind CSS osztályok automatikus kiegészítésére, vagy a Pydantic sémák adattagjainak gyorsabb gépelésére.

A komplexebb hibakereséshez és a dokumentáció szakmai formázásához a Google Gemini (**Gemini 3.1 Pro**) webes felületét használtam technikai konzultánsként. A modell az alábbi feladatokban nyújtott támogatást:

*   **Szintaktikai segítség és refaktorálás:** Az üzleti logikát és a FastAPI végpontok alapját jómagam írtam, azonban a JWT (JSON Web Token) alapú autentikáció implementálásakor az iparági szabványoknak megfelelő szintaktika (boilerplate) gyors felépítésében, illetve az elavult SHA-256 algoritmus bcrypt titkosításra való cseréjének technikai kivitelezésében az MI nyújtott iránymutatást.
*   **Tesztek kiterjesztése:** A pytest alapú egységtesztek logikáját és a tesztelendő hibaágakat (pl. mi történik, ha egy heti terv nem hétfővel kezdődik) én határoztam meg. Miután megírtam az első teszteseteket, az MI-t arra használtam, hogy a megadott minta alapján gyorsabban generálja le a további 7-8 végpont szintaktikailag helyes tesztkódját.
*   **Hibakeresés (Debugging):** A kliensoldali és szerveroldali aszinkron kommunikáció során fellépő HTTP hibák (401, 422, 500) gyors diagnosztizálása a hálózati válaszok és a hibaüzenetek (stack trace) közös elemzésével.

### 12.2. Az MI kimenetének validációja és konkrét hibái

Mivel a rendszer magját én terveztem, alapszabályként alkalmaztam, hogy az MI által javasolt kódrészlet sosem tekinthető kész megoldásnak, csupán egy tesztelendő hipotézisnek. Minden javaslatot manuális kódolvasás (code review) és tesztelés követett. Ez a validáció elengedhetetlen volt, mert az MI többször is logikai hibákat vétett, vagy tévesen értelmezte a projekt struktúráját.

Egy konkrét eset volt például a kliens és az edző közötti "Kapcsolat megszakítása" funkció fejlesztése. A saját koncepcióm alapján megírt React kódban egy `ReferenceError` lépett fel. A Gemini által javasolt javítás meghívott egy `isCoach` nevű logikai változót az aszinkron függvényben. A javasolt kód szintaktikailag hibátlan volt, az MI azonban elvesztette a kontextust a nagy méretű fájlban: az `isCoach` változó nem a globális állapottérben (state), hanem csak lejjebb, a JSX renderelési blokkban volt definiálva. Ez a hiba a böngészőben "csendes" összeomlást okozott, amit az MI magától nem tudott azonosítani. A hibát a böngésző fejlesztői konzoljának (F12) manuális elemzésével és a hatókör (scope) lokális átrendezésével kellett megoldanom.

Egy másik tanulságos eset az adatbázis sémájának bővítésekor történt. Amikor az edzői értékeléshez manuálisan hozzáadtam az `average_rating` oszlopot a Python kódhoz, a tesztek futtatásakor a szerver `sqlite3.OperationalError: no such column` hibával leállt. Az MI a kód további refaktorálását javasolta, figyelmen kívül hagyva azt a tényt, hogy az alkalmazás nem használ adatbázis-migrációs eszközt (mint az Alembic), így maga az SQLite fájl nem frissült. A megoldást – a lokális adatbázisfájl törlését és a táblák újra-generálását – a korábbi fejlesztői tapasztalataimra támaszkodva, a modellt felülbírálva kellett meglépnem.

### 12.3. Hol nem használtam mesterséges intelligenciát?

A projekt sikere szempontjából kritikus volt, hogy a szoftver gerincét alkotó területeken tudatosan mellőzzem az MI használatát.

*   **Üzleti logika és rendszertervezés:** A platform alapvető koncepciója, a "Boost" gamifikációs pontrendszer szabályai, az adatbázis-táblák közötti relációk (egyed-kapcsolat diagram), valamint a kliens-edző jogosultsági körök megtervezése teljes mértékben saját mérnöki döntések eredménye.
*   **UI/UX tervezés:** Bár a Tailwind CSS osztályok gépelésében a Copilot segített, a webalkalmazás képernyőterveit, a modern "Bento Grid" elrendezést és a felhasználói útvonalakat (User Journey) vizuálisan, Figma szoftverben magam alkottam meg, bármiféle generatív képi MI bevonása nélkül.
*   **Kritikus algoritmusok:** A szériaszámláló (streak) algoritmus logikája, amely dátumok alapján visszamenőlegesen ellenőrzi a naplózási folytonosságot, saját, kézzel írt implementáció.

### 12.4. Tanulságok és jövőkép

A folyamat legfőbb tanulsága, hogy a mesterséges intelligencia kiváló eszköz a prototipizálás és a repetitív kódolás akár 30-40%-os felgyorsítására, de nem pótolja a stabil szoftvermérnöki alaptudást. Komoly veszélyt jelent a "vak bizalom": amikor a projekt komplexitása megnőtt (például a `page.js` fájl mérete miatt), az MI egyre többször veszítette el a kontextust, és javasolt nem létező változókat vagy hibás hivatkozásokat.

A jövőbeli projekteknél az MI hatékonyabb használata érdekében még modulárisabb architektúrára törekszem. Kisebb, egyetlen felelősséggel rendelkező (Single Responsibility Principle) fájlok és komponensek használatával a nyelvi modellek kontextus-ablaka kevésbé terhelődik túl. Megtanultam továbbá, hogy az MI a hibakeresésben is csak akkor igazán hasznos, ha fejlesztőként képes vagyok pontosan értelmezni a rendszerarchitektúrát, és célzott adatokkal (stack trace, hálózati payload) irányítom a modellt a megoldás felé.