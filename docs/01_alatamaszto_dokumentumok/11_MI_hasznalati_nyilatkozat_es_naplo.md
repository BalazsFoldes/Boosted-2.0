# MI-használati nyilatkozat és napló: Boosted

## 1. Rövid nyilatkozat a szakdolgozatba
A dolgozat készítése során mesterséges intelligencia alapú eszközöket (GitHub Copilot, Google Gemini 3.1 Pro és OpenAI ChatGPT) használtam koncepcióalkotáshoz, ismétlődő kódminták (boilerplate) generálására, szintaktikai refaktorálásra, egységtesztek kiterjesztésére, aszinkron hálózati hibák diagnosztizálására, valamint a dokumentáció stilisztikai finomítására. Az MI által javasolt tartalmakat minden esetben önállóan ellenőriztem (code review, tesztelés). Az MI javaslatait több esetben tudatosan felülbíráltam vagy elvetettem, mivel a komplex projektstruktúrában az eszközök elvesztették a kontextust. A végső szakmai felelősséget vállalom; az architektúra megtervezése, az adatbázis-modell, a UI/UX és a kritikus algoritmusok saját mérnöki munkám eredményei.

## 2. MI-használati napló (Fejlesztést támogató eszközök)

| Dátum | Eszköz / modell | Feladat | Prompt / Használat röviden | Eredmény | Ellenőrzés módja | Beépült? | Saját módosítás / Konklúzió |
|---|---|---|---|---|---|---|---|
| 2026-03-10 | ChatGPT (GPT-4o) | Projektötlet és funkciólista | "Személyi edzőknek szóló proaktív webapp koncepció, mi legyen az MVP-ben?" | Ötletelés a gamifikációra és riasztásokra. | Szakmai konzultáció témavezetővel. | Igen | A "Boost" rendszer ötlete innen indult, de a szabályrendszert magam írtam. |
| 2026-03-15 | ChatGPT (GPT-4o) | Adatbázis séma tervezés | "SQLAlchemy modellek egyed-kapcsolat diagramhoz (User, Log, Invite, Plan)." | Alapvető táblaszerkezet javaslat. | Manuális ER-diagram tervezés Figmában. | Igen | Az idegen kulcsok és a JSON-alapú tervtárolás saját döntés volt a skálázhatóság miatt. |
| Folyamatos | GitHub Copilot | UI szintaktika gépelése | Tailwind CSS osztályok és Pydantic sémák automatikus kiegészítése. | Gyorsabb kódírás (boilerplate). | Vizuális ellenőrzés a böngészőben. | Igen | A layout elrendezést (Bento Grid) manuálisan kellett finomhangolni a reszponzivitás miatt. |
| 2026-03-15 | Gemini 3.1 Pro | Hitelesítés refaktorálás | "Hogyan cseréljem le a FastAPI-ban az SHA-256-ot bcryptre és JWT tokenekre?" | Standard JWT boilerplate és bcrypt szintaktika. | Manuális kódolvasás, token dekódolás ellenőrzése. | Igen | A nyers kódot beépítettem a saját `get_current_user` Auth Guard logikámba. |
| 2026-03-20 | GitHub Copilot | React Hook-ok generálása | `useEffect` és `fetch` hívások vázlatának létrehozása a Dashboardon. | API hívások szintaktikai váza. | Chrome DevTools hálózati forgalom elemzés. | Igen | A hibakezelést és a loading state-eket manuálisan egészítettem ki. |
| 2026-04-02 | ChatGPT (GPT-4o) | PDF generálás hibakeresés | "jsPDF hiba: az ékezetes karakterek hibásan jelennek meg a generált fájlban." | Karakterkódolási tanácsok és font-beágyazás javaslata. | Többszöri PDF export tesztelés. | Igen | Végül egy ékezet-eltávolító segédfüggvényt írtam a kompatibilitás garantálására. |
| 2026-04-10 | Gemini 3.1 Pro | Tesztek kiterjesztése | "Írj pytest eseteket a maradék végpontokra a megadott minta alapján, fókuszálj a hibaágakra." | 7-8 új pytest függvény a végpontokhoz. | `pytest` futtatása lokális környezetben. | Igen | Az adatsémákat és az URL végpontokat a saját routingomhoz kellett igazítani. |
| 2026-04-15 | Gemini 3.1 Pro | Hibakeresés (React) | "ReferenceError a handleDisconnectConfirm aszinkron függvényben." | Javaslat az `isCoach` változó globális használatára. | Szintaktikai ellenőrzés és böngésző konzol. | Nem | Az MI elvesztette a kontextust; a hibát manuálisan javítottam a State lekérdezésével. |
| 2026-04-20 | ChatGPT (GPT-4o) | Dokumentáció stilisztika | "Hogyan fogalmazzam meg mérnöki stílusban az 'adatvezérelt riasztási rendszer' előnyeit?" | Szakmai kulcsszavak és mondatszerkezetek. | Szakdolgozat szövegezésének átolvasása. | Igen | A vázat felhasználtam a bevezető fejezetben. |
| 2026-04-25 | Gemini 3.1 Pro | Hibakeresés (SQLite) | "sqlite3.OperationalError: no such column az average_rating mezőnél." | Komplex kód-refaktorálási javaslatok. | Rendszerismeret (Alembic hiánya). | Nem | Az MI nem vette figyelembe a hiányzó migrációs eszközt. A DB fájl törlésével oldottam meg. |
| 2026-04-26 | Gemini 3.1 Pro | Felhő alapú telepítés (CORS) | "FastAPI és Vercel frontend: CORS hiba a bejelentkezésnél Render.com backenddel." | `CORSMiddleware` konfigurációs javaslat. | Éles tesztelés a Render/Vercel URL-eken. | Igen | A biztonsági domaineket szigorúan a saját hosztolt linkjeimre korlátoztam. |
| 2026-04-27 | ChatGPT (GPT-4o) | README végső simítása | "Írj egy strukturált README.md-t a repóhoz telepítési útmutatóval és demo userekkel." | Jól olvasható Markdown vázlat. | GitHub előnézet ellenőrzése. | Igen | A demo felhasználók adatait a saját tesztadatbázisom alapján adtam meg. |

