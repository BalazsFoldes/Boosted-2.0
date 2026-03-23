"use client";
import { useState } from "react";

export default function Home() {
  const [view, setView] = useState("landing"); // 'landing', 'register', 'login', 'dashboard'

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loggedInUser, setLoggedInUser] = useState(""); // Tároljuk a belépett nevet

  // --- REGISZTRÁCIÓ ---
  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:8000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, full_name: fullName }),
      });

      if (res.ok) {
        alert("Sikeres regisztráció! Kérjük, jelentkezz be.");
        setView("login"); // A kérésednek megfelelően a LOGIN-ra dobjuk
        setPassword(""); // Kiürítjük a jelszó mezőt biztonsági okokból
      } else {
        const err = await res.json();
        alert("Hiba: " + err.detail);
      }
    } catch (error) {
      alert("Szerver hiba. Fut a backend a 8000-es porton?");
    }
  };

  // --- BEJELENTKEZÉS ---
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:8000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const data = await res.json();
        setLoggedInUser(data.full_name);
        setView("dashboard"); // Belépés után jön a Dashboard
      } else {
        const err = await res.json();
        alert("Hiba: " + err.detail);
      }
    } catch (error) {
      alert("Szerver hiba. Fut a backend a 8000-es porton?");
    }
  };

  // --- MEGHÍVÓ GENERÁLÁSA (Egyelőre UI gomb) ---
  const handleInvite = () => {
    alert("Meghívó link sikeresen vágólapra másolva! (Később itt egy egyedi tokent generálunk)");
  };

  // --- KILÉPÉS ---
  const handleLogout = () => {
    setLoggedInUser("");
    setEmail("");
    setPassword("");
    setFullName("");
    setView("landing");
  };

  // ==========================================
  // 1. LANDING PAGE NÉZET
  // ==========================================
  if (view === "landing") {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
        {/* Fejléc */}
        <header className="w-full p-6 flex justify-between items-center bg-white shadow-sm">
          <div className="text-2xl font-extrabold text-blue-600 tracking-tight">Boosted</div>
          <button 
            onClick={() => setView("login")}
            className="px-6 py-2 bg-gray-100 text-gray-800 font-bold rounded-lg hover:bg-gray-200 transition"
          >
            Bejelentkezés
          </button>
        </header>

        {/* Hero Section */}
        <main className="flex-1 max-w-6xl mx-auto px-4 py-16 flex flex-col items-center text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 tracking-tight">
            Emeld új szintre a <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-purple-600">közös munkát</span>
          </h1>
          <p className="text-xl text-gray-600 mb-16 max-w-2xl">
            A Boosted egy adatközpontú platform, amely összeköti a személyi edzőket és klienseiket. Kövesd az alvást, a stresszt és az energiát egyetlen, AI által támogatott felületen.
          </p>

          {/* Két Box (Kliens és Edző) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl text-left">
            
            {/* Kliens Box */}
            <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100 flex flex-col">
              <div className="text-4xl mb-4">🏃‍♂️</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Klienseknek</h2>
              <p className="text-gray-600 mb-6 flex-1">
                Naplózd egyszerűen a napi biometrikus adataidat, hogy az edződ személyre szabottabb és hatékonyabb edzéstervet tudjon neked készíteni.
              </p>
              <div className="p-4 bg-orange-50 text-orange-800 rounded-lg text-sm border border-orange-100 font-medium">
                ⚠️ Csatlakozni kizárólag az edződtől kapott személyes meghívó linkkel tudsz!
              </div>
            </div>

            {/* Edző Box */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl shadow-md border border-blue-100 flex flex-col">
              <div className="text-4xl mb-4">📊</div>
              <h2 className="text-2xl font-bold text-blue-900 mb-3">Személyi Edzőknek</h2>
              <p className="text-blue-800 mb-6 flex-1 opacity-90">
                Lásd át az összes kliensed állapotát egyetlen Dashboardon. Generálj AI riportokat és előzd meg a túledzést még mielőtt bekövetkezne.
              </p>
              <button
                onClick={() => setView("register")}
                className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg hover:shadow-blue-200"
              >
                Regisztráció Edzőként
              </button>
            </div>

          </div>
        </main>
      </div>
    );
  }

  // ==========================================
  // 2. REGISZTRÁCIÓS NÉZET
  // ==========================================
  if (view === "register") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border-t-4 border-blue-600">
          <h2 className="text-2xl font-bold mb-2 text-gray-800 text-center">Edzői Fiók Létrehozása</h2>
          <p className="text-center text-sm text-gray-500 mb-8">Csatlakozz a Boosted közösséghez!</p>
          
          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Teljes Név</label>
              <input type="text" required className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email cím</label>
              <input type="email" required className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Jelszó</label>
              <input type="password" required className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition shadow-lg">Regisztrálok</button>
          </form>
          
          <button onClick={() => setView("landing")} className="mt-6 text-sm text-gray-500 hover:text-gray-800 w-full text-center transition">← Vissza a főoldalra</button>
        </div>
      </div>
    );
  }

  // ==========================================
  // 3. BEJELENTKEZÉS NÉZET
  // ==========================================
  if (view === "login") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border-t-4 border-gray-800">
          <h2 className="text-2xl font-bold mb-2 text-gray-800 text-center">Üdv újra!</h2>
          <p className="text-center text-sm text-gray-500 mb-8">Jelentkezz be a fiókodba</p>
          
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email cím</label>
              <input type="email" required className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-gray-800 focus:outline-none text-gray-900" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Jelszó</label>
              <input type="password" required className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-gray-800 focus:outline-none text-gray-900" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <button type="submit" className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl hover:bg-black transition shadow-lg">Belépés</button>
          </form>
          
          <button onClick={() => setView("landing")} className="mt-6 text-sm text-gray-500 hover:text-gray-800 w-full text-center transition">← Vissza a főoldalra</button>
        </div>
      </div>
    );
  }

  // ==========================================
  // 4. EDZŐI DASHBOARD NÉZET
  // ==========================================
  if (view === "dashboard") {
    return (
      <div className="min-h-screen bg-gray-100 font-sans">
        {/* Dashboard Navbar */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <div className="text-xl font-bold text-blue-600">Boosted Dashboard</div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600 font-medium">{loggedInUser} (Edző)</span>
            <button 
              onClick={handleLogout}
              className="px-4 py-2 bg-red-50 text-red-600 text-sm font-bold rounded-lg hover:bg-red-100 transition"
            >
              Kijelentkezés
            </button>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-10">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900">Szia, {loggedInUser}! 👋</h1>
              <p className="text-gray-500 mt-2">Itt találod majd a klienseid adatait és az elemzéseket.</p>
            </div>
            
            {/* Új Kliens Meghívása Gomb */}
            <button 
              onClick={handleInvite}
              className="flex items-center px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-md"
            >
              <span className="text-xl mr-2">+</span> Új kliens meghívása
            </button>
          </div>

          {/* Üres állapot "Placeholder" */}
          <div className="bg-white rounded-2xl shadow-sm border border-dashed border-gray-300 p-16 text-center">
            <div className="text-5xl mb-4 opacity-50">📂</div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">Még nincsenek klienseid</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Küldj ki egy meghívó linket az első kliensednek, hogy elkezdhesse naplózni az adatait!
            </p>
          </div>
        </main>
      </div>
    );
  }
}