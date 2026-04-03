# FÖLDES Balázs — Boosted 2.0

**Neptun:** NYCLM8 | **Repó:** github.com/BalazsFoldes/Boosted-2.0

---

## Mi ez a projekt?

Gamifikált fitnesz követő platform személyi edzőknek és klienseknek. Coach/Client szerepkörökkel, napi biometrikus naplózással (alvás, stressz, víz, hangulat), és MI-alapú trendanalízissel. Next.js + FastAPI + PostgreSQL stack.

## Tervezett funkciók

- Coach/Client kettős regisztráció meghívó token rendszerrel
- Napi biometrikus naplózás (alvás, stressz, víz, hangulat, lüktetési variabilitás)
- Coach dashboard klienslistával és összesítővel
- MI-alapú heti trendriport generálás (LLM: OpenAI/Gemini)
- Anomália-detekció (z-score / IQR alapú, stressz-spike, alvásromlás)
- Coach-alert rendszer (push notification real-time anomáliákra)
- Gamifikáció motor (XP, streak, szintlépés, badge-ek, havi leaderboard)
- Edzésterv kezelés + periodizáció (könnyű/közepes/nehéz hét)
- Kliens célok beállítása + vizualizáció (progress bar, milestone celebration)
- Wearable integráció (Google Fit / Apple HealthKit)
- Valós idejű coach-kliens chat (Socket.io)

## Technológiai verem

| Réteg | Választás | Értékelés |
|---|---|---|
| Frontend | Next.js 16 + Tailwind CSS 4 + TypeScript | Kiváló. SSR-képes, modern, TailwindUI components. |
| Backend | FastAPI + Python + async | Jó. Async I/O, scientific computing libs natívan. |
| Adatbázis | PostgreSQL + TimescaleDB extension | Professzionális. Time-series adatokhoz optimalizált. |
| ORM | SQLAlchemy 2 | Standard. Type hints, modern async support. |
| MI/NLP | OpenAI API / Google Gemini API | Production-ready LLM inference. |
| Anomália-detekció | Google Cloud Anomaly Detection API / Azure Anomaly Detector | Production-grade, hosted ML service. |
| Wearable API | Google Fit SDK + Apple HealthKit SDK | Industrial-grade integrációk. |
| Real-time | Socket.io (Python socketio library) | WebSocket fallback, reliable. |

## Versenytársak

A **Trainerize** ($30/hó) edzésterv-kezelést és kliens-kommunikációt kínál, de nincs biometrikus tracking — csakis edzésre fókuszál. A **TrueCoach** hasonló, szintén nincs holistikus biometrikus megközelítés. A **MyFitnessPal** (150M+) kalóriát követ, de nincs coach-rendszer és az alvás/stressz-integráció felületes. A **Whoop** ($30/hó) biometrikus adatokat elemez wearable-ökkel, de nincs coach-kliens kapcsolat és nincs edzésterv-kezelés. A **Strava** edzés-tracking + közösség, de nincs coach-integrációs és nincs MI-elemzés. A Boosted 2.0 egyedi értéke: coach-kliens rendszer + biometrikus tracking (alvás/stressz/HRV) + MI-anomália detekció + edzésterv kezelés egy platformon. Ez a "holisztikus kondíciómenedzsment" kategória, amit senki nem csinál ma.

## Javasolt lehetséges képességek

Nem kötelező, de ezekből lehet válogatni:

- **MI-alapú heti trendriport generálás** (OpenAI/Gemini API) — automatikus szöveges elemzés az elmúlt 7 nap biometrikus adataiból
- **Anomália-detekció és coach-alert rendszer** (Google Cloud Anomaly Detection API) — statisztikai anomáliák és real-time push notifikációk
- **Wearable integráció** (Google Fit + Apple HealthKit) — automatikus adatszinkron okosórákról (Fitbit, Apple Watch, Garmin)
- **Edzésterv-kezelés és periodizáció** — könnyű/közepes/nehéz hét naptár-nézettel, fotó-útmutatások
- **Gamifikáció motor** — XP, streak, szintlépés, badge-ek, havi leaderboard a klienslistán
- **Real-time coach-kliens kommunikáció** (Socket.io) — chat és live coaching session pulzusszám-figyelésselAI-alapú edzés-orientáció
- **Push értesítések** — emlékeztetők, coach üzenetek, anomália-riasztások
- **Közösségi leaderboard** — kliensek közötti verseny XP és célok alapján
- **Exportálási funkciók** — biometrikus adatok PDF-ben, edzésnapló lementése
- **Role-based access** — coach, kliens, admin jogosultságok, moderáció
- **API endpoint-ok** — harmadik fél integrációk, Zapier kompatibilitas
- **Mobil szinkronizáció** — offline mód lokális cache-vel, szinkron amikor online

## Összegzés

A Boosted 2.0 egyedülálló kombinációt kínál: coach-kliens rendszer + biometrikus tracking + MI-elemzés + edzésterv + gamifikáció. A wearable integráció, a MI-trendriport, az anomália-detekció és a valós idejű coaching mód tenné valódi versenytárssá a Trainerize, MyFitnessPal, és Whoop között a "holisztikus fitnesz" piaci szegmensben.

---
