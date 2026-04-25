# Vizuális Nyelv és Design Rendszer (Boosted)

Az alkalmazás egy modern, adatközpontú "Clean UI" stílust képvisel, mely prémium SaaS termékek (pl. Linear, Vercel) formai jegyeit – Glassmorphism, Bento Grid – használja. Különös figyelmet fordítottunk a szerepkörök színalapú (Lila vs. Smaragd) vizuális elválasztására.

* **UI könyvtár / komponens-könyvtár:** Natív React + Tailwind CSS. Külső UI könyvtárat nem használtunk, minden komponenst egyedileg építettünk fel. Az adatvizualizációhoz a `recharts` könyvtárat integráltuk.
* **Színpaletta:**
  * *Surface / Background:* Slate skála (`#F8FAFC` slate-50 alap, `#0F172A` slate-900 dark mode/AI, `#FFFFFF` white kártyák).
  * *Coach Primary (Szakértő):* Purple & Indigo gradiens (`#9333EA` - purple-600, `#4F46E5` - indigo-600). A tudást és innovációt szimbolizálja.
  * *Client Primary (Kliens):* Emerald & Teal gradiens (`#059669` - emerald-600, `#2DD4BF` - teal-400). Az egészséget és frissességet szimbolizálja.
  * *Gamification / Accent:* Orange & Pink gradiens (`#F97316` - orange-500) a Boost funkciókhoz.
  * *Alerts & Visszajelzések:* Siker (`#10B981` emerald-500), Hiba (`#EF4444` red-500), Figyelmeztetés (`#FACC15` yellow-400).
* **Tipográfia:** Natív rendszer fontok (Tailwind sans: Inter / system-ui). 
  * *Font-weight-ek:* normál (400), medium (500) a leírásokhoz, bold (700) a gombokhoz, és extrabold (800) a címsorokhoz. 
  * *Méret-skála és hierarchia:* Erős információs hierarchia: vastag, negatív trackinggel (betűközzel) rendelkező H1/H2 elemek (`tracking-tight`, 3xl-7xl méret), és szélesen szedett apróbetűs címkék (`text-[10px] uppercase tracking-widest`).
* **Spacing / grid:** 4px/8px alapú Tailwind skála (`p-4`, `gap-6`). A max content width (maximális tartalmi szélesség) jellemzően `max-w-6xl` (1152px) a Dashboardon, és `max-w-5xl` (1024px) a modáloknál. A modern hatás érdekében extrém mély lekerekítések: `rounded-2xl`, `rounded-3xl` és `rounded-[2.5rem]`.
* **Ikonkészlet:** Natív, kódba ágyazott egyedi SVG ikonok (Heroicons stílusban), 2-es vagy 2.5-ös `stroke-width` értékkel a prémium érzetért, plusz háttér tipográfiai vízjelek az üres terek kitöltésére.
* **Sötét mód:** Részlegesen (hibrid módon) támogatott. A fő Dashboard világos (Light Mode), azonban az "AI Asszisztens" és a "Prémium" oldalak dedikált, üveges (glassmorphism) sötét móddal rendelkeznek az exkluzív hatás kiemelésére.
* **Reszponzív breakpoint-ok:** Tailwind default értékek. `sm: 640px` (mobil felett), `md: 768px` (tablet), `lg: 1024px` (desktop). A komplex grid elrendezések mobilon szimpla oszloppá rendeződnek, a horizontális idővonalak pedig `overflow-x-auto` segítségével lapozhatóvá válnak.
* **Forrás:** A tervezés közvetlenül a böngészőben, kódból történt (Design in Browser módszertan), Tailwind CSS utility class-ok használatával. Külön Figma / Penpot fájl nem készült.