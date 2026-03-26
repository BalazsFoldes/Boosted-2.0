"use client";
import { useState, useEffect } from "react";

export default function Home() {
  const [view, setView] = useState("landing"); 

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  
  // ÚJ: Állapot a szakmához a regisztrációnál
  const [specialization, setSpecialization] = useState("Személyi Edző");
  
  const [loggedInUser, setLoggedInUser] = useState(""); 
  const [coachId, setCoachId] = useState(null); 
  const [userRole, setUserRole] = useState(""); 
  const [userId, setUserId] = useState(null); 
  // ÚJ: A belépett felhasználó szakmája (Profil megjelenítéshez)
  const [userSpecialization, setUserSpecialization] = useState("");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clientEmail, setClientEmail] = useState("");
  const [generatedLink, setGeneratedLink] = useState("");

  const [clients, setClients] = useState([]);
  const [currentTab, setCurrentTab] = useState("overview");

  useEffect(() => {
    const fetchClients = async () => {
      if (!coachId) return;
      try {
        const res = await fetch(`http://localhost:8000/api/coach/${coachId}/clients`);
        if (res.ok) {
          const data = await res.json();
          setClients(data);
        }
      } catch (error) {
        console.error("Hiba a kliensek lekérésekor:", error);
      }
    };

    if (view === "dashboard" && userRole === "COACH") {
      fetchClients();
    }
  }, [view, userRole, coachId]);

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:8000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // ÚJ: Elküldjük a szakmát is!
        body: JSON.stringify({ email, password, full_name: fullName, specialization }),
      });
      if (res.ok) {
        alert("Sikeres regisztráció! Kérjük, jelentkezz be.");
        setView("login"); 
        setPassword(""); 
      } else {
        const err = await res.json();
        alert("Hiba: " + err.detail);
      }
    } catch (error) {
      alert("Szerver hiba.");
    }
  };

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
        setUserRole(data.role); 
        setUserId(data.user_id); 
        setUserSpecialization(data.specialization); // ÚJ: Eltároljuk a szakmát
        setCoachId(data.role === "COACH" ? data.user_id : data.coach_id); 
        
        setCurrentTab("overview"); 
        setView("dashboard"); 
      } else {
        const err = await res.json();
        alert("Hiba: " + err.detail);
      }
    } catch (error) {
      alert("Szerver hiba.");
    }
  };

  const handleGenerateInvite = async (sendEmail = false) => {
    try {
      const payload = { coach_id: coachId };
      if (sendEmail) payload.email = clientEmail;

      const res = await fetch("http://localhost:8000/api/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        setGeneratedLink(data.link);
        if (sendEmail) {
          alert(`Email elküldve a következő címre: ${clientEmail}`);
          setClientEmail(""); 
        }
      } else {
        alert("Hiba a generálás során.");
      }
    } catch (error) {
      alert("Szerver hiba.");
    }
  };

  const handleLogout = () => {
    setLoggedInUser("");
    setCoachId(null);
    setUserRole(""); 
    setUserId(null); 
    setUserSpecialization("");
    setClients([]); 
    setEmail("");
    setPassword("");
    setFullName("");
    setView("landing");
  };

  const inputStyle = "w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white text-gray-900 font-sans font-medium tracking-wide transition-all";

  // ==========================================
  // LANDING NÉZET
  // ==========================================
  if (view === "landing") {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col font-sans overflow-x-hidden">
        <header className="w-full p-6 flex justify-between items-center bg-white shadow-sm border-b border-gray-100 z-10">
          <div className="text-2xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-purple-600 tracking-tight">
            Boosted
          </div>
          <button onClick={() => setView("login")} className="px-6 py-2 bg-gray-100 text-gray-800 font-bold rounded-lg hover:bg-gray-200 transition text-sm">
            Bejelentkezés
          </button>
        </header>

        <main className="flex-1 max-w-6xl mx-auto px-4 py-16 md:py-24 flex flex-col items-center text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-8 tracking-tighter leading-tight">
            Emeld új szintre a <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-purple-600">
              közös munkát
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-16 max-w-2xl leading-relaxed">
            A Boosted egy adatközpontú platform, amely összeköti a személyi edzőket, terapeutákat és klienseiket. Kövesd az alvást, a stresszt és az energiát egyetlen felületen.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl text-left">
            <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100 flex flex-col">
              <div className="text-4xl mb-4">🏃‍♂️</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Klienseknek</h2>
              <p className="text-gray-600 mb-6 flex-1">Naplózd egyszerűen a napi biometrikus adataidat, hogy a szakértőd személyre szabottabb programot tudjon neked készíteni.</p>
              <div className="p-4 bg-orange-50 text-orange-800 rounded-lg text-sm border border-orange-100 font-medium">
                ⚠️ Csatlakozni kizárólag a szakértődtől kapott személyes meghívó linkkel tudsz!
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl shadow-md border border-blue-100 flex flex-col">
              <div className="text-4xl mb-4">📊</div>
              <h2 className="text-2xl font-bold text-blue-900 mb-3">Szakértőknek</h2>
              <p className="text-blue-800 mb-6 flex-1 opacity-90">Lásd át az összes kliensed állapotát egyetlen Dashboardon. Előzd meg a túledzést és a kiégést még mielőtt bekövetkezne.</p>
              <button onClick={() => setView("register")} className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg hover:shadow-blue-200">
                Regisztráció Szakértőként
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ==========================================
  // REGISTER NÉZET
  // ==========================================
  if (view === "register") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border-t-4 border-blue-600">
          <h2 className="text-3xl font-extrabold mb-2 text-gray-900 text-center tracking-tight">
            Coach Fiók Létrehozása
          </h2>
          <form onSubmit={handleRegister} className="space-y-5 mt-8">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Teljes Név</label>
              <input type="text" required className={inputStyle} value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            
            {/* ÚJ: Szakma kiválasztása (Legördülő) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Szakma / Terület</label>
              <select 
                className={`${inputStyle} cursor-pointer`} 
                value={specialization} 
                onChange={(e) => setSpecialization(e.target.value)}
              >
                <option value="Személyi Edző">Személyi Edző</option>
                <option value="Fizioterapeuta / Gyógytornász">Fizioterapeuta / Gyógytornász</option>
                <option value="Dietetikus / Táplálkozási Tanácsadó">Dietetikus / Táplálkozási Tanácsadó</option>
                <option value="Sportpszichológus">Sportpszichológus</option>
                <option value="Életmód Tanácsadó (Health Coach)">Életmód Tanácsadó (Health Coach)</option>
                <option value="Egyéb Szakértő">Egyéb</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email cím</label>
              <input type="email" required className={inputStyle} value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Jelszó</label>
              <input type="password" required className={inputStyle} value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition shadow-lg">Regisztrálok</button>
          </form>
          <button onClick={() => setView("landing")} className="mt-6 text-sm text-gray-500 hover:text-gray-800 w-full text-center transition">← Vissza a főoldalra</button>
        </div>
      </div>
    );
  }

  // ==========================================
  // LOGIN NÉZET
  // ==========================================
  if (view === "login") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border-t-4 border-gray-800">
          <h2 className="text-3xl font-extrabold mb-2 text-gray-900 text-center tracking-tight">
            Üdv újra!
          </h2>
          <form onSubmit={handleLogin} className="space-y-5 mt-8">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email cím</label>
              <input type="email" required className={inputStyle} value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Jelszó</label>
              <input type="password" required className={inputStyle} value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <button type="submit" className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl hover:bg-black transition shadow-lg">Belépés</button>
          </form>
          <button onClick={() => setView("landing")} className="mt-6 text-sm text-gray-500 hover:text-gray-800 w-full text-center transition">← Vissza a főoldalra</button>
        </div>
      </div>
    );
  }

  // ==========================================
  // DASHBOARD NÉZET
  // ==========================================
  if (view === "dashboard") {
    const isCoach = userRole === "COACH";
    
    const themeGradient = isCoach ? "from-blue-600 to-purple-600" : "from-emerald-500 to-teal-400";
    const themeText = isCoach ? "text-blue-700" : "text-emerald-700";
    const themeBg = isCoach ? "bg-blue-50" : "bg-emerald-50";

    return (
      <div className="min-h-screen bg-gray-50 font-sans relative">
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex flex-col sm:flex-row justify-between items-center z-10 sticky top-0">
          <div className="flex items-center justify-between w-full sm:w-auto mb-4 sm:mb-0">
            <div className={`text-2xl font-extrabold text-transparent bg-clip-text bg-linear-to-r ${themeGradient} tracking-tight mr-8`}>
              Boosted {isCoach ? "Coach" : "Client"}
            </div>
            
            <nav className="hidden sm:flex space-x-2">
              <button onClick={() => setCurrentTab("overview")} className={`px-5 py-2 text-sm font-bold rounded-full transition-all duration-200 ${currentTab === "overview" ? `${themeBg} ${themeText}` : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"}`}>Áttekintés</button>
              <button onClick={() => setCurrentTab("profile")} className={`px-5 py-2 text-sm font-bold rounded-full transition-all duration-200 ${currentTab === "profile" ? `${themeBg} ${themeText}` : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"}`}>Saját Profil</button>
            </nav>
          </div>

          <div className="flex items-center space-x-4 w-full sm:w-auto justify-between sm:justify-end">
            <nav className="sm:hidden flex space-x-2 flex-1 mr-4">
              <button onClick={() => setCurrentTab("overview")} className={`flex-1 py-2 text-xs font-bold rounded-full transition-all ${currentTab === "overview" ? `${themeBg} ${themeText}` : "text-gray-500 hover:bg-gray-100"}`}>Áttekintés</button>
              <button onClick={() => setCurrentTab("profile")} className={`flex-1 py-2 text-xs font-bold rounded-full transition-all ${currentTab === "profile" ? `${themeBg} ${themeText}` : "text-gray-500 hover:bg-gray-100"}`}>Profil</button>
            </nav>

            <span className="text-sm text-gray-600 font-medium hidden md:inline">
              {loggedInUser} <span className="text-gray-400">({isCoach ? "Edző" : "Kliens"})</span>
            </span>
            <button onClick={handleLogout} className="px-4 py-2 bg-red-50 text-red-600 text-sm font-bold rounded-lg hover:bg-red-100 transition whitespace-nowrap">Kijelentkezés</button>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-10">
          
          {/* ========================================== */}
          {/* 1. ÁTTEKINTÉS TAB                          */}
          {/* ========================================== */}
          {currentTab === "overview" && (
            <div className="animate-fade-in-up">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
                <div>
                  <h1 className="text-3xl font-extrabold text-gray-900">Szia, {loggedInUser}! 👋</h1>
                  <p className="text-gray-500 mt-2">
                    {isCoach 
                      ? "Itt találod majd a klienseid adatait és az elemzéseket." 
                      : "Itt rögzítheted a napi adataidat az edződ számára."}
                  </p>
                </div>
                
                {isCoach && (
                  <button onClick={() => setIsModalOpen(true)} className="flex items-center px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-md w-full sm:w-auto justify-center">
                    <span className="text-xl mr-2">+</span> Új kliens meghívása
                  </button>
                )}
              </div>

              {isCoach ? (
                clients.length === 0 ? (
                  <div className="bg-white rounded-2xl shadow-sm border border-dashed border-gray-300 p-16 text-center">
                    <div className="text-5xl mb-4 opacity-50">📂</div>
                    <h3 className="text-xl font-bold text-gray-700 mb-2">Még nincsenek klienseid</h3>
                    <p className="text-gray-500 max-w-md mx-auto">Küldj ki egy meghívó linket az első kliensednek, hogy elkezdhesse naplózni az adatait!</p>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                      <h3 className="text-lg font-bold text-gray-800">Saját klienseim ({clients.length})</h3>
                    </div>
                    <ul className="divide-y divide-gray-200">
                      {clients.map(client => (
                        <li key={client.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition">
                          <div className="flex items-center">
                            <div className="h-12 w-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xl mr-4 shrink-0">
                              {client.full_name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-md font-bold text-gray-900">{client.full_name}</p>
                              <p className="text-sm text-gray-500">{client.email}</p>
                            </div>
                          </div>
                          <button className="text-sm bg-white border border-gray-300 px-4 py-2 rounded-lg text-gray-700 font-bold hover:bg-gray-50 transition shadow-sm ml-4 shrink-0">
                            Megtekintés →
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              ) : (
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative">
                    <div className="h-2 w-full bg-linear-to-r from-orange-400 to-pink-500"></div>
                    <div className="p-8 md:p-10 flex flex-col md:flex-row items-center justify-between text-center md:text-left">
                      <div className="mb-6 md:mb-0">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Ma még nem naplóztál! 📝</h3>
                        <p className="text-gray-600 max-w-md">Az edződ várja az adataidat. Szánj rá 1 percet, és rögzítsd az alvásodat, stressz-szintedet és a vízfogyasztásodat!</p>
                      </div>
                      <button onClick={() => alert("Hamarosan ide kerül a csúszkás űrlap!")} className="px-8 py-4 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition shadow-lg shrink-0 w-full md:w-auto">
                        Napi Napló Hozzáadása
                      </button>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                      <h3 className="text-xl font-bold text-gray-800">Korábbi naplóid</h3>
                      <span className="text-sm font-bold text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full">3 Napos Széria 🔥</span>
                    </div>
                    
                    <ul className="divide-y divide-gray-200">
                      {[
                        { date: "Ma (Előző napi adatok)", sleep: "7.5 óra", mood: "😊 Szuper", color: "text-emerald-600", bg: "bg-emerald-50" },
                        { date: "Tegnap", sleep: "6 óra", mood: "😐 Közepes", color: "text-yellow-600", bg: "bg-yellow-50" },
                        { date: "Tegnapelőtt", sleep: "8 óra", mood: "😊 Szuper", color: "text-emerald-600", bg: "bg-emerald-50" },
                      ].map((log, idx) => (
                        <li key={idx} className="p-6 sm:px-8 hover:bg-gray-50 transition flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 cursor-pointer" onClick={() => alert("Ide jön a részletes nézet!")}>
                          <div>
                            <p className="font-bold text-gray-900 text-lg mb-1">{log.date}</p>
                            <p className="text-gray-500 text-sm">Alvás: {log.sleep} • Víz: 2.5 L</p>
                          </div>
                          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                            <span className={`px-4 py-2 rounded-lg text-sm font-bold ${log.bg} ${log.color}`}>{log.mood}</span>
                            <span className="text-gray-400 font-bold hover:text-emerald-600 transition">Részletek →</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                    <div className="p-4 text-center border-t border-gray-100">
                      <button className="text-sm font-bold text-gray-500 hover:text-gray-800 transition">Összes mutatása ↓</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================== */}
          {/* 2. PROFIL TAB                                */}
          {/* ========================================== */}
          {currentTab === "profile" && (
            <div className="animate-fade-in-up max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6">
                <div className={`h-32 bg-gradient-to-r ${themeGradient} w-full relative`}></div>
                
                <div className="px-8 pb-8 flex flex-col sm:flex-row items-center sm:items-start relative -mt-16">
                  <div className="h-32 w-32 bg-white rounded-full p-1 shadow-lg shrink-0 relative z-10">
                    <div className="h-full w-full bg-gray-100 rounded-full flex items-center justify-center text-5xl font-extrabold text-gray-400">
                      {loggedInUser.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  
                  {/* ÚJ: Dinamikusan kiírjuk az edző szakmáját a név alá! */}
                  <div className="mt-4 sm:mt-20 sm:ml-6 text-center sm:text-left flex-1">
                    <h2 className="text-3xl font-extrabold text-gray-900">{loggedInUser}</h2>
                    <p className="text-gray-500 font-medium">{isCoach ? (userSpecialization || "Személyi Edző") : "Boosted Kliens"}</p>
                  </div>
                  
                  <div className="mt-6 sm:mt-20 sm:ml-auto">
                    <button className="px-6 py-2 bg-gray-100 text-gray-800 font-bold rounded-lg hover:bg-gray-200 transition text-sm">
                      Profil Szerkesztése
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 space-y-6">
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Statisztikák</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                        <span className="text-gray-600">Regisztráció</span>
                        <span className="font-bold text-gray-900">2026. Március</span>
                      </div>
                      <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                        <span className="text-gray-600">Naplózások</span>
                        <span className={`font-bold ${themeText} ${themeBg} px-2 py-1 rounded`}>24 alkalom</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Jelenlegi széria</span>
                        <span className="font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded">🔥 3 nap</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2 space-y-6">
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Fiók Információk</h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Teljes Név</label>
                        <p className="font-medium text-gray-900 bg-gray-50 p-3 rounded-lg border border-gray-100">{loggedInUser}</p>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Fiók Típusa</label>
                        
                        {/* ÚJ: Itt is megjelenik a pontos szakma a kártyán */}
                        <p className={`font-medium p-3 rounded-lg border ${isCoach ? "text-purple-700 bg-purple-50 border-purple-100" : "text-emerald-700 bg-emerald-50 border-emerald-100"}`}>
                          {isCoach ? `${userSpecialization || "Edzői Fiók"}` : "Kliens Fiók"}
                        </p>
                      </div>
                      {!isCoach && (
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Kapcsolt Szakértő</label>
                          <div className="flex items-center p-4 bg-gray-50 border border-gray-200 rounded-lg">
                            <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold mr-3">E</div>
                            <div>
                              <p className="font-bold text-gray-900">Saját Edződ Neve</p>
                              <p className="text-xs text-gray-500">Ő látja a naplózott adataidat.</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>

        {/* --- MEGHÍVÓ MODAL --- */}
        {isModalOpen && isCoach && (
           <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
           <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md relative">
             <button onClick={() => { setIsModalOpen(false); setGeneratedLink(""); }} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold">×</button>
             <h2 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">Kliens Meghívása</h2>
             <p className="text-sm text-gray-500 mb-6">A meghívó link biztonsági okokból 24 óráig érvényes.</p>
             <div className="mb-6">
               <label className="block text-sm font-bold text-gray-700 mb-2">Küldés Emailben</label>
               <div className="flex">
                 <input type="email" placeholder="kliens@email.hu" className="flex-1 border border-gray-300 p-3 rounded-l-xl focus:outline-blue-500 bg-white text-black" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} />
                 <button onClick={() => handleGenerateInvite(true)} disabled={!clientEmail.includes("@")} className="bg-blue-600 text-white font-bold px-6 rounded-r-xl hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed">Küldés</button>
               </div>
             </div>
             <div className="relative flex py-4 items-center">
               <div className="flex-grow border-t border-gray-200"></div>
               <span className="shrink-0 px-4 text-gray-400 text-sm font-bold">VAGY</span>
               <div className="flex-grow border-t border-gray-200"></div>
             </div>
             <div>
               <button onClick={() => handleGenerateInvite(false)} className="w-full py-3 bg-gray-100 text-gray-800 font-bold rounded-xl hover:bg-gray-200 transition mb-4">🔗 Manuális Link Generálása</button>
               {generatedLink && (
                 <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                   <p className="text-xs font-bold text-green-800 mb-1 uppercase tracking-wide">Másolható Link:</p>
                   <input type="text" readOnly value={generatedLink} className="w-full bg-white border border-green-300 p-2 rounded text-sm text-black outline-none" onClick={(e) => { e.target.select(); navigator.clipboard.writeText(generatedLink); alert("Másolva!"); }} />
                 </div>
               )}
             </div>
           </div>
         </div>
        )}
      </div>
    );
  }
}