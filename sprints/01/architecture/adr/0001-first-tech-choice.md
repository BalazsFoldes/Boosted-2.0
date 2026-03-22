# 0001: Kezdeti technológiai stack kiválasztása

- Dátum: 2025-10-15
- Státusz: Elfogadva

## Kontextus
A Boosted egy AI-alapú egészség- és fitnesz webalkalmazás, amely integrálja a felhasználók edzés-, étrend-, alvás-, hidratáció- és hangulatadatait egyetlen felületen.  
A cél az, hogy a felhasználók motiváltak maradjanak és könnyen nyomon követhessék a fejlődésüket.  

## Döntés
A frontendhez **Next.js (React)** keretrendszert választunk **TypeScript** illetve **TailwindCSS** támogatással, mivel:
- modern, SEO-barát webalkalmazásokat tesz lehetővé,
- beépített API-rétege révén egyszerű backend-integrációt kínál,
- a csapatnak már van React- és TypeScript-tapasztalata.

A backend **Django (Python)** lesz **PostgreSQL** adatbázissal, mert:
- erős admin felületet biztosít (user management, adatkezelés),
- könnyen integrálható AI-modulokkal (pl. OpenAI GPT, scikit-learn),
- későbbi fizetési integrációt és autentikációt könnyen kezel.

## Megfontolt alternatívák
- **FastAPI + PostgreSQL**: gyors, aszinkron API, de Django admin funkciói és ORM előnyei miatt nem elsődleges választás.  
- **Node.js (Express) + PostgreSQL**: Python AI integráció szempontjából kevésbé optimális.  
- **Vue 3 + Supabase**: gyors MVP, de a csapat React-ismerete miatt nem indokolt.

## Következmények
- A Next.js + TypeScript + TailwindCSS stack gyors frontend-fejlesztést és típusbiztonságot biztosít.  
- A Django backend lehetővé teszi az AI-alapú szolgáltatások integrációját, adatbiztonságot és adminisztrációt.  
- Kockázat: két nyelvet kell karbantartani (TypeScript + Python), és a JavaScript/Tailwind ökoszisztéma sok csomagot hoz, ezért rendszeres dependency audit szükséges.
- AI-funkciók integrációja (pl. OpenAI GPT chatbot) biztosítja a személyre szabott tippeket és ügyfélszolgálati támogatást.