"use client";
import { useState, useEffect, useCallback, useRef } from "react";

// --- HANGULAT IKON KOMPONENS ---
function MoodIcon({ value }) {
  if (!value) {
    return (
      <div className="p-3 rounded-full bg-gray-100 text-gray-400 mr-4">
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      </div>
    );
  }

  let colorClass = "";
  let bgClass = "";
  let mouthPath = "";

  if (value <= 2) {
    colorClass = "text-red-500";
    bgClass = "bg-red-100";
    mouthPath = "M8 15c2-3 6-3 8 0"; 
  } else if (value === 3) {
    colorClass = "text-yellow-500";
    bgClass = "bg-yellow-100";
    mouthPath = "M9 15h6"; 
  } else {
    colorClass = "text-green-500";
    bgClass = "bg-green-100";
    mouthPath = "M8 15c2 3 6 3 8 0"; 
  }

  return (
    <div className={`p-3 rounded-full ${bgClass} ${colorClass} mr-4 transition-colors duration-500`}>
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M15 10h.01" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={mouthPath} />
      </svg>
    </div>
  );
}

// lenyíló ablak
function AccordionItem({ title, children }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-gray-200 rounded-xl mb-3 overflow-hidden transition-all duration-300 hover:shadow-md bg-white">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-4 text-left font-medium text-gray-700 hover:bg-gray-50 transition"
      >
        <span>{title}</span>
        <span className={`transform transition-transform duration-300 text-blue-500 font-bold text-xl ${isOpen ? 'rotate-180' : ''}`}>
          ↓
        </span>
      </button>
      <div 
        className={`transition-all duration-500 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div className="p-4 pt-0 text-gray-600 text-sm leading-relaxed border-t border-gray-100 mt-2">
            {children}
        </div>
      </div>
    </div>
  );
}

// --- NAVBAR KOMPONENS ---
function Navbar({ userName, currentView, setView, handleLogout }) {
  const navRef = useRef(null);

  const handleMouseMove = (e) => {
    const nav = navRef.current;
    if (!nav) return;
    const rect = nav.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    nav.style.setProperty("--x", `${x}px`);
    nav.style.setProperty("--y", `${y}px`);
  };

  return (
    <nav className="fixed w-full top-4 z-50 px-4 flex justify-center">
      <div
        ref={navRef}
        onMouseMove={handleMouseMove}
        className="relative w-full max-w-7xl bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/40 overflow-hidden 
                   before:content-[''] before:absolute before:inset-0 before:rounded-2xl 
                   before:bg-[radial-gradient(circle_at_var(--x)_var(--y),rgba(59,130,246,0.15),transparent_50%)] 
                   before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500"
      >
        <div className="flex justify-between items-center py-4 px-6 md:px-10 relative z-10">
          
          {/* LOGO */}
          <div className="flex items-center cursor-pointer group" onClick={() => setView("dashboard")}>
             <span className="text-2xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-purple-600 tracking-tight group-hover:opacity-80 transition">
                Boosted
             </span>
          </div>

          {/* MENÜ GOMBOK */}
          <div className="hidden md:flex space-x-1 bg-gray-100/50 p-1 rounded-xl">
             {['dashboard', 'mood', 'quest', 'profile'].map((item) => (
                <button
                  key={item}
                  onClick={() => setView(item)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 capitalize ${
                    currentView === item 
                      ? "bg-white text-blue-600 shadow-sm" 
                      : "text-gray-500 hover:text-gray-900 hover:bg-white/50"
                  }`}
                >
                  {item}
                </button>
             ))}
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600 hidden lg:block">
              Szia, <span className="font-bold text-gray-800">{userName.split(' ')[1]}</span>!
            </span>
            <button 
              onClick={handleLogout} 
              className="bg-red-50 hover:bg-red-100 text-red-500 p-2 rounded-full transition-colors"
              title="Kilépés"
            >
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

