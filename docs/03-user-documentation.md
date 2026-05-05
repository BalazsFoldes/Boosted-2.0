# Felhasználói Kézikönyv – Boosted

## 1. Mi az a Boosted?
A Boosted egy modern, mesterséges intelligenciával támogatott platform, amely összeköti a személyi edzőket és klienseiket. A rendszer célja, hogy az edzők időt spóroljanak az adatok elemzésén a prediktív AI Dashboard segítségével, a kliensek pedig egy letisztult felületen követhessék napi fejlődésüket és a kiadott heti edzésterveket.

## 2. Első lépések

* **2.1. Regisztráció és Bejelentkezés**
    A platform kétféle szerepkört különböztet meg: **Edző** (Coach) és **Kliens** (Client).
    * **Edzők:** A főoldalon a "Regisztráció" gombra kattintva hozhatnak létre fiókot, ahol megadják nevüket, email címüket és jelszavukat.
    * **Kliensek:** A kliensek a legkönnyebben úgy tudnak csatlakozni, ha az edzőjük küld nekik egy egyedi, biztonságos meghívó linket. Erre rákattintva a rendszer automatikusan összekapcsolja őket az edzőjükkel a regisztráció során.

* **2.2. Profil beállítása**
    A bejelentkezés után a navigációs sáv "Profil" menüpontjában érdemes kitölteni a fizikai paramétereket (pl. testsúly) és egy rövid bemutatkozást. Ezek az adatok segítik az MI-t a pontosabb elemzések elkészítésében.

---

## 3. Kliens funkciók (A te edzésed, a te fejlődésed)

* **3.1. Napi Napló (Daily Log)**
    A Kliens Dashboard legfontosabb eleme. Itt tudod minden nap rögzíteni a fizikai és mentális állapotodat:
    * **Alvás, Víz, Edzésidő:** Számadatok bevitele.
    * **Stressz-szint és Hangulat:** Csúszkák és opciók segítségével.
    * *Tipp:* Minden napra csak egy naplót tudsz rögzíteni. Ezek az adatok azonnal megjelennek az edződnél, aki nyomon követi a haladásodat!

* **3.2. Heti Edzéstervek megtekintése**
    Az "Edzéstervek" menüpontban láthatod a soron következő hétre kiadott feladataidat, nehézségi szinttel együtt, amit az edződ állított össze neked.

* **3.3. Edző értékelése (Review)**
    A profil menüből lehetőséged van az edződ munkáját 1-től 5 csillagig értékelni, és szöveges véleményt hagyni, amely segíti az ő hitelességének növelését a platformon.

---

## 4. Edzői funkciók (Klienskezelés felsőfokon)

* **4.1. Kliensek kezelése és Meghívás**
    A "Kliensek" fülön láthatod a hozzád tartozó sportolókat. Új klienst az "Új kliens meghívása" gombbal tudsz hozzáadni: a rendszer generál egy biztonságos linket, amit elküldhetsz neki.

* **4.2. Heti Edzésterv Tervező**
    Itt oszthatod ki a strukturált feladatokat. Kiválasztod a klienst, beállítod a nehézségi szintet, és szövegesen/listázva rögzíted a tervet. *Fontos: A rendszer logikája alapján egy edzéshetet mindig csak hétfői kezdődátummal lehet elmenteni!*

* **4.3. Gamifikáció: Motivációs Boost**
    Látod, hogy a kliensednek nehéz napja van? A kliens kártyáján nyomd meg a "Boost" gombot! Ez a funkció megnöveli a kliens pontszámát és a felületén megjelenít egy motivációs jelzést, hogy tudd: figyelsz rá.

---

## 5. Mesterséges Intelligencia (Neural Engine)

A Boosted 2.0 legfőbb innovációja a Google Gemini által hajtott MI modul, amelyet mindkét szerepkör elér.

* **5.1. Edzői AI Dashboard (Prediktív Elemzés)**
    Ne tölts órákat a nyers naplóadatok böngészésével! Az AI Dashboard gombnyomásra kielemzi a klienseid utolsó időszakának adatait, és **strukturált kártyákon jeleníti meg a riasztásokat** (pl. ha valakinél magas a stressz vagy kevés az alvás, sérülésveszélyt jelez).
    
* **5.2. AI Chat Asszisztens**
    Beszélgess közvetlenül az asszisztenssel! 
    * **Ha edző vagy:** Szakmai tanácsokat, alternatív gyakorlatokat vagy rehabilitációs tippeket kérhetsz.
    * **Ha kliens vagy:** Motivációt, étkezési tippeket vagy általános életmód-tanácsokat kaphatsz. A rendszer tudja, kivel beszél, és ahhoz igazítja a stílusát!

---

## 6. Gyakori kérdések (FAQ)

**K: Látja az MI a személyes adataimat (pl. email, jelszó)?**
V: Szigorúan nem. A Google Gemini API felé a rendszer csak anonimizált, nyers fizikai adatokat (pl. stresszszint, alvásóra) és egy keresztnevet küld a kontextus miatt. A jelszavaidat a rendszer erős titkosítással (bcrypt) védi.

**K: Rögzíthetek Napi Naplót a tegnapi napra?**
V: Az alkalmazás jelenlegi verziója a "proaktív jelenlétre" fókuszál, ezért visszamenőleges rögzítésre nincs lehetőség. Arra ösztönzünk, hogy építsd be a napi rutinodba az aznapi kitöltést!

**K: Mi történik, ha az AI Dashboard nem tölt be?**
V: Ritkán előfordulhat, hogy a külső AI szerverek túlterheltek. Ilyenkor a Boosted egy biztonságos hibaüzenetet mutat, de az alkalmazás többi része (naplózás, edzéstervek megtekintése) továbbra is zavartalanul működik.

**K: Hogyan tudok kijelentkezni?**
V: A navigációs sáv profil ikonjára (vagy menüjére) kattintva a "Kijelentkezés" opcióval bármikor biztonságosan kiléphetsz a fiókodból.