---

## 3. MI mint a termék része (Integrált funkció)

A Boosted platform nemcsak a fejlesztés során használt MI-t, hanem maga a szoftver is tartalmaz egy integrált mesterséges intelligencia modult (Neural Engine Dashboard). Ezt az alábbiak szerint dokumentálom:

* **Eszköz / Modell:** Google Gemini 3.1 Flash Lite API (FastAPI backendbe integrálva a `google.generativeai` könyvtárral).
* **Feladat:** Nyers biometrikus (alvás, stressz, víz) és edzésadatok elemzése, rejtett mintázatok felismerése, valamint kiégés/sérülés előrejelzése (predikció).
* **Bemenet (Context Data):** A backend a bejelentkezett felhasználó szerepköre alapján egy nyers, strukturálatlan sztringet állít össze (pl. "Kliens célja: X, utolsó 3 nap adatai: Y").
* **Kimenet kikényszerítése:** A `response_mime_type: "application/json"` paraméterrel és szigorú System Prompt utasításokkal a rendszer kikényszeríti, hogy az MI Markdown helyett egy fix kulcsokkal rendelkező JSON objektumot adjon vissza.
* **Adatvédelem és Biztonság:** Az MI-nek küldött adatokból hiányoznak a közvetlen személyes azonosítók (PII), csak a fizikai metrikák és a keresztnevek kerülnek átadásra a kontextusban.
* **Hibakezelés és Fallback:** Mivel a hálózati API hívások (latency) és a Rate Limit hibák kockázatot jelentenek, a rendszer Try-Catch blokkokkal védekezik. 500-as hiba esetén a React frontend nem omlik össze, hanem egy dedikált "Hálózati Hiba / Túlterhelt Szerver" kártyát (Fallback UI) jelenít meg a felhasználónak.
* **Hallucináció elleni védelem:** A szigorú JSON struktúra és a prompt engineering minimalizálja a "kreatív" félrebeszélést. A frontend UI-on a generált szövegek jól láthatóan "AI Javaslat" címkével vannak ellátva, így a felhasználó tudja, hogy az információt algoritmikus asszisztens generálta, nem pedig orvosi tény.