// --- FŐ ALKALMAZÁS ---
export default function Home() {
  const [view, setView] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [regName, setRegName] = useState("");
  const [token, setToken] = useState(null);
  const [fullName, setFullName] = useState("");
  const [inputHydration, setInputHydration] = useState("");
  const [inputMood, setInputMood] = useState("");
  const [claimedQuests, setClaimedQuests] = useState([]);
  const [regGender, setRegGender] = useState("male");
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
      full_name: "",
      height: 0,
      weight: 0
  });

  const [dashboardData, setDashboardData] = useState({ 
      hydration_ml: 0, 
      mood: null, 
      history: [], 
      xp: 0, 
      level: 1, 
      progress_xp: 0,
      height: 175,
      weight: 75 
  });

  // --- API FÜGGVÉNYEK ---

  const fetchDashboard = useCallback(async () => {
    if (!token) return;

    try {
      const res = await fetch("/api/dashboard/today", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDashboardData(data);
        if (data.user_name) setFullName(data.user_name);
      }
    } catch (err) {
      console.error("Hiba az adatok lekérésekor:", err);
    }
  }, [token]); 

  const handleClaim = async (questId, rewardAmount) => {
    try {
      const res = await fetch("/api/claim-xp", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ amount: rewardAmount }),
      });

      if (res.ok) {
        // ha sikeres, akkor berakjuk a begyűjtött listába
        setClaimedQuests([...claimedQuests, questId]);
        // dashboard frissites hogy látszódjon a szint
        fetchDashboard();
        alert(`Sikeresen jóváírva: +${rewardAmount} XP!`);
      }
    } catch (e) {
      alert("Hiba a jutalom jóváírásakor");
    }
  };

  useEffect(() => {
    if (view === "dashboard" && token) {
      fetchDashboard();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, token]); 

  const handleRegister = async () => {
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, full_name: regName, gender: regGender}),
      });
      if (res.ok) {
        alert("Sikeres regisztráció! Mostmár bejelentkezhetsz.");
        setView("login");
      } else {
        const err = await res.json();
        alert("Hiba: " + err.detail);
      }
    } catch (e) {
      alert("Szerver hiba");
    }
  };

  const handleLogin = async () => {
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        const data = await res.json();
        setToken(data.access_token);
        setFullName(data.full_name);
        setView("dashboard");
      } else {
        alert("Hibás email vagy jelszó!");
      }
    } catch (e) {
      alert("Szerver hiba");
    }
  };

  // --- SZERKESZTÉS INDÍTÁSA ---
  const startEditing = () => {
      setEditForm({
          full_name: fullName,
          height: dashboardData.height,
          weight: dashboardData.weight
      });
      setIsEditing(true);
  };

  // --- MENTÉS KEZELÉSE ---
  const saveProfile = async () => {
      try {
          const res = await fetch("/api/profile", {
              method: "PUT",
              headers: { 
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${token}`
              },
              body: JSON.stringify(editForm)
          });

          if (res.ok) {
              // Ha sikeres, frissítjük a helyi adatokat is
              setFullName(editForm.full_name);
              setDashboardData({
                  ...dashboardData, 
                  height: editForm.height, 
                  weight: editForm.weight
              });
              setIsEditing(false);
              alert("Sikeres mentés!");
          } else {
              alert("Hiba a mentés során.");
          }
      } catch (err) {
          console.error(err);
          alert("Szerver hiba.");
      }
  };

  const logData = async (type) => {
    const payload = {};
    if (type === "hydration") payload.hydration_ml = parseInt(inputHydration);
    if (type === "mood") payload.mood = parseInt(inputMood);

    const res = await fetch("/api/daily-log", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      if (type === "hydration") setInputHydration("");
      if (type === "mood") setInputMood("");
      fetchDashboard();
    } else {
        alert("Hiba a mentés során");
    }
  };

  const handleLogout = () => {
    setToken(null);
    setFullName("");
    setView("login");
    setEmail("");
    setPassword("");
    setRegName("");
  };

  // --- RENDERELÉS ---

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-sans text-gray-900">
        <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md border-t-4 border-blue-600">
          <h1 className="text-3xl font-extrabold mb-6 text-center text-gray-800">{view === "login" ? "Belépés" : "Regisztráció"}</h1>
          <div className="space-y-4">
            {view === "register" && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Teljes Név</label>
                    <input type="text" className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 mb-4" placeholder="Pl. Kiss Ádám" value={regName} onChange={e => setRegName(e.target.value)} />
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nem</label>
                    <select 
                        value={regGender} 
                        onChange={(e) => setRegGender(e.target.value)}
                        className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white"
                    >
                        <option value="male">Férfi</option>
                        <option value="female">Nő</option>
                    </select>
                </div>
            )}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email cím</label>
                <input type="email" className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900" placeholder="pelda@email.hu" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jelszó</label>
                <input type="password" className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
          </div>
          <div className="mt-8">
            {view === "login" ? (
                <>
                    <button onClick={handleLogin} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition shadow-md">Bejelentkezés</button>
                    <p className="text-center text-sm text-gray-600 mt-4">Nincs még fiókod? <button onClick={() => setView("register")} className="text-blue-600 font-bold hover:underline">Regisztrálj</button></p>
                </>
            ) : (
                <>
                    <button onClick={handleRegister} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition shadow-md">Fiók létrehozása</button>
                    <p className="text-center text-sm text-gray-600 mt-4">Már regisztráltál? <button onClick={() => setView("login")} className="text-blue-600 font-bold hover:underline">Jelentkezz be</button></p>
                </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans text-gray-900">
      
      <Navbar userName={fullName} currentView={view} setView={setView} handleLogout={handleLogout} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pt-32">
        {view === "dashboard" && (
            <div className="animate-fade-in-up">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-800">Szia, {fullName}!</h2>
                    <p className="text-gray-500">Kövesd nyomon a napi céljaidat és lépj szintet!</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"> 
                    
                    {/* 1. DOBOZ: VÍZ - Animált */}
                    <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100 
                                    transition-transform duration-500 hover:scale-105 hover:shadow-2xl cursor-default group">
                        <div className="p-6 flex items-center">
                            <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-500">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2.34M20 14.66a3 3 0 0 0-3-3.66l-1.5-1.5a6 6 0 0 0-8.49 0l-1.5 1.5a3 3 0 0 0-3 3.66M20 14.66V4a2 2 0 0 0-2-2h-3.34"></path></svg>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500 truncate">Mai Vízfogyasztás</dt>
                                <dd className="mt-1 text-3xl font-bold text-gray-900">{dashboardData.hydration_ml} <span className="text-sm text-gray-400 font-normal">ml</span></dd>
                            </div>
                        </div>
                    </div>

                    {/* 2. DOBOZ: HANGULAT - Animált */}
                    <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100 
                                    transition-transform duration-500 hover:scale-105 hover:shadow-2xl cursor-default group">
                        <div className="p-6 flex items-center">
                             {/* A MoodIcon-t itt hagyjuk ahogy van, az már szép */}
                             <MoodIcon value={dashboardData.mood} />
                            <div>
                                <dt className="text-sm font-medium text-gray-500 truncate">Aktuális Hangulat</dt>
                                <dd className="mt-1 text-3xl font-bold text-gray-900">{dashboardData.mood ? dashboardData.mood + "/5" : '-'}</dd>
                            </div>
                        </div>
                    </div>

                    {/* 3. DOBOZ: SZINT - Animált */}
                    <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100 
                                    transition-transform duration-500 hover:scale-105 hover:shadow-2xl cursor-default group">
                        <div className="p-6 flex items-center">
                            <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4 group-hover:bg-purple-600 group-hover:text-white transition-colors duration-500">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500 truncate">Jelenlegi Szint</dt>
                                <dd className="mt-1 text-3xl font-bold text-gray-900">{dashboardData.level}. <span className="text-sm text-gray-400 font-normal">szint</span></dd>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 border-b pb-2">Új adat rögzítése (+2 XP)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Víz (ml)</label>
                            <div className="flex rounded-md shadow-sm">
                                <input type="number" value={inputHydration} onChange={(e) => setInputHydration(e.target.value)} className="flex-1 min-w-0 block w-full px-4 py-3 rounded-l-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900" placeholder="pl. 250" />
                                <button onClick={() => logData("hydration")} className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-r-md text-white bg-blue-600 hover:bg-blue-700 transition">Mentés</button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Hangulat (1-5)</label>
                            <div className="flex rounded-md shadow-sm">
                                <input type="number" min="1" max="5" value={inputMood} onChange={(e) => setInputMood(e.target.value)} className="flex-1 min-w-0 block w-full px-4 py-3 rounded-l-md border border-gray-300 focus:ring-green-500 focus:border-green-500 sm:text-sm text-gray-900" placeholder="1-5" />
                                <button onClick={() => logData("mood")} className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-r-md text-white bg-green-600 hover:bg-green-700 transition">Mentés</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100 mt-10">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 border-b pb-2">Korábban rögzített adatok:</h3>
                    {dashboardData.history && dashboardData.history.length > 0 ? (
                        <ul className="divide-y divide-gray-200">
                            {dashboardData.history.map((item, index) => (
                                <li key={index} className="py-4 flex items-center justify-between">
                                    <div className="flex items-center">
                                        <span className="text-sm text-gray-500 mr-4 font-mono bg-gray-100 px-2 py-1 rounded">[{item.timestamp}]</span>
                                        <span className="text-gray-800">{item.type === 'hydration' ? `Megittál ${item.value} ml vizet 💧` : `A hangulatod pedig: ${item.value}/5 ${item.value >= 4 ? '😊' : item.value <= 2 ? '☹️' : '😐'}`}</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-500 italic">Még nincsenek rögzített adatok.</p>
                    )}
                </div>
            </div>
        )}

        {view === "profile" && (
            <div className="bg-white shadow-lg rounded-xl p-8 max-w-2xl mx-auto animate-fade-in-up">
                
                {/* FEJLÉC */}
                <div className="flex items-center space-x-4 mb-6">
                    <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-2xl font-bold">
                        {fullName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        {isEditing ? (
                            <input 
                                type="text" 
                                value={editForm.full_name} 
                                onChange={(e) => setEditForm({...editForm, full_name: e.target.value})}
                                className="text-2xl font-bold text-gray-900 border-b-2 border-blue-500 focus:outline-none"
                            />
                        ) : (
                            <h2 className="text-2xl font-bold text-gray-900">{fullName}</h2>
                        )}
                        <p className="text-gray-500">Boosted Felhasználó</p>
                    </div>
                </div>

                {/* bmi calculator*/}
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 mb-6 text-center shadow-inner">
                    <h3 className="text-lg font-bold text-blue-900 mb-2">Testtömeg Index (BMI)</h3>
                    
                    {dashboardData.height > 0 && dashboardData.weight > 0 ? (
                        <div>
                            {/* bmi calculator */}
                            <span className="text-4xl font-extrabold text-blue-600 block mb-1">
                                { (dashboardData.weight / ((dashboardData.height / 100) ** 2)).toFixed(1) }
                            </span>

                            {/* A kategória kiírása */}
                            {(() => {
                                const bmi = dashboardData.weight / ((dashboardData.height / 100) ** 2);
                                if (bmi < 18.5) return <span className="px-3 py-1 rounded-full bg-blue-200 text-blue-800 font-bold text-sm">Sovány</span>;
                                if (bmi < 25) return <span className="px-3 py-1 rounded-full bg-green-200 text-green-800 font-bold text-sm">Normál testsúly</span>;
                                if (bmi < 30) return <span className="px-3 py-1 rounded-full bg-yellow-200 text-yellow-800 font-bold text-sm">Túlsúlyos</span>;
                                return <span className="px-3 py-1 rounded-full bg-red-200 text-red-800 font-bold text-sm">Elhízott</span>;
                            })()}
                        </div>
                    ) : (
                        <p className="text-sm text-blue-400 italic">Add meg a magasságod és súlyod a számításhoz!</p>
                    )}
                </div>

                {/* progress bar / level */}
                <div className="bg-gray-50 rounded-lg p-6 mb-6 border border-gray-200">
                    <div className="flex justify-between items-end mb-2">
                        <div>
                            <h3 className="font-bold text-lg text-gray-800">{dashboardData.level}. Szint</h3>
                            <p className="text-sm text-gray-500">Összesen {dashboardData.xp} XP</p>
                        </div>
                        <span className="text-sm font-semibold text-blue-600">{dashboardData.progress_xp} / 50 XP</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4">
                        <div 
                            className="bg-linear-to-r from-blue-500 to-purple-500 h-4 rounded-full transition-all duration-1000" 
                            style={{ width: `${(dashboardData.progress_xp / 50) * 100}%` }}
                        ></div>
                    </div>
                    <p className="text-xs text-gray-400 mt-2 text-center">
                        Még {50 - dashboardData.progress_xp} XP kell a következő szintig!
                    </p>
                </div>

                {/* ADATOK LISTÁJA / SZERKESZTŐJE */}
                <div className="border-t border-gray-200 py-4">
                    <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                        <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500">Email cím</dt>
                            <dd className="mt-1 text-sm text-gray-900 font-semibold">{email}</dd>
                        </div>

                        <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500">Státusz</dt>
                            <dd className="mt-1 text-sm text-green-600 font-bold bg-green-100 inline-block px-2 py-0.5 rounded">Aktív MVP Tesztelő</dd>
                        </div>

                        <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500">Csomag</dt>
                            <dd className="mt-1 text-sm text-gray-900">Ingyenes</dd>
                        </div>

                        <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500">Nem</dt>
                            <dd className="mt-1 text-sm text-gray-900">
                                {dashboardData.gender === 'male' ? 'Férfi' : dashboardData.gender === 'female' ? 'Nő' : 'Egyéb'}
                            </dd>
                        </div>
                        
                        {/* height */}
                        <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500">Magasság</dt>
                            <dd className="mt-1 text-sm text-gray-900">
                                {isEditing ? (
                                    <div className="flex items-center">
                                        <input 
                                            type="number" 
                                            value={editForm.height} 
                                            onChange={(e) => setEditForm({...editForm, height: parseInt(e.target.value) || 0})}
                                            className="w-20 border border-gray-300 rounded p-1 mr-2"
                                        /> cm
                                    </div>
                                ) : (
                                    <span>{dashboardData.height} cm</span>
                                )}
                            </dd>
                        </div>

                        {/* weight */}
                        <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500">Testsúly</dt>
                            <dd className="mt-1 text-sm text-gray-900">
                                {isEditing ? (
                                    <div className="flex items-center">
                                        <input 
                                            type="number" 
                                            value={editForm.weight} 
                                            onChange={(e) => setEditForm({...editForm, weight: parseInt(e.target.value) || 0})}
                                            className="w-20 border border-gray-300 rounded p-1 mr-2"
                                        /> kg
                                    </div>
                                ) : (
                                    <span>{dashboardData.weight} kg</span>
                                )}
                            </dd>
                        </div>
                    </dl>
                </div>

                {/* GOMBOK */}
                <div className="mt-8 flex justify-end space-x-3">
                    {isEditing ? (
                        <>
                            <button 
                                onClick={() => setIsEditing(false)} 
                                className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition"
                            > Mégse</button>
                            <button 
                                onClick={saveProfile} 
                                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition shadow-md"
                            >Mentés</button>
                        </>
                    ) : (
                        <button 
                            onClick={startEditing} 
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition shadow-md flex items-center"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                            Szerkesztés
                        </button>
                    )}
                </div>
            </div>
        )}


        {/* MOOD oldal */}
        {view === "mood" && (
            <div className="bg-white shadow-lg rounded-xl p-8 max-w-4xl mx-auto animate-fade-in-up">
                <div className="mb-10">
                    <div className="text-center mb-6">
                        {dashboardData.mood && dashboardData.mood <= 2 ? (
                            <>
                                <span className="text-5xl mb-2 block"></span>
                                <h2 className="text-2xl font-bold text-gray-800 mb-2">Mood Tracker</h2>
                                <p className="text-gray-500">Úgy látom, elég lehangolt vagy. Segíthetek?</p>
                            </>
                        ) : (
                            <>
                                <span className="text-5xl mb-2 block"></span>
                                <h2 className="text-2xl font-bold text-gray-800 mb-2">Mood Tracker</h2>
                                <p className="text-gray-500">Íme pár tipp, hogy a legjobb formádban legyél.</p>
                            </>
                        )}
                    </div>

                    {/* LENYITHATÓ DOBOZOK */}
                    <div className="max-w-2xl mx-auto">
                        <AccordionItem title="Nem tudod, hogyan kezdj hozzá az egészséges életmódhoz?">
                            A legfontosabb a fokozatosság! Ne akarj mindent egyszerre megváltoztatni. 
                            <ul className="list-disc list-inside mt-2 space-y-1">
                                <li><strong>Igyál egy pohár vizet</strong> minden reggel ébredés után.</li>
                                <li>Sétálj naponta legalább <strong>15-20 percet</strong> friss levegőn.</li>
                                <li>Próbáld ki a &quot;80/20-as szabályt&quot;: 80%-ban egyél tápláló ételeket, 20%-ban ami jólesik.</li>
                            </ul>
                        </AccordionItem>
                        
                        <AccordionItem title="Szeretnél kapni pár tippet a tökéletes alváshoz?">
                            Az alvás a regeneráció alapja. Így javíthatod:
                            <ul className="list-disc list-inside mt-2 space-y-1">
                                <li><strong>Kékfény-stop:</strong> Lefekvés előtt 1 órával már ne nyomkodd a telefonod.</li>
                                <li><strong>Hűvös szoba:</strong> Az ideális alvási hőmérséklet 18-20°C körül van.</li>
                                <li><strong>Rendszeresség:</strong> Próbálj meg minden nap ugyanakkor feküdni és kelni.</li>
                            </ul>
                        </AccordionItem>

                        <AccordionItem title="Stresszkezelés és mentális jólét">
                            Ha úgy érzed, összecsaptak a fejed felett a hullámok:
                            <ul className="list-disc list-inside mt-2 space-y-1">
                                <li>Próbáld ki a <strong>Box Breathing</strong> technikát: 4 mp belégzés, 4 mp bent tart, 4 mp kilégzés, 4 mp szünet.</li>
                                <li>Írj ki magadból mindent! A naplózás segít rendszerezni a gondolatokat.</li>
                            </ul>
                        </AccordionItem>

                        <AccordionItem title="Esetleg pánikbetegséggel küzdesz? Ne aggódj, segítünk!">
                            Ha úgy érzed, hogy pánikrohamok törnének rád:
                            <ul className="list-disc list-inside mt-2 space-y-1">
                                <li><strong>3-3-3 szabály:</strong> Nevezz meg 3 dolgot, amit látsz, 3 hangot, amit hallasz, és mozgass meg 3 testrészedet.</li>
                                <li><strong>4-7-8 légzés: </strong>Beszívod a levegőt az orrodon át 4 másodpercig. Bent tartod a levegőt 7 másodpercig. Lassan kifújod a szádon át (mintha gyertyát fújnál) 8 másodpercig.</li>
                                <li><strong>Mondd ki magadban: </strong><i>&quot;Ez csak a szorongás, biztonságban vagyok, el fog múlni.&quot;</i></li>
                                <li><strong>A &quot;Búvárreflex&quot; aktiválása: </strong>Mi ez? Ha hideg víz éri az arcunkat(különösen a szemet és az orrot), a szívverés automatikusan lelassul. </li>
                                <li>
                                    <strong>Progresszív izomrelaxáció</strong> Tipp: Szorítsd ökölbe a kezedet teljes erőből 5 másodpercig, majd hirtelen engedd el. Ezt csináld végig a lábfejeddel, vádliddal, vállaiddal is.
                                    <div className="mt-2 ml-4 p-3 bg-gray-50 border-l-4 border-blue-400 rounded-r-md">
                                        <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                                            Miért működik?
                                        </h5>
                                        <p className="text-sm text-gray-600 italic">
                                            A fizikai feszülés utáni hirtelen ellazulás biológiai jelet küld az agynak (a paraszimpatikus idegrendszernek), hogy a &quot;veszély&quot; elmúlt. Ez kikapcsolja a belső vészjelzőt, és a test automatikusan elkezd megnyugodni.
                                        </p>
                                    </div>
                                </li>
                            </ul>
                        </AccordionItem>
                    </div>
                </div>

                <hr className="border-gray-100 my-8" />

                {/* STATISZTIKA */}
                <h3 className="text-xl font-bold text-gray-700 mb-6 text-center">Az elmúlt időszak statisztikái</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                    <div className="bg-purple-50 rounded-2xl p-6 flex items-center justify-between border border-purple-100">
                        <div>
                            <p className="text-purple-600 font-medium mb-1">Átlagos hangulatod</p>
                            <h3 className="text-4xl font-bold text-gray-800">
                                {(() => {
                                    const moodLogs = dashboardData.history.filter(h => h.type === 'mood');
                                    if (moodLogs.length === 0) return "-";
                                    const avg = moodLogs.reduce((acc, curr) => acc + curr.value, 0) / moodLogs.length;
                                    return avg.toFixed(1);
                                })()}
                                <span className="text-lg text-gray-400 font-normal"> / 5</span>
                            </h3>
                        </div>
                        <div className="bg-white p-3 rounded-full shadow-sm">
                            <span className="text-3xl">🤔</span>
                        </div>
                    </div>

                    <div className="bg-blue-50 rounded-2xl p-6 flex items-center justify-between border border-blue-100">
                        <div>
                            <p className="text-blue-600 font-medium mb-1">Rögzített naplók</p>
                            <h3 className="text-4xl font-bold text-gray-800">
                                {dashboardData.history.filter(h => h.type === 'mood').length}
                                <span className="text-lg text-gray-400 font-normal"> db</span>
                            </h3>
                        </div>
                        <div className="bg-white p-3 rounded-full shadow-sm">
                            <span className="text-3xl">📝</span>
                        </div>
                    </div>
                </div>
                <div className="text-center">
                     <button onClick={() => setView("dashboard")} className="text-blue-600 hover:underline font-medium">
                        ← Vissza a Dashboardra
                    </button>
                </div>
            </div>
        )}

        {/* QUEST oldal */}
        {view === "quest" && (
            <div className="bg-white shadow-lg rounded-xl p-6 max-w-3xl mx-auto animate-fade-in-up">
                <div className="text-center mb-8">
                    <div className="p-4 bg-yellow-50 inline-block rounded-full mb-4">
                         <svg className="w-12 h-12 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Heti kihívások</h2>
                    <p className="text-gray-500">Teljesítsd a feladatokat extra XP-ért!</p>
                </div>

                <div className="space-y-6">
                    {[
                        {
                            id: 1,
                            title: "A Hidratálás Mestere",
                            desc: "Igyál meg összesen 3000 ml vizet a mai napon.",
                            current: dashboardData.hydration_ml,
                            target: 3000,
                            unit: "ml",
                            icon: "💧",
                            reward: 15
                        },
                        {
                            id: 2,
                            title: "Naplózás Bajnok",
                            desc: "Rögzíts legalább 10 adatot (bármilyet) a naplóba.",
                            current: dashboardData.history.length,
                            target: 10,
                            unit: "db",
                            icon: "📝",
                            reward: 15
                        },
                        {
                            id: 3,
                            title: "Nagy Kortyok",
                            desc: "Igyál legalább 3 alkalommal 500 ml (vagy több) vizet.",
                            current: dashboardData.history.filter(h => h.type === 'hydration' && h.value >= 500).length,
                            target: 3,
                            unit: "alkalom",
                            icon: "🌊",
                            reward: 15
                        },
                        {
                            id: 4,
                            title: "Tudatos Jelenlét",
                            desc: "Rögzítsd a hangulatodat legalább 5 alkalommal.",
                            current: dashboardData.history.filter(h => h.type === 'mood').length,
                            target: 5,
                            unit: "alkalom",
                            icon: "🧘",
                            reward: 15
                        },
                        {
                            id: 5,
                            title: "Szintlépés",
                            desc: "Érd el a 2. szintet a profilodon!",
                            current: dashboardData.level,
                            target: 2,
                            unit: "szint",
                            icon: "⭐",
                            reward: 50
                        }
                    ].map((quest) => {
                        const progress = Math.min((quest.current / quest.target) * 100, 100);
                        const isCompleted = quest.current >= quest.target;
                        // ellenőrzés, hogy be van e gyűjtve
                        const isClaimed = claimedQuests.includes(quest.id);

                        return (
                            <div key={quest.id} className={`border rounded-xl p-4 transition ${isCompleted ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center">
                                        <span className="text-2xl mr-3">{quest.icon}</span>
                                        <div>
                                            <h3 className="font-bold text-gray-900">{quest.title}</h3>
                                            <p className="text-sm text-gray-500">{quest.desc}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="block text-sm font-bold text-yellow-600">+{quest.reward} XP</span>
                                        {isCompleted && !isClaimed && <span className="text-xs font-bold text-green-600 uppercase tracking-wide">Teljesítve!</span>}
                                        {isClaimed && <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Begyűjtve</span>}
                                    </div>
                                </div>
                                
                                <div className="mt-3">
                                    <div className="flex justify-between text-xs font-semibold text-gray-600 mb-1">
                                        <span>{quest.current} / {quest.target} {quest.unit}</span>
                                        <span>{Math.round(progress)}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                        <div 
                                            className={`h-3 rounded-full transition-all duration-1000 ${isCompleted ? 'bg-green-500' : 'bg-blue-500'}`} 
                                            style={{ width: `${progress}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <div className="mt-4 flex justify-end">
                                    <button 
                                        disabled={!isCompleted || isClaimed}
                                        onClick={() => handleClaim(quest.id, quest.reward)}
                                        className={`px-4 py-2 rounded-lg text-sm font-bold transition ${
                                            isClaimed 
                                                ? "bg-gray-300 text-gray-500 cursor-default" 
                                                : isCompleted 
                                                    ? "bg-yellow-400 text-yellow-900 hover:bg-yellow-500 cursor-pointer shadow-sm animate-pulse" 
                                                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                        }`}
                                    >
                                        {isClaimed ? "Jutalom Begyűjtve" : isCompleted ? "Jutalom Begyűjtése" : "Még folyamatban"}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-8 text-center">
                    <button onClick={() => setView("dashboard")} className="text-blue-600 hover:underline font-medium">
                        ← Vissza a Dashboardra
                    </button>
                </div>
            </div>
        )}
      </main>
    </div>
  );
}