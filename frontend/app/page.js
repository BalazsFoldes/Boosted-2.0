"use client";
import { useState, useEffect } from "react";
// ÚJ: ComposedChart és Bar importálása az oszlopdiagramhoz
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Home() {
  const [view, setView] = useState("landing"); 

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [specialization, setSpecialization] = useState("Személyi Edző");
  
  const [loggedInUser, setLoggedInUser] = useState(""); 
  const [coachId, setCoachId] = useState(null); 
  const [userRole, setUserRole] = useState(""); 
  const [userId, setUserId] = useState(null); 
  const [userSpecialization, setUserSpecialization] = useState("");
  const [clientWeeklyPlan, setClientWeeklyPlan] = useState({}); 
  
  // ÚJ: Gamifikációs állapotok a Kliensnél
  const [totalBoosts, setTotalBoosts] = useState(0);
  const [hasUnseenBoost, setHasUnseenBoost] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clientEmail, setClientEmail] = useState("");
  const [generatedLink, setGeneratedLink] = useState("");

  const [clients, setClients] = useState([]);
  const [currentTab, setCurrentTab] = useState("overview");
  
  const [searchQuery, setSearchQuery] = useState("");

  const filteredClients = clients.filter(client => 
    client.full_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    client.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ==========================================
  // ÁLLAPOTOK: KLIENS NAPI NAPLÓZÁS
  // ==========================================
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [clientLogs, setClientLogs] = useState([]); 
  const [hasLoggedToday, setHasLoggedToday] = useState(false); 
  
  const [sleepHours, setSleepHours] = useState(7); 
  const [stressLevel, setStressLevel] = useState(5); 
  const [waterLiters, setWaterLiters] = useState(2.0); 
  const [workoutMinutes, setWorkoutMinutes] = useState(0); 
  const [mood, setMood] = useState("😊 Szuper"); 
  const [logNotes, setLogNotes] = useState("");

  // ==========================================
  // ÁLLAPOTOK: EDZŐI KLIENS ADATLAP & TERVEZŐ
  // ==========================================
  const [selectedClient, setSelectedClient] = useState(null); 
  const [selectedClientLogs, setSelectedClientLogs] = useState([]); 
  
  const getMonday = (d) => {
    const date = new Date(d);
    const day = date.getDay() || 7; 
    date.setDate(date.getDate() - (day - 1));
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const dayOfMonth = String(date.getDate()).padStart(2, '0');
    return `${date.getFullYear()}-${month}-${dayOfMonth}`;
  };

  const getDayDateLabel = (weekStartStr, dayIndex) => {
    const d = new Date(weekStartStr);
    d.setDate(d.getDate() + dayIndex);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${month}.${day}.`;
  };

  const currentRealMonday = getMonday(new Date()); 

  const [selectedWeek, setSelectedWeek] = useState(currentRealMonday); 
  const [clientAllPlans, setClientAllPlans] = useState([]); 
  
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [planDay, setPlanDay] = useState("Hétfő");
  const [planText, setPlanText] = useState("");
  
  const [coachNotes, setCoachNotes] = useState("");

  const activePlanObj = clientAllPlans.find(p => p.week_start === selectedWeek);
  const modalWeeklyPlan = activePlanObj && activePlanObj.plan_data ? JSON.parse(activePlanObj.plan_data) : {};

  const todayPlanObj = clientAllPlans.find(p => p.week_start === currentRealMonday);
  const currentDashboardPlan = todayPlanObj && todayPlanObj.plan_data ? JSON.parse(todayPlanObj.plan_data) : {};

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

    const fetchClientLogs = async () => {
      if (!userId) return;
      try {
        const res = await fetch(`http://localhost:8000/api/client/${userId}/logs`);
        if (res.ok) {
          const logs = await res.json();
          setClientLogs(logs);
          const today = new Date().toISOString().split("T")[0];
          setHasLoggedToday(logs.some(log => log.date === today));
        }
      } catch (error) {
        console.error("Hiba a naplók lekérésekor:", error);
      }
    };

    if (view === "dashboard") {
      if (userRole === "COACH") {
        fetchClients();
      } else if (userRole === "CLIENT") {
        fetchClientLogs();
      }
    }
  }, [view, userRole, coachId, userId]);

  const handleViewClient = async (client) => {
    setSelectedClient(client);
    setSelectedWeek(currentRealMonday); 
    setPlanDay("Hétfő");
    setPlanText("");
    setCoachNotes(client.coach_notes || "");
    
    try {
      const resLogs = await fetch(`http://localhost:8000/api/client/${client.id}/logs`);
      if (resLogs.ok) {
        const logs = await resLogs.json();
        setSelectedClientLogs(logs.reverse());
      }
      const resPlans = await fetch(`http://localhost:8000/api/client/${client.id}/plans`);
      if (resPlans.ok) {
        const plans = await resPlans.json();
        setClientAllPlans(plans);
      }
    } catch (error) {
      console.error("Hiba a kliens adatainak lekérésekor:", error);
    }
  };

  const handleSaveLog = async () => {
    try {
      const today = new Date().toISOString().split("T")[0]; 
      const payload = {
        client_id: userId, date: today, sleep_hours: sleepHours, stress_level: stressLevel,
        water_liters: waterLiters, workout_minutes: workoutMinutes, mood: mood, notes: logNotes || "" 
      };

      const res = await fetch("http://localhost:8000/api/client/log", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
      });

      if (res.ok) {
        setHasLoggedToday(true);
        setIsLogModalOpen(false);
        setClientLogs([{...payload, id: Date.now()}, ...clientLogs]);
        setSleepHours(7); setStressLevel(5); setWaterLiters(2.0); setWorkoutMinutes(0); setMood("😊 Szuper"); setLogNotes("");
      } else {
        const err = await res.json();
        alert("Hiba: " + err.detail);
      }
    } catch (error) {
      alert("Szerver hiba mentés közben.");
    }
  };

  const handleSaveDayPlan = async () => {
    const updatedPlan = { ...modalWeeklyPlan, [planDay]: planText };
    const planDataStr = JSON.stringify(updatedPlan);
    
    let newPlans = [...clientAllPlans];
    const existingIdx = newPlans.findIndex(p => p.week_start === selectedWeek);
    if (existingIdx >= 0) {
        newPlans[existingIdx].plan_data = planDataStr;
    } else {
        newPlans.push({ week_start: selectedWeek, plan_data: planDataStr });
    }
    setClientAllPlans(newPlans);
    
    try {
      const res = await fetch(`http://localhost:8000/api/client/${selectedClient.id}/plan`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ week_start_date: selectedWeek, plan_data: planDataStr }),
      });
      if (res.ok) {
        alert(`${planDay} nap terve sikeresen elmentve!`);
        setPlanText("");
      }
    } catch (error) {
      alert("Szerver hiba a terv mentésekor.");
    }
  };

  const handleSaveNotes = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/client/${selectedClient.id}/notes`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coach_notes: coachNotes }),
      });
      if (res.ok) {
        setClients(clients.map(c => c.id === selectedClient.id ? { ...c, coach_notes: coachNotes } : c));
      }
    } catch (error) {
      alert("Hiba a mentés során.");
    }
  };

  // ÚJ: Boost Küldése az Edzőtől
  const handleSendBoost = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/client/${selectedClient.id}/boost`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        alert(`⚡ Sikeresen küldtél egy motivációs Boost-ot ${selectedClient.full_name} számára!`);
        // Frissítjük a lokális adatokat
        setSelectedClient({ ...selectedClient, total_boosts: data.total_boosts });
        setClients(clients.map(c => c.id === selectedClient.id ? { ...c, total_boosts: data.total_boosts } : c));
      }
    } catch (error) {
      alert("Hiba a boost küldésekor.");
    }
  };

  // ÚJ: Boost Nyugtázása a Klienstől (Eltünteti a felugró ablakot)
  const handleAcknowledgeBoost = async () => {
    setHasUnseenBoost(false); // Azonnal eltüntetjük a modált
    try {
      await fetch(`http://localhost:8000/api/client/${userId}/clear-boost`, { method: "POST" });
    } catch (error) {
      console.error("Hiba a nyugtázáskor:", error);
    }
  };

  const changeWeek = (daysOffset) => {
    const current = new Date(selectedWeek);
    current.setDate(current.getDate() + daysOffset);
    const newWeekStr = getMonday(current);

    const maxFutureDate = new Date(currentRealMonday);
    maxFutureDate.setDate(maxFutureDate.getDate() + 7);
    const maxWeekStr = getMonday(maxFutureDate);

    if (newWeekStr > maxWeekStr) { return; }

    const minPastDate = new Date(currentRealMonday);
    minPastDate.setDate(minPastDate.getDate() - 28); 
    const minWeekStr = getMonday(minPastDate);

    if (newWeekStr < minWeekStr) { return; }
    
    setSelectedWeek(newWeekStr);
    setPlanDay("Hétfő");
    setPlanText("");
  };

  useEffect(() => {
    if (isPlanModalOpen) {
      setPlanText(modalWeeklyPlan[planDay] || "");
    }
  }, [planDay, selectedWeek, isPlanModalOpen]);

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:8000/api/register", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, full_name: fullName, specialization }),
      });
      if (res.ok) {
        alert("Sikeres regisztráció! Kérjük, jelentkezz be.");
        setView("login"); setPassword(""); 
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
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        const data = await res.json();
        setLoggedInUser(data.full_name); setUserRole(data.role); setUserId(data.user_id); 
        setUserSpecialization(data.specialization); 
        setCoachId(data.role === "COACH" ? data.user_id : data.coach_id); 
        if (data.role === "CLIENT") {
           setClientWeeklyPlan(data.weekly_plan ? JSON.parse(data.weekly_plan) : {});
           // ÚJ: Gamifikációs adatok betöltése
           setTotalBoosts(data.total_boosts);
           setHasUnseenBoost(data.has_unseen_boost);
        }
        setCurrentTab("overview"); setView("dashboard"); 
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
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        setGeneratedLink(data.link);
        if (sendEmail) { alert(`Email elküldve a következő címre: ${clientEmail}`); setClientEmail(""); }
      } else {
        alert("Hiba a generálás során.");
      }
    } catch (error) {
      alert("Szerver hiba.");
    }
  };

  const handleLogout = () => {
    setLoggedInUser(""); setCoachId(null); setUserRole(""); setUserId(null); setUserSpecialization("");
    setClients([]); setClientLogs([]); setHasLoggedToday(false); setSelectedClient(null); setSelectedClientLogs([]);
    setClientAllPlans([]); setClientWeeklyPlan({}); setCoachNotes("");
    setTotalBoosts(0); setHasUnseenBoost(false);
    setEmail(""); setPassword(""); setFullName(""); setView("landing");
  };

  const formatDateLabel = (dateString) => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const logDate = new Date(dateString); logDate.setHours(0, 0, 0, 0);
    const diffTime = Math.abs(today - logDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    if (diffDays === 0) return `Ma (${dateString})`;
    if (diffDays === 1) return `Tegnap (${dateString})`;
    if (diffDays === 2) return `Tegnapelőtt (${dateString})`;
    return dateString;
  };

  const inputStyle = "w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white text-gray-900 font-sans font-medium tracking-wide transition-all";
  const moodOptions = [{ icon: "😢", label: "Rossz" }, { icon: "😐", label: "Közepes" }, { icon: "😊", label: "Jó" }, { icon: "🤩", label: "Szuper" }];
  const daysOfWeek = ["Hétfő", "Kedd", "Szerda", "Csütörtök", "Péntek", "Szombat", "Vasárnap"];

  if (view === "landing") {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col font-sans overflow-x-hidden">
        <header className="w-full p-6 flex justify-between items-center bg-white shadow-sm border-b border-gray-100 z-10">
          <div className="text-2xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-purple-600 tracking-tight">Boosted</div>
          <button onClick={() => setView("login")} className="px-6 py-2 bg-gray-100 text-gray-800 font-bold rounded-lg hover:bg-gray-200 transition text-sm">Bejelentkezés</button>
        </header>

        <main className="flex-1 max-w-6xl mx-auto px-4 py-16 md:py-24 flex flex-col items-center text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-8 tracking-tighter leading-tight">Emeld új szintre a <br /><span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-purple-600">közös munkát</span></h1>
          <p className="text-xl text-gray-600 mb-16 max-w-2xl leading-relaxed">A Boosted egy adatközpontú platform, amely összeköti a szakértőket és klienseiket. Kövesd az alvást, a stresszt és az edzéseket egyetlen felületen.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl text-left">
            <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100 flex flex-col">
              <div className="text-4xl mb-4">🏃‍♂️</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Klienseknek</h2>
              <p className="text-gray-600 mb-6 flex-1">Naplózd egyszerűen a napi biometrikus adataidat.</p>
              <div className="p-4 bg-orange-50 text-orange-800 rounded-lg text-sm border border-orange-100 font-medium">⚠️ Csatlakozni kizárólag a szakértődtől kapott meghívóval tudsz!</div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl shadow-md border border-blue-100 flex flex-col">
              <div className="text-4xl mb-4">📊</div>
              <h2 className="text-2xl font-bold text-blue-900 mb-3">Szakértőknek</h2>
              <p className="text-blue-800 mb-6 flex-1 opacity-90">Lásd át az összes kliensed állapotát egyetlen Dashboardon.</p>
              <button onClick={() => setView("register")} className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg hover:shadow-blue-200">Regisztráció Szakértőként</button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (view === "register") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border-t-4 border-blue-600">
          <h2 className="text-3xl font-extrabold mb-2 text-gray-900 text-center tracking-tight">Szakértői Fiók Létrehozása</h2>
          <form onSubmit={handleRegister} className="space-y-5 mt-8">
            <div><label className="block text-sm font-semibold text-gray-700 mb-1">Teljes Név</label><input type="text" required className={inputStyle} value={fullName} onChange={(e) => setFullName(e.target.value)} /></div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Szakma / Terület</label>
              <select className={`${inputStyle} cursor-pointer`} value={specialization} onChange={(e) => setSpecialization(e.target.value)}>
                <option value="Személyi Edző">Személyi Edző</option><option value="Fizioterapeuta / Gyógytornász">Fizioterapeuta / Gyógytornász</option>
                <option value="Dietetikus / Táplálkozási Tanácsadó">Dietetikus / Táplálkozási Tanácsadó</option><option value="Sportpszichológus">Sportpszichológus</option>
                <option value="Életmód Tanácsadó (Health Coach)">Életmód Tanácsadó (Health Coach)</option><option value="Egyéb Szakértő">Egyéb</option>
              </select>
            </div>
            <div><label className="block text-sm font-semibold text-gray-700 mb-1">Email cím</label><input type="email" required className={inputStyle} value={email} onChange={(e) => setEmail(e.target.value)} /></div>
            <div><label className="block text-sm font-semibold text-gray-700 mb-1">Jelszó</label><input type="password" required className={inputStyle} value={password} onChange={(e) => setPassword(e.target.value)} /></div>
            <button type="submit" className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition shadow-lg">Regisztrálok</button>
          </form>
          <button onClick={() => setView("landing")} className="mt-6 text-sm text-gray-500 hover:text-gray-800 w-full text-center transition">← Vissza a főoldalra</button>
        </div>
      </div>
    );
  }

  if (view === "login") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border-t-4 border-gray-800">
          <h2 className="text-3xl font-extrabold mb-2 text-gray-900 text-center tracking-tight">Üdv újra!</h2>
          <form onSubmit={handleLogin} className="space-y-5 mt-8">
            <div><label className="block text-sm font-semibold text-gray-700 mb-1">Email cím</label><input type="email" required className={inputStyle} value={email} onChange={(e) => setEmail(e.target.value)} /></div>
            <div><label className="block text-sm font-semibold text-gray-700 mb-1">Jelszó</label><input type="password" required className={inputStyle} value={password} onChange={(e) => setPassword(e.target.value)} /></div>
            <button type="submit" className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl hover:bg-black transition shadow-lg">Belépés</button>
          </form>
          <button onClick={() => setView("landing")} className="mt-6 text-sm text-gray-500 hover:text-gray-800 w-full text-center transition">← Vissza a főoldalra</button>
        </div>
      </div>
    );
  }

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
            {!selectedClient && (
              <nav className="hidden sm:flex space-x-2">
                <button onClick={() => setCurrentTab("overview")} className={`px-5 py-2 text-sm font-bold rounded-full transition-all duration-200 ${currentTab === "overview" ? `${themeBg} ${themeText}` : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"}`}>Áttekintés</button>
                <button onClick={() => setCurrentTab("profile")} className={`px-5 py-2 text-sm font-bold rounded-full transition-all duration-200 ${currentTab === "profile" ? `${themeBg} ${themeText}` : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"}`}>Saját Profil</button>
              </nav>
            )}
          </div>
          <div className="flex items-center space-x-4 w-full sm:w-auto justify-between sm:justify-end">
            {!selectedClient && (
              <nav className="sm:hidden flex space-x-2 flex-1 mr-4">
                <button onClick={() => setCurrentTab("overview")} className={`flex-1 py-2 text-xs font-bold rounded-full transition-all ${currentTab === "overview" ? `${themeBg} ${themeText}` : "text-gray-500 hover:bg-gray-100"}`}>Áttekintés</button>
                <button onClick={() => setCurrentTab("profile")} className={`flex-1 py-2 text-xs font-bold rounded-full transition-all ${currentTab === "profile" ? `${themeBg} ${themeText}` : "text-gray-500 hover:bg-gray-100"}`}>Profil</button>
              </nav>
            )}
            <span className="text-sm text-gray-600 font-medium hidden md:inline">{loggedInUser} <span className="text-gray-400">({isCoach ? "Edző" : "Kliens"})</span></span>
            <button onClick={handleLogout} className="px-4 py-2 bg-red-50 text-red-600 text-sm font-bold rounded-lg hover:bg-red-100 transition whitespace-nowrap">Kijelentkezés</button>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-10">
          
          {/* ========================================== */}
          {/* EDZŐ: RÉSZLETES KLIENS ADATLAP               */}
          {/* ========================================== */}
          {isCoach && selectedClient && (
            <div className="animate-fade-in-up">
              
              <div className="flex items-center justify-between mb-6">
                <button 
                  onClick={() => setSelectedClient(null)} 
                  className="px-5 py-3 bg-white border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition flex items-center text-base shadow-sm"
                >
                  ← Vissza a kliensekhez
                </button>
                
                <button 
                  onClick={handleSendBoost}
                  className="px-6 py-3 bg-gradient-to-r from-orange-400 to-pink-500 text-white font-bold rounded-xl hover:shadow-lg transition flex items-center justify-center shadow-md text-base"
                >
                  <span className="text-xl mr-2">⚡</span> Boost küldése
                </button>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 mb-8 flex flex-col lg:flex-row gap-8 items-start">
                
                <div className="flex items-start gap-6 flex-1 w-full">
                  <div className="h-24 w-24 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-4xl font-extrabold shrink-0 shadow-inner">
                    {selectedClient.full_name.charAt(0).toUpperCase()}
                  </div>
                  
                  <div className="space-y-3 mt-2">
                    <h1 className="text-3xl font-extrabold text-gray-900 leading-none">{selectedClient.full_name}</h1>
                    <div className="flex flex-col gap-2 text-base text-gray-600 font-medium">
                      <span className="flex items-center">{selectedClient.email}</span>
                      <span className="flex items-center">Csatlakozott: 2026. Március</span>
                      <div className="flex gap-2">
                        <span className="inline-flex items-center text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wide mt-1">
                          Aktív Kliens
                        </span>
                        {/* ÚJ: Edző látja a kiosztott Boostokat */}
                        <span className="inline-flex items-center text-orange-700 bg-orange-50 border border-orange-200 px-3 py-1 rounded-full text-sm font-bold tracking-wide mt-1">
                          ⚡ Boosted {selectedClient.total_boosts || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 w-full lg:w-auto bg-gray-50 p-5 rounded-xl border border-gray-100">
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-sm font-bold text-gray-700 flex items-center">
                      <span className="mr-2"></span> Edzői Jegyzetek
                    </label>
                    <button onClick={handleSaveNotes} className="text-sm text-blue-600 font-bold hover:text-blue-800 transition bg-blue-50 hover:bg-blue-100 px-4 py-1.5 rounded-lg shadow-sm">
                      Mentés
                    </button>
                  </div>
                  <textarea 
                    value={coachNotes}
                    onChange={(e) => setCoachNotes(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-lg p-3 text-sm text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none resize-none h-24 transition"
                    placeholder="Írd ide a klienssel kapcsolatos fontos infókat (pl. sérülések, célok, betegségek)..."
                  ></textarea>
                </div>
              </div>

              {/* AI Asszisztens Jelentése */}
              <div className="bg-gradient-to-r from-indigo-900 to-purple-900 rounded-2xl p-8 mb-8 shadow-lg text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10 text-9xl">🤖</div>
                <h3 className="text-xl font-bold mb-2 flex items-center">
                  <span className="bg-purple-500 text-white text-xs px-2 py-1 rounded uppercase tracking-wide mr-3">AI Asszisztens Elemzése</span>
                </h3>
                {selectedClientLogs.length === 0 ? (
                  <p className="text-indigo-200">Még nincs elegendő adat az AI elemzés generálásához. A kliensnek legalább 1 naplót rögzítenie kell.</p>
                ) : (
                  <p className="text-indigo-100 text-lg leading-relaxed">
                    "A kliens stresszszintje az elmúlt napokban emelkedett trendet mutat, miközben az alvásminősége romlott (átlagosan 6 óra). Magas a kiégés és a sérülés kockázata. Javaslom a heti edzésintenzitás csökkentését 20%-kal, és több regenerációs blokk beiktatását."
                  </p>
                )}
                <div className="mt-4 flex gap-2">
                  <button className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-sm font-bold transition">Új elemzés generálása</button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Bal Oldal: Grafikon Oszlopokkal */}
                <div className="lg:col-span-2 space-y-8">
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex justify-between items-center">
                      <span> Statisztikák</span>
                      <span className="text-sm font-normal text-gray-500">Elmúlt napok</span>
                    </h3>
                    
                    {selectedClientLogs.length === 0 ? (
                      <div className="h-64 flex items-center justify-center bg-gray-50 rounded-xl text-gray-400">Nincs megjeleníthető adat a grafikonhoz.</div>
                    ) : (
                      <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <ComposedChart data={selectedClientLogs} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                            <XAxis dataKey="date" tick={{fontSize: 12, fill: '#6B7280'}} tickMargin={10} axisLine={false} tickLine={false} />
                            <YAxis yAxisId="left" domain={[0, 12]} tick={{fontSize: 12, fill: '#10B981'}} axisLine={false} tickLine={false} />
                            <YAxis yAxisId="right" orientation="right" domain={[0, 10]} tick={{fontSize: 12, fill: '#F97316'}} axisLine={false} tickLine={false} />
                            <YAxis yAxisId="bar" orientation="right" domain={[0, 180]} hide={true} />
                            <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}} />
                            <Legend wrapperStyle={{paddingTop: '20px'}} />
                            <Bar yAxisId="bar" name="Edzés (perc)" dataKey="workout_minutes" fill="#DBEAFE" radius={[4, 4, 0, 0]} barSize={40} />
                            <Line yAxisId="left" type="monotone" name="Alvás (óra)" dataKey="sleep_hours" stroke="#10B981" strokeWidth={3} dot={{r: 4, fill: '#10B981', strokeWidth: 2}} activeDot={{r: 6}} />
                            <Line yAxisId="right" type="monotone" name="Stressz (1-10)" dataKey="stress_level" stroke="#F97316" strokeWidth={3} dot={{r: 4, fill: '#F97316', strokeWidth: 2}} />
                          </ComposedChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>
                  
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-4"> Legutóbbi bejegyzések</h3>
                    <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                      {selectedClientLogs.slice().reverse().map(log => (
                        <div key={log.id} className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-sm">
                          <div className="flex justify-between font-bold text-gray-800 mb-1">
                            <span>{formatDateLabel(log.date)}</span>
                            <span>{log.mood.split(' ')[0]}</span>
                          </div>
                          <div className="text-gray-500">Alvás: {log.sleep_hours}h | Stressz: {log.stress_level} | Edzés: {log.workout_minutes} perc</div>
                          {log.notes && <div className="mt-2 text-gray-700 italic border-l-2 border-blue-400 pl-2">"{log.notes}"</div>}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Heti edzésterv</h3>
                    
                    <button onClick={() => setIsPlanModalOpen(true)} className="w-full bg-blue-100 text-blue-700 font-bold py-3 rounded-xl hover:bg-blue-200 transition shadow-sm mb-4">
                      Részletes Tervező
                    </button>
                    
                    <div className="space-y-2">
                      {daysOfWeek.map((day, idx) => (
                        <div key={day} className="p-3 bg-gray-50 rounded-lg border border-gray-100 flex justify-between items-start">
                          <div>
                            <span className="text-xs font-bold text-blue-600 uppercase block mb-1">
                              {day} <span className="text-gray-400 font-normal">({getDayDateLabel(currentRealMonday, idx)})</span>
                            </span>
                            <span className="text-sm font-medium text-gray-900 whitespace-pre-wrap">
                              {currentDashboardPlan[day] || "Nincs tervezett program."}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================== */}
          {/* 1. ÁTTEKINTÉS TAB (ALAP NÉZET)               */}
          {/* ========================================== */}
          {currentTab === "overview" && !selectedClient && (
            <div className="animate-fade-in-up">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
                <div>
                  <h1 className="text-3xl font-extrabold text-gray-900">Szia, {loggedInUser}! 👋</h1>
                  <p className="text-gray-500 mt-2">
                    {isCoach ? "Itt találod majd a klienseid adatait és az elemzéseket." : "Itt rögzítheted a napi adataidat a szakértőd számára."}
                  </p>
                </div>
                {isCoach && (
                  <button onClick={() => setIsModalOpen(true)} className="flex items-center px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-md w-full sm:w-auto justify-center">
                    <span className="text-xl mr-2">+</span> Új kliens meghívása
                  </button>
                )}
              </div>

              {isCoach ? (
                /* --- EDZŐI TARTALOM --- */
                clients.length === 0 ? (
                  <div className="bg-white rounded-2xl shadow-sm border border-dashed border-gray-300 p-16 text-center">
                    <div className="text-5xl mb-4 opacity-50">📂</div>
                    <h3 className="text-xl font-bold text-gray-700 mb-2">Még nincsenek klienseid</h3>
                    <p className="text-gray-500 max-w-md mx-auto">Küldj ki egy meghívó linket az első kliensednek, hogy elkezdhesse naplózni az adatait!</p>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <h3 className="text-lg font-bold text-gray-800 whitespace-nowrap">Saját klienseim ({clients.length})</h3>
                      {/* ÚJ: Kereső mező */}
                      <div className="w-full sm:w-82 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-400"></span>
                        </div>
                        <input 
                          type="text" 
                          placeholder="Keresés név vagy email alapján..." 
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-3 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white text-gray-900 font-sans font-medium tracking-wide transition-all"
                        />
                      </div>
                    </div>
                    
                    {/* Üres állapot, ha a keresés nem hoz találatot */}
                    {filteredClients.length === 0 ? (
                      <div className="p-8 text-center text-gray-500 text-sm font-medium">
                        Nincs találat a keresésre: &quot;{searchQuery}&quot;
                      </div>
                    ) : (
                      <ul className="divide-y divide-gray-200">
                        {filteredClients.map(client => (
                          <li key={client.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition cursor-pointer" onClick={() => handleViewClient(client)}>
                            <div className="flex items-center">
                              <div className="h-12 w-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xl mr-4 shrink-0">
                                {client.full_name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="text-md font-bold text-gray-900">{client.full_name}</p>
                                <p className="text-sm text-gray-500">{client.email}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              {client.total_boosts > 0 && (
                                <span className="hidden sm:inline-block text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded">⚡ {client.total_boosts} Boost</span>
                              )}
                              <button className="text-sm bg-white border border-gray-300 px-4 py-2 rounded-lg text-gray-700 font-bold hover:bg-gray-50 transition shadow-sm ml-4 shrink-0">
                                Megtekintés →
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )
              ) : (
                /* --- KLIENS TARTALOM --- */
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative transition-all duration-500">
                    <div className={`h-2 w-full ${hasLoggedToday ? "bg-gradient-to-r from-emerald-400 to-teal-500" : "bg-gradient-to-r from-orange-400 to-pink-500"}`}></div>
                    <div className="p-8 md:p-10 flex flex-col md:flex-row items-center justify-between text-center md:text-left">
                      <div className="mb-6 md:mb-0">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">{hasLoggedToday ? "Szuper, ma már naplóztál!" : "Ma még nem naplóztál! 📝"}</h3>
                        <p className="text-gray-600 max-w-md">{hasLoggedToday ? "Mára végeztél is! Az adataidat sikeresen továbbítottuk a szakértődnek. Pihenj, és térj vissza holnap!" : "Az edződ várja az adataidat. Szánj rá 1 percet, és rögzítsd az alvásodat, stressz-szintedet és a vízfogyasztásodat!"}</p>
                      </div>
                      {!hasLoggedToday && (
                        <button onClick={() => setIsLogModalOpen(true)} className="px-8 py-4 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition shadow-lg shrink-0 w-full md:w-auto">
                          Napi Napló Hozzáadása
                        </button>
                      )}
                    </div>
                  </div>

                  {/* KLIENS LÁTJA A JELENLEGI HETI TERVÉT DÁTUMOKKAL */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Aktuális heti edzésterved</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                      {daysOfWeek.map((day, idx) => (
                        <div key={day} className={`p-4 rounded-xl border ${clientWeeklyPlan[day] ? "border-blue-200 bg-blue-50" : "border-gray-100 bg-gray-50"}`}>
                          <span className={`text-xs font-bold uppercase block mb-1 ${clientWeeklyPlan[day] ? "text-blue-600" : "text-gray-400"}`}>
                            {day}
                          </span>
                          <span className="text-xs text-gray-400 block mb-2">{getDayDateLabel(currentRealMonday, idx)}</span>
                          <span className="text-sm text-gray-800 font-medium whitespace-pre-wrap">{clientWeeklyPlan[day] || "Pihenő"}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                      <h3 className="text-xl font-bold text-gray-800">Korábbi naplóid</h3>
                      {clientLogs.length > 0 && <span className="text-sm font-bold text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full">{clientLogs.length} Napló rögzítve 🔥</span>}
                    </div>
                    {clientLogs.length === 0 ? (
                      <div className="p-10 text-center text-gray-500"><div className="text-4xl mb-3 opacity-50">🏜️</div><p>Még nem rögzítettél adatot.</p></div>
                    ) : (
                      <ul className="divide-y divide-gray-100">
                        {clientLogs.map((log) => {
                          const isGood = log.mood.includes("Szuper") || log.mood.includes("Jó");
                          const isBad = log.mood.includes("Rossz");
                          const badgeColor = isGood ? "text-emerald-700 bg-emerald-50" : (isBad ? "text-red-700 bg-red-50" : "text-yellow-700 bg-yellow-50");
                          return (
                            <li key={log.id} className="p-6 sm:px-8 hover:bg-gray-50 transition flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 cursor-pointer">
                              <div>
                                <p className="font-bold text-gray-900 text-lg mb-1">{formatDateLabel(log.date)}</p>
                                <p className="text-gray-500 text-sm">Alvás: {log.sleep_hours} óra • Víz: {log.water_liters} L • Edzés: {log.workout_minutes} perc</p>
                              </div>
                              <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                                <span className={`px-4 py-2 rounded-lg text-sm font-bold ${badgeColor}`}>{log.mood}</span>
                                <span className="text-gray-400 font-bold hover:text-emerald-600 transition">Részletek →</span>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================== */}
          {/* 2. PROFIL TAB                                */}
          {/* ========================================== */}
          {currentTab === "profile" && !selectedClient && (
            <div className="animate-fade-in-up max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6">
                <div className={`h-32 bg-gradient-to-r ${themeGradient} w-full relative`}></div>
                <div className="px-8 pb-8 flex flex-col sm:flex-row items-center sm:items-start relative -mt-16">
                  <div className="h-32 w-32 bg-white rounded-full p-1 shadow-lg shrink-0 relative z-10">
                    <div className="h-full w-full bg-gray-100 rounded-full flex items-center justify-center text-5xl font-extrabold text-gray-400">{loggedInUser.charAt(0).toUpperCase()}</div>
                  </div>
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
                        <span className={`font-bold ${themeText} ${themeBg} px-2 py-1 rounded`}>{clientLogs.length} alkalom</span>
                      </div>
                      {/* ÚJ: Büszkeségfal a kliensnek (Összegyűjtött Boostok) javított sortöréssel */}
                      {!isCoach && (
                        <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                          <span className="text-gray-600 pr-2">Összegyűjtött Boostok</span>
                          <span className="font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded whitespace-nowrap">⚡ {totalBoosts} db</span>
                        </div>
                      )}
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
                        <p className={`font-medium p-3 rounded-lg border ${isCoach ? "text-purple-700 bg-purple-50 border-purple-100" : "text-emerald-700 bg-emerald-50 border-emerald-100"}`}>
                          {isCoach ? ` ${userSpecialization || "Edzői Fiók"}` : " Kliens Fiók"}
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

        {/* ========================================== */}
        {/* KLIENS: NAPI NAPLÓ MODAL                   */}
        {/* ========================================== */}
        {isLogModalOpen && !isCoach && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-lg relative animate-fade-in-up max-h-[90vh] overflow-y-auto">
              <button onClick={() => setIsLogModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold">×</button>
              
              <div className="text-center mb-6">
                <span className="text-4xl">📝</span>
                <h2 className="text-2xl font-extrabold text-gray-900 mt-2">Mai Napló</h2>
              </div>

              <div className="space-y-8">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="font-bold text-gray-700 flex items-center">😴 Alvás mennyisége</label>
                    <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">{sleepHours} óra</span>
                  </div>
                  <input type="range" min="0" max="12" step="1" value={sleepHours} onChange={(e) => setSleepHours(parseInt(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="font-bold text-gray-700 flex items-center">🤯 Napi Stresszszint</label>
                    <span className="font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded">{stressLevel} / 10</span>
                  </div>
                  <input type="range" min="1" max="10" step="1" value={stressLevel} onChange={(e) => setStressLevel(parseInt(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500" />
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-2">💧 Vízfogyasztás (Liter)</label>
                  <div className="flex items-center justify-between bg-gray-50 p-2 rounded-xl border border-gray-200">
                    <button type="button" onClick={() => setWaterLiters(Math.max(0, waterLiters - 0.25))} className="w-12 h-12 rounded-lg bg-white shadow text-gray-600 font-bold text-xl hover:bg-gray-100">-</button>
                    <span className="text-2xl font-extrabold text-blue-600">{waterLiters.toFixed(2)} L</span>
                    <button type="button" onClick={() => setWaterLiters(waterLiters + 0.25)} className="w-12 h-12 rounded-lg bg-white shadow text-gray-600 font-bold text-xl hover:bg-gray-100">+</button>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="font-bold text-gray-700 flex items-center">🏋️‍♂️ Edzés hossza ma</label>
                    <span className="font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">{workoutMinutes} perc</span>
                  </div>
                  <input 
                    type="range" min="0" max="150" step="15" 
                    value={workoutMinutes} onChange={(e) => setWorkoutMinutes(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-2">🎭 Általános Hangulat</label>
                  <div className="grid grid-cols-2 gap-2">
                    {moodOptions.map((opt) => (
                      <button key={opt.label} type="button" onClick={() => setMood(`${opt.icon} ${opt.label}`)} className={`p-3 rounded-xl border flex flex-col items-center justify-center transition ${mood.includes(opt.label) ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-200" : "border-gray-200 bg-white hover:bg-gray-50 text-gray-500"}`}>
                        <span className="text-2xl mb-1">{opt.icon}</span>
                        <span className={`text-sm font-bold ${mood.includes(opt.label) ? "text-emerald-700" : ""}`}>{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-2">📝 Megjegyzés a szakértőnek (Opcionális)</label>
                  <textarea 
                    rows="2" placeholder="Fájt a térdem a mai edzésen..."
                    value={logNotes} onChange={(e) => setLogNotes(e.target.value)}
                    className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-white text-gray-900 text-sm"
                  ></textarea>
                </div>

                <button onClick={handleSaveLog} className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl hover:bg-black transition shadow-lg">
                  Mentés és Beküldés
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --- EDZŐ: RÉSZLETES TERVEZŐ MODAL --- */}
        {isPlanModalOpen && isCoach && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-5xl relative animate-fade-in-up flex flex-col md:flex-row gap-8 max-h-[90vh] overflow-hidden">
              <button onClick={() => setIsPlanModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold z-10">×</button>
              
              <div className="flex-1 border-b md:border-b-0 md:border-r border-gray-200 pb-6 md:pb-0 md:pr-6 flex flex-col h-full">
                <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Idővonal</h2>
                <p className="text-sm text-gray-500 mb-6">Kattints arra a napra, amit szerkeszteni szeretnél!</p>
                
                <div className="flex items-center justify-between bg-blue-50 p-2 rounded-xl border border-blue-100 mb-6 shrink-0">
                  <button onClick={() => changeWeek(-7)} className="w-10 h-10 rounded-lg bg-white shadow-sm text-blue-700 font-bold hover:bg-blue-100 transition">←</button>
                  <span className="text-sm font-bold text-blue-800">{selectedWeek} hete</span>
                  <button onClick={() => changeWeek(7)} className="w-10 h-10 rounded-lg bg-white shadow-sm text-blue-700 font-bold hover:bg-blue-100 transition">→</button>
                </div>

                <div className="space-y-3 overflow-y-auto pr-2 flex-1 pb-4">
                  {daysOfWeek.map((day, idx) => {
                    const isActive = planDay === day;
                    return (
                      <div 
                        key={day} 
                        onClick={() => setPlanDay(day)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all ${
                          isActive 
                          ? "border-blue-500 bg-blue-50 shadow-md ring-2 ring-blue-200" 
                          : "border-gray-200 bg-white hover:bg-gray-50 hover:border-blue-300"
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className={`font-extrabold ${isActive ? "text-blue-700" : "text-gray-700"}`}>
                            {day} <span className="text-gray-400 font-normal text-xs ml-1">({getDayDateLabel(selectedWeek, idx)})</span>
                          </span>
                          {isActive && <span className="text-blue-600 text-xs font-bold bg-blue-100 px-2 py-1 rounded">Szerkesztés</span>}
                        </div>
                        <span className={`block text-sm line-clamp-2 ${modalWeeklyPlan[day] ? "text-gray-800" : "text-gray-400 italic"}`}>
                          {modalWeeklyPlan[day] || "Nincs program rögzítve"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex-1 flex flex-col h-full">
                <div className="mt-8 md:mt-0">
                  <h2 className="text-2xl font-extrabold text-blue-600 mb-2">{planDay}</h2>
                  <p className="text-sm text-gray-500 mb-6">Írd meg a részletes edzéstervet vagy fókuszpontokat.</p>
                </div>
                
                <div className="flex-1 flex flex-col mb-6 min-h-[300px]">
                  <textarea 
                    placeholder="Pl.: Felsőtest edzés + 20 perc séta..."
                    value={planText} onChange={(e) => setPlanText(e.target.value)}
                    className="flex-1 w-full border border-gray-300 p-5 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 focus:bg-white text-gray-900 text-sm resize-none transition"
                  ></textarea>
                </div>
                <button onClick={handleSaveDayPlan} className="w-full py-4 bg-blue-600 text-white font-extrabold rounded-xl hover:bg-blue-700 transition shadow-lg shrink-0 text-lg">
                  Mentés
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --- EDZŐ: MEGHÍVÓ MODAL --- */}
        {isModalOpen && isCoach && (
           <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
           <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md relative">
             <button onClick={() => { setIsModalOpen(false); setGeneratedLink(""); }} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold">×</button>
             <h2 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">Kliens Meghívása</h2>
             <div className="mb-6">
               <label className="block text-sm font-bold text-gray-700 mb-2">Küldés Emailben</label>
               <div className="flex">
                 <input type="email" placeholder="kliens@email.hu" className="flex-1 border border-gray-300 p-3 rounded-l-xl focus:outline-blue-500 bg-white text-black" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} />
                 <button onClick={() => handleGenerateInvite(true)} disabled={!clientEmail.includes("@")} className="bg-blue-600 text-white font-bold px-6 rounded-r-xl hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed">Küldés</button>
               </div>
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

        {/* ========================================== */}
        {/* ÚJ: KLIENS "MEGLEPETÉS" BOOST ÉRTESÍTŐ MODAL */}
        {/* ========================================== */}
        {hasUnseenBoost && !isCoach && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-sm relative animate-fade-in-up text-center border-t-8 border-orange-500">
              <div className="text-6xl mb-4">⚡</div>
              <h2 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">Szép munka!</h2>
              <p className="text-gray-600 mb-8 font-medium">Az edződ látta az adataidat, és küldött neked egy motivációs Boost-ot! Csak így tovább!</p>
              <button 
                onClick={handleAcknowledgeBoost} 
                className="w-full py-4 bg-gradient-to-r from-orange-400 to-pink-500 text-white font-extrabold rounded-xl hover:shadow-lg hover:-translate-y-1 transition-all text-lg"
              >
                Király!
              </button>
            </div>
          </div>
        )}

      </div>
    );
  }
}