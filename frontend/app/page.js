"use client";
import { useState, useEffect } from "react";
// ÚJ: ComposedChart és Bar importálása az oszlopdiagramhoz
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Home() {
  const [view, setView] = useState("landing"); 

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState(""); // ÚJ
  const [lastName, setLastName] = useState("");   // ÚJ
  const [specialization, setSpecialization] = useState("Személyi Edző");

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    height: "",
    currentWeight: "",
    goalWeight: "",
    primaryGoal: "",
    dietAllergies: ""
  });

  const [appAlert, setAppAlert] = useState({ isOpen: false, message: "", type: "info" });
  
  const triggerAlert = (message, type = "info") => {
    setAppAlert({ isOpen: true, message, type });
  };

  // Ezt a komponenst hívjuk meg a JSX végén, hogy megjelenjen a popup
  const renderAppAlert = () => {
    if (!appAlert.isOpen) return null;

    const isError = appAlert.type === "error";
    const isSuccess = appAlert.type === "success";
    
    // Ellenőrizzük, hogy edző vagy kliens van-e bejelentkezve
    const isCoach = userRole === "COACH" || view === "register"; // A regisztrációs űrlap is edzői

    // --- DINAMIKUS STÍLUSOK SZEREPKÖR ALAPJÁN ---
    // Ha hiba van, az mindig piros.
    // Ha NINCS hiba (tehát success vagy info), akkor nézzük a szerepkört.
    
    // 1. Az ikon háttere és színe
    let iconClass = "bg-red-50 text-red-600"; // Alapértelmezett hiba szín
    if (!isError) {
      iconClass = isCoach 
        ? "bg-gradient-to-br from-blue-100 to-purple-100 text-purple-600" 
        : "bg-emerald-50 text-emerald-600";
    }

    // 2. A felső szegély színe
    let borderClass = "border-red-500";
    if (!isError) {
      borderClass = isCoach ? "border-purple-500" : "border-emerald-500";
    }

    // 3. A gomb színe
    let buttonClass = "bg-red-600 hover:bg-red-700";
    if (!isError) {
      buttonClass = isCoach 
        ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90" 
        : "bg-emerald-600 hover:bg-emerald-700";
    }

    return (
      <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-md flex items-center justify-center z-[300] p-4 transition-opacity">
        <div className={`bg-white p-8 rounded-3xl shadow-2xl w-full max-w-sm relative transform transition-all flex flex-col items-center text-center animate-fade-in-up border-t-8 ${borderClass}`}>
          
          {/* Modern SVG ikonok */}
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 shadow-sm ${iconClass}`}>
            {isError ? (
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
            ) : isSuccess ? (
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
            ) : (
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            )}
          </div>

          <h2 className="text-xl font-extrabold text-gray-900 mb-2 tracking-tight">
            {isError ? "Hiba történt" : isSuccess ? "Sikeres!" : "Értesítés"}
          </h2>
          
          <p className="text-sm text-gray-600 mb-8 font-medium leading-relaxed whitespace-pre-wrap">
            {appAlert.message}
          </p>

          <button 
            onClick={() => setAppAlert({ ...appAlert, isOpen: false })} 
            className={`w-full py-3.5 text-white font-bold rounded-xl transition-all shadow-md text-sm ${buttonClass}`}
          >
            Rendben
          </button>
        </div>
      </div>
    );
  };
  
  const [loggedInFirstName, setLoggedInFirstName] = useState(""); 
  const [loggedInLastName, setLoggedInLastName] = useState(""); 
  const loggedInUser = `${loggedInLastName} ${loggedInFirstName}`;
  const [coachId, setCoachId] = useState(null); 
  const [userRole, setUserRole] = useState(""); 
  const [userId, setUserId] = useState(null); 
  const [userSpecialization, setUserSpecialization] = useState("");
  const [clientWeeklyPlan, setClientWeeklyPlan] = useState({}); 
  
  // Gamifikációs állapotok a Kliensnél
  const [totalBoosts, setTotalBoosts] = useState(0);
  const [hasUnseenBoost, setHasUnseenBoost] = useState(false);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [assignedCoachName, setAssignedCoachName] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clientEmail, setClientEmail] = useState("");
  const [generatedLink, setGeneratedLink] = useState("");

  const [clients, setClients] = useState([]);
  const [currentTab, setCurrentTab] = useState("overview");
  
  const [searchQuery, setSearchQuery] = useState("");

  const filteredClients = clients.filter(client => 
    `${client.last_name} ${client.first_name}`.toLowerCase().includes(searchQuery.toLowerCase()) || 
    client.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

// ==========================================
  // ÁLLAPOTOK: KLIENS NAPI NAPLÓZÁS & ADATOK
  // ==========================================
  const [selectedLog, setSelectedLog] = useState(null);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isCoachProfileModalOpen, setIsCoachProfileModalOpen] = useState(false);
  const [clientLogs, setClientLogs] = useState([]); 
  const [hasLoggedToday, setHasLoggedToday] = useState(false); 
  
  const [sleepHours, setSleepHours] = useState(7); 
  const [stressLevel, setStressLevel] = useState(5); 
  const [waterLiters, setWaterLiters] = useState(2.0); 
  
  // Új napló adatok
  const [didWorkout, setDidWorkout] = useState(true); // Volt-e edzés?
  const [workoutMinutes, setWorkoutMinutes] = useState(60); 
  const [workoutIntensity, setWorkoutIntensity] = useState(5); // 1-10 RPE
  const [steps, setSteps] = useState(""); // Lépésszám
  const [dailyWeight, setDailyWeight] = useState(""); // Napi testsúly
  
  const [mood, setMood] = useState("😊 Szuper"); 
  const [logNotes, setLogNotes] = useState("");

  // Kliens profil adatai (Egyelőre a napi mérésekből frissítjük)
  const [clientProfile, setClientProfile] = useState({ height: 175, weight: 72, goalWeight: 68 });

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

  const calculateStreak = (logs) => {
    if (!logs || logs.length === 0) return 0;
    
    // 1. Kinyerjük a dátumokat és csökkenő sorrendbe rakjuk őket
    const uniqueDates = [...new Set(logs.map(log => log.date))].sort((a, b) => new Date(b) - new Date(a));
    
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const firstLogDate = new Date(uniqueDates[0]);
    firstLogDate.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // 2. Ha az utolsó naplózás nem ma és nem is tegnap volt, a széria megszakadt
    if (firstLogDate.getTime() < yesterday.getTime()) return 0;

    // 3. Visszafelé számolunk a legutolsó bejegyzéstől, amíg nincs megszakítás
    let targetDate = firstLogDate;
    for (let dateStr of uniqueDates) {
      const d = new Date(dateStr);
      d.setHours(0, 0, 0, 0);
      if (d.getTime() === targetDate.getTime()) {
        streak++;
        targetDate.setDate(targetDate.getDate() - 1); // Ugrunk egy napot vissza
      } else {
        break; // Megszakadt a lánc
      }
    }
    return streak;
  };

  const currentRealMonday = getMonday(new Date()); 

  const [selectedWeek, setSelectedWeek] = useState(currentRealMonday); 
  const [clientAllPlans, setClientAllPlans] = useState([]); 
  
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isClientPlanModalOpen, setIsClientPlanModalOpen] = useState(false);
  const [planDay, setPlanDay] = useState("Hétfő");
  const [planText, setPlanText] = useState("");
  const [planStartTime, setPlanStartTime] = useState("");
  const [planEndTime, setPlanEndTime] = useState("");
  
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
          setCurrentStreak(calculateStreak(logs)); // ÚJ: Széria kiszámolása betöltéskor
        }
        // JAVÍTÁS: Lekérjük a kliens ÖSSZES edzéstervét is a lapozáshoz!
        const resPlans = await fetch(`http://localhost:8000/api/client/${userId}/plans`);
        if (resPlans.ok) {
          const plans = await resPlans.json();
          setClientAllPlans(plans);
        }
      } catch (error) {
        console.error("Hiba a naplók/tervek lekérésekor:", error);
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

  const handleUpdateProfile = async () => {
    try {
      const payload = {
        first_name: profileData.firstName,
        last_name: profileData.lastName,
        height: profileData.height ? parseInt(profileData.height) : null,
        current_weight: profileData.currentWeight ? parseFloat(profileData.currentWeight.toString().replace(',', '.')) : null,
        goal_weight: profileData.goalWeight ? parseFloat(profileData.goalWeight.toString().replace(',', '.')) : null,
        primary_goal: profileData.primaryGoal,
        diet_allergies: profileData.dietAllergies
      };

      const res = await fetch(`http://localhost:8000/api/user/${userId}/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        triggerAlert("Profil sikeresen frissítve!", "success");
        setIsEditingProfile(false);
        setLoggedInFirstName(profileData.firstName);
        setLoggedInLastName(profileData.lastName);
      } else {
        triggerAlert("Hiba a profil mentésekor.", "error");
      }
    } catch (error) {
      triggerAlert("Szerver hiba.", "error");
    }
  };

  const handleViewClient = async (client) => {
    setSelectedClient(client);
    setSelectedWeek(currentRealMonday); 
    setPlanDay("Hétfő");
    setPlanText("");
    setCoachNotes(client.coach_notes || "");

    window.scrollTo({ top: 0, behavior: 'smooth' });
    
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
      
      // Ha nem edzett, az adatok 0-k lesznek
      const finalMinutes = didWorkout ? workoutMinutes : 0;
      const finalIntensity = didWorkout ? workoutIntensity : 0;

      // Alap payload, az opcionális mezők nélkül
      const payload = {
        client_id: userId, 
        date: today, 
        sleep_hours: sleepHours, 
        stress_level: stressLevel,
        water_liters: waterLiters, 
        workout_minutes: finalMinutes, 
        workout_intensity: finalIntensity,
        mood: mood, 
        notes: logNotes || "" 
      };

      // Csak akkor adjuk hozzá a payloadhoz a lépést és a súlyt, ha a kliens tényleg beírt valamit
      if (steps) {
        payload.steps = parseInt(steps);
      }
      if (dailyWeight) {
        // A replace miatt akkor sem fagy ki, ha vesszővel (71,5) írja be a súlyát pont (71.5) helyett
        payload.weight = parseFloat(dailyWeight.replace(',', '.')); 
      }

      const res = await fetch("http://localhost:8000/api/client/log", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
      });

      if (res.ok) {
        setHasLoggedToday(true); 
        setIsLogModalOpen(false);
        const newLogs = [{...payload, id: Date.now()}, ...clientLogs];
        setClientLogs(newLogs); 
        setCurrentStreak(calculateStreak(newLogs));
        
        // Ha adott meg súlyt, frissítjük a profilját
        if (dailyWeight) { 
          setClientProfile(prev => ({ ...prev, weight: parseFloat(dailyWeight.replace(',', '.')) })); 
        }

        // Visszaállítjuk az alapértékeket a következő napra
        setSleepHours(7); setStressLevel(5); setWaterLiters(2.0); 
        setDidWorkout(true); setWorkoutMinutes(60); setWorkoutIntensity(5);
        setSteps(""); setDailyWeight(""); setMood("😊 Szuper"); setLogNotes("");
        
        triggerAlert("Napi napló sikeresen elmentve!", "success");
      } else {
        const err = await res.json();
        if (Array.isArray(err.detail)) {
            const errorMessages = err.detail.map(e => `${e.loc[e.loc.length-1]}: ${e.msg}`).join("\n");
            triggerAlert("Validációs hiba:\n" + errorMessages, "error");
        } else {
            triggerAlert(err.detail, "error");
        }
      }
    } catch (error) {
      triggerAlert("Szerver hiba mentés közben.", "error");
    }
  };

  const handleSaveDayPlan = async () => {
    // Ha van idősáv, szépen hozzáfűzzük a szöveg elejére
    let finalString = planText;
    if (planStartTime && planEndTime) {
      finalString = `🕒 ${planStartTime} - ${planEndTime}\n${finalString}`;
    }

    const activeObj = clientAllPlans.find(p => p.week_start === selectedWeek);
    const currentPlan = activeObj && activeObj.plan_data ? JSON.parse(activeObj.plan_data) : {};

    const updatedPlan = { ...currentPlan, [planDay]: finalString };
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
        triggerAlert(`${planDay} nap terve sikeresen elmentve!`, "success");
      }
    } catch (error) {
      triggerAlert("Szerver hiba a terv mentésekor.", "error");
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
        triggerAlert("Jegyzet sikeresen elmentve!", "success");
      }
    } catch (error) {
      triggerAlert("Hiba a mentés során.", "error");
    }
  };

  // ÚJ: Boost Küldése az Edzőtől
  const handleSendBoost = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/client/${selectedClient.id}/boost`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        triggerAlert(`Sikeresen küldtél egy motivációs Boost-ot ${selectedClient.last_name} ${selectedClient.first_name} számára!`, "success");
        // Frissítjük a lokális adatokat
        setSelectedClient({ ...selectedClient, total_boosts: data.total_boosts });
        setClients(clients.map(c => c.id === selectedClient.id ? { ...c, total_boosts: data.total_boosts } : c));
      }
    } catch (error) {
      triggerAlert("Hiba a boost küldésekor.", "error");
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
  };

  // JAVÍTÁS: Végtelen ciklus megszüntetése és időpontok betöltése
  useEffect(() => {
    if (isPlanModalOpen) {
      const activeObj = clientAllPlans.find(p => p.week_start === selectedWeek);
      const currentPlan = activeObj && activeObj.plan_data ? JSON.parse(activeObj.plan_data) : {};
      
      let rawText = currentPlan[planDay] || "";
      let sTime = ""; let eTime = "";

      // Ha találunk benne időpontot, kiszedjük a beviteli mezők számára
      const timeMatch = rawText.match(/🕒 (\d{2}:\d{2}) - (\d{2}:\d{2})\n/);
      if (timeMatch) {
        sTime = timeMatch[1];
        eTime = timeMatch[2];
        rawText = rawText.replace(timeMatch[0], "");
      }

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPlanStartTime(sTime);
      setPlanEndTime(eTime);
      
      setPlanText(prevText => {
        if (prevText !== rawText) return rawText;
        return prevText;
      });
    }
  }, [planDay, selectedWeek, isPlanModalOpen, clientAllPlans]);

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:8000/api/register", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, first_name: firstName, last_name: lastName, specialization }),
      });
      if (res.ok) {
        triggerAlert("Sikeres regisztráció! Kérjük, jelentkezz be.", "success");
        setView("login"); 
        setPassword(""); 
      } else {
        const err = await res.json();
        triggerAlert(err.detail, "error");
      }
    } catch (error) {
      triggerAlert("Szerver hiba.", "error");
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
        
        // Alapadatok beállítása
        setLoggedInFirstName(data.first_name); 
        setLoggedInLastName(data.last_name); 
        setUserRole(data.role); 
        setUserId(data.user_id); 
        setUserSpecialization(data.specialization); 
        setCoachId(data.role === "COACH" ? data.user_id : data.coach_id);

        setProfileData({
          firstName: data.first_name || "",
          lastName: data.last_name || "",
          height: data.height || "",
          currentWeight: data.current_weight || "",
          goalWeight: data.goal_weight || "",
          primaryGoal: data.primary_goal || "",
          dietAllergies: data.diet_allergies || ""
        });
        
        // Kliens specifikus adatok
        if (data.role === "CLIENT") {
           setClientWeeklyPlan(data.weekly_plan ? JSON.parse(data.weekly_plan) : {});
           setTotalBoosts(data.total_boosts || 0);
           setHasUnseenBoost(data.has_unseen_boost || false);
           setAssignedCoachName(data.coach_name || "Szakértőd"); 
        }

        // Átváltás a Dashboardra
        setCurrentTab("overview"); 
        setView("dashboard"); 
      } else {
        const err = await res.json();
        triggerAlert(err.detail, "error");
      }
    } catch (error) {
      console.error("Login hiba:", error);
      triggerAlert("Szerver hiba a bejelentkezés során.", "error");
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
        if (sendEmail) { 
          triggerAlert(`Email elküldve a következő címre: ${clientEmail}`, "success"); 
          setClientEmail(""); 
        }
      } else {
        triggerAlert("Hiba a generálás során.", "error");
      }
    } catch (error) {
      triggerAlert("Szerver hiba.", "error");
    }
  };

  const handleLogout = () => {
    // 1. Alapadatok törlése (itt volt a hiba, kivettük a setLoggedInUser-t)
    setCoachId(null); setUserRole(""); setUserId(null); setUserSpecialization("");
    
    // 2. Kliens adatok törlése
    setClients([]); setClientLogs([]); setHasLoggedToday(false); setSelectedClient(null); setSelectedClientLogs([]);
    setClientAllPlans([]); setClientWeeklyPlan({}); setCoachNotes("");
    setTotalBoosts(0); setHasUnseenBoost(false);
    
    // 3. Űrlap és nézet visszaállítása
    setEmail(""); setPassword(""); setView("landing");
    
    // 4. Név és profil adatok törlése
    setFirstName(""); setLastName(""); setLoggedInFirstName(""); setLoggedInLastName(""); setIsEditingProfile(false);
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
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Név</label>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-semibold text-gray-500 mb-1">Vezetéknév</label><input type="text" required className={inputStyle} value={lastName} onChange={(e) => setLastName(e.target.value)} /></div>
                <div><label className="block text-xs font-semibold text-gray-500 mb-1">Keresztnév</label><input type="text" required className={inputStyle} value={firstName} onChange={(e) => setFirstName(e.target.value)} /></div>
              </div>
            </div>
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
        {renderAppAlert()}
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
        {renderAppAlert()}
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
                    {selectedClient.last_name.charAt(0).toUpperCase()}
                  </div>
                  
                  <div className="space-y-3 mt-2">
                    <h1 className="text-3xl font-extrabold text-gray-900 leading-none">{selectedClient.last_name} {selectedClient.first_name}</h1>
                    <div className="flex flex-col gap-2 text-base text-gray-600 font-medium">
                      <span className="flex items-center">{selectedClient.email}</span>
                      <span className="flex items-center">Csatlakozott: 2026. Március</span>
                      <div className="flex gap-2">
                        <span className="inline-flex items-center text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wide mt-1">
                          Aktív Kliens
                        </span>
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
                    &quot;A kliens stresszszintje az elmúlt napokban emelkedett trendet mutat, miközben az alvásminősége romlott (átlagosan 6 óra). Magas a kiégés és a sérülés kockázata. Javaslom a heti edzésintenzitás csökkentését 20%-kal, és több regenerációs blokk beiktatását.&quot;
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
                          {log.notes && <div className="mt-2 text-gray-700 italic border-l-2 border-blue-400 pl-2">&quot;{log.notes}&quot;</div>}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Heti edzésterv</h3>
                    
                    <button onClick={() => setIsPlanModalOpen(true)} className="w-full bg-blue-100 text-blue-700 font-bold py-3 rounded-xl hover:bg-blue-200 transition shadow-sm mb-4">
                      Részletes tervező
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
                  <h1 className="text-3xl font-extrabold text-gray-900">Szia, {loggedInFirstName}!</h1>
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
                    <p className="text-gray-500 max-w-md mx-auto text-base">Küldj ki egy meghívó linket az első kliensednek, hogy elkezdhesse naplózni az adatait!</p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    
                    {/* ========================================== */}
                    {/* ÚJ: GYORS STATISZTIKA KÁRTYÁK (WIDGETS)      */}
                    {/* ========================================== */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in-up">
                      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200 flex flex-col justify-center relative overflow-hidden group hover:border-blue-300 transition-colors">
                        <div className="absolute -right-6 -top-6 text-8xl opacity-[0.03] group-hover:scale-110 transition-transform">📝</div>
                        <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Mai naplózások</h4>
                        <div className="flex items-end gap-2 mb-3">
                          <span className="text-5xl font-extrabold text-gray-900">7</span>
                          <span className="text-xl font-medium text-gray-400 mb-1">/ {clients.length || 12} kliens</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                        </div>
                      </div>

                      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200 flex flex-col justify-center relative overflow-hidden group hover:border-orange-300 transition-colors">
                        <div className="absolute -right-4 -top-2 text-7xl opacity-5 group-hover:scale-110 transition-transform">🔥</div>
                        <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Aktív Szériák (Rekorder)</h4>
                        <span className="text-3xl font-extrabold text-gray-900 truncate">Tóth Anna</span>
                        <span className="text-base font-bold text-orange-500 mt-2 flex items-center gap-1.5">
                          <span className="text-lg">⚡</span> 5 napja folyamatosan
                        </span>
                      </div>

                      <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 md:p-8 rounded-2xl shadow-sm text-white flex flex-col justify-center relative overflow-hidden">
                        <div className="absolute -right-2 -bottom-4 text-7xl opacity-10">📉</div>
                        <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Átlagos Stressz</h4>
                        <div className="flex items-end gap-2 mb-1">
                          <span className="text-5xl font-extrabold text-white">4.2</span>
                          <span className="text-xl text-slate-400 mb-1">/ 10</span>
                        </div>
                        <span className="text-base font-medium text-emerald-400 mt-2 flex items-center gap-1.5">
                          Ideális zónában van
                        </span>
                      </div>
                    </div>

                    {/* ========================================== */}
                    {/* ÚJ: FIGYELMET IGÉNYEL (OKOS RIASZTÁSOK)      */}
                    {/* ========================================== */}
                    <div className="bg-orange-50/50 border border-orange-200/60 rounded-3xl p-6 md:p-8 shadow-sm relative overflow-hidden animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                      <div className="absolute right-0 top-0 w-64 h-64 bg-orange-400 opacity-5 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none"></div>
                      <h3 className="text-lg font-extrabold text-orange-900 mb-6 flex items-center">
                        <span className="bg-orange-200 text-orange-800 text-xs px-3 py-1 rounded-lg border border-orange-300 uppercase tracking-wider mr-3 shadow-sm">AI Asszisztens</span>
                        Figyelmet igényel
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 relative z-10">
                        <div className="flex flex-col bg-white p-6 rounded-2xl shadow-sm border border-orange-100 hover:shadow-md transition-shadow">
                          <div className="flex items-start gap-4 mb-4">
                            <div className="text-3xl mt-0.5 drop-shadow-sm">⚠️</div>
                            <div>
                              <p className="font-bold text-gray-900 text-base">Nagy Péter 3 napja nem naplózott.</p>
                              <p className="text-sm text-gray-500 mt-2 leading-relaxed">Az edzéstervét sem nyitotta meg a héten. Érdemes lenne ráírni, hogy minden rendben van-e, elvesztette-e a motivációt.</p>
                            </div>
                          </div>
                          <button className="mt-auto w-full py-3 bg-orange-50 text-orange-700 text-sm font-bold rounded-xl hover:bg-orange-100 transition border border-orange-100">Kapcsolatfelvétel →</button>
                        </div>
                        
                        <div className="flex flex-col bg-white p-6 rounded-2xl shadow-sm border border-red-100 hover:shadow-md transition-shadow">
                          <div className="flex items-start gap-4 mb-4">
                            <div className="text-3xl mt-0.5 drop-shadow-sm">🚨</div>
                            <div>
                              <p className="font-bold text-gray-900 text-base">Kovács János stresszszintje kritikus (9/10).</p>
                              <p className="text-sm text-gray-500 mt-2 leading-relaxed">Az alvása mindössze 4 óra volt tegnap. A mai intenzív intervallumedzést fokozottan ajánlott lenne egy könnyed nyújtásra módosítani.</p>
                            </div>
                          </div>
                          <button className="mt-auto w-full py-3 bg-red-50 text-red-700 text-sm font-bold rounded-xl hover:bg-red-100 transition border border-red-100">Terv módosítása →</button>
                        </div>
                      </div>
                    </div>

                    {/* ========================================== */}
                    {/* EREDETI KLIENSLISTA (Keresővel)              */}
                    {/* ========================================== */}
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                      <div className="px-8 py-3 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <h3 className="text-xl font-bold text-gray-900 whitespace-nowrap">Saját klienseim ({clients.length})</h3>
                        {/* Kereső mező */}
                        <div className="w-full sm:w-80 relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <span className="text-gray-400 text-lg"></span>
                          </div>
                          <input 
                            type="text" 
                            placeholder="Keresés név vagy email alapján..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white text-gray-900 font-sans text-base font-medium tracking-wide transition-all shadow-sm"
                          />
                        </div>
                      </div>
                      
                      {filteredClients.length === 0 ? (
                        <div className="p-12 text-center text-gray-500 text-base font-medium bg-gray-50/30">
                          <span className="text-5xl block mb-4 opacity-30"></span>
                          Nincs találat a keresésre: &quot;{searchQuery}&quot;
                        </div>
                      ) : (
                        <ul className="divide-y divide-gray-100">
                          {filteredClients.map(client => (
                            <li key={client.id} className="p-6 sm:px-8 flex items-center justify-between hover:bg-blue-50/30 transition cursor-pointer group" onClick={() => handleViewClient(client)}>
                              <div className="flex items-center">
                                <div className="h-14 w-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center font-extrabold text-2xl mr-5 shrink-0 group-hover:scale-105 transition-transform shadow-sm">
                                  {client.last_name ? client.last_name.charAt(0).toUpperCase() : "K"}
                                </div>
                                <div>
                                  <p className="text-lg font-extrabold text-gray-900 mb-0.5">{client.last_name} {client.first_name}</p>
                                  <p className="text-sm text-gray-500 font-medium">{client.email}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                {client.total_boosts > 0 && (
                                  <span className="hidden sm:inline-flex items-center text-sm font-bold text-orange-600 bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-100">
                                    <span className="mr-1.5 text-base">⚡</span> {client.total_boosts} Boost
                                  </span>
                                )}
                                <button className="text-base bg-white border border-gray-200 px-5 py-2.5 rounded-xl text-gray-700 font-bold group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all shadow-sm ml-4 shrink-0">
                                  Megtekintés
                                </button>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
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
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-bold text-gray-800">Aktuális heti edzésterved</h3>
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider hidden sm:block">Kattints a napra a részletekért</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                      {daysOfWeek.map((day, idx) => {
                        const hasPlan = !!clientWeeklyPlan[day];
                        return (
                          <div 
                            key={day} 
                            onClick={() => {
                              setPlanDay(day);
                              setIsClientPlanModalOpen(true); 
                            }}
                            className={`p-4 rounded-xl border cursor-pointer hover:-translate-y-1 hover:shadow-md transition-all duration-200 ${hasPlan ? "border-blue-200 bg-blue-50/60" : "border-gray-100 bg-gray-50/50"}`}
                          >
                            <span className={`text-xs font-extrabold uppercase block mb-1 ${hasPlan ? "text-blue-600" : "text-gray-400"}`}>
                              {day}
                            </span>
                            <span className="text-xs text-gray-500 font-medium block mb-2">{getDayDateLabel(currentRealMonday, idx)}</span>
                            <div className="text-sm text-gray-800 font-medium whitespace-pre-wrap line-clamp-3">
                              {clientWeeklyPlan[day] || "Pihenő"}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                      <h3 className="text-xl font-bold text-gray-800">Korábbi naplózásaid</h3>
                      {clientLogs.length > 0 && <span className="text-sm font-bold text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full">{clientLogs.length} Napló rögzítve 🔥</span>}
                    </div>
                    {clientLogs.length === 0 ? (
                      <div className="p-10 text-center text-gray-500"><div className="text-4xl mb-3 opacity-50"></div><p>Még nem rögzítettél adatot.</p></div>
                    ) : (
                      <ul className="divide-y divide-gray-100">
                        {clientLogs.map((log) => {
                          const isGood = log.mood.includes("Szuper") || log.mood.includes("Jó");
                          const isBad = log.mood.includes("Rossz");
                          const badgeColor = isGood ? "text-emerald-700 bg-emerald-50" : (isBad ? "text-red-700 bg-red-50" : "text-yellow-700 bg-yellow-50");
                          return (
                            <li key={log.id} onClick={() => setSelectedLog(log)} className="p-6 sm:px-8 hover:bg-gray-50 transition flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 cursor-pointer">
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
            <div className="animate-fade-in-up max-w-6xl mx-auto">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6">
                <div className={`h-32 bg-gradient-to-r ${themeGradient} w-full relative`}></div>
                <div className="px-8 pb-8 flex flex-col sm:flex-row items-center sm:items-start relative -mt-16">
                  <div className="h-32 w-32 bg-white rounded-full p-1 shadow-lg shrink-0 relative z-10">
                    <div className="h-full w-full bg-gray-100 rounded-full flex items-center justify-center text-5xl font-extrabold text-gray-400">
                      {loggedInLastName ? loggedInLastName.charAt(0).toUpperCase() : "U"}
                    </div>
                  </div>
                  <div className="mt-4 sm:mt-20 sm:ml-6 text-center sm:text-left flex-1">
                    <h2 className="text-3xl font-extrabold text-gray-900">{loggedInUser}</h2>
                    <p className="text-gray-500 font-medium">{isCoach ? (userSpecialization || "Személyi Edző") : "Boosted Kliens"}</p>
                  </div>
                  
                  {/* --- Szerkesztés és Mentés/Mégse gombok --- */}
                  <div className="mt-6 sm:mt-20 sm:ml-auto">
                    {isEditingProfile ? (
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setIsEditingProfile(false)} 
                          className="px-6 py-2 bg-gray-200 text-gray-800 font-bold rounded-lg hover:bg-gray-300 transition text-sm"
                        >
                          Mégse
                        </button>
                        <button 
                          onClick={handleUpdateProfile} 
                          className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition text-sm shadow-md"
                        >
                          Mentés
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => setIsEditingProfile(true)} 
                        className="px-6 py-2 bg-gray-100 text-gray-800 font-bold rounded-lg hover:bg-gray-200 transition text-sm"
                      >
                        Profil Szerkesztése
                      </button>
                    )}
                  </div>

                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* --- STATISZTIKÁK DOBOZ JAVÍTVA EDZŐ ÉS KLIENS NÉZETRE --- */}
                <div className="md:col-span-1 space-y-6">
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Statisztikák</h3>
                    
                    {isCoach ? (
                      /* EDZŐI STATISZTIKÁK */
                      <div className="space-y-4">
                        <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                          <span className="text-gray-600">Csatlakozás</span>
                          <span className="font-bold text-gray-900">2026. Március</span>
                        </div>
                        <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                          <span className="text-gray-600">Aktív kliensek</span>
                          <span className={`font-bold ${themeText} ${themeBg} px-3 py-1 rounded-lg`}>{clients.length} fő</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 pr-2">Kiosztott Boostok</span>
                          <span className="font-bold text-orange-600 bg-orange-50 px-3 py-1 rounded-lg whitespace-nowrap shadow-sm">
                            {clients.reduce((sum, c) => sum + (c.total_boosts || 0), 0)} db
                          </span>
                        </div>
                      </div>
                    ) : (
                      /* KLIENS STATISZTIKÁK */
                      <div className="space-y-4">
                        <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                          <span className="text-gray-600">Regisztráció</span>
                          <span className="font-bold text-gray-900">2026. Március</span>
                        </div>
                        <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                          <span className="text-gray-600">Naplózások</span>
                          <span className={`font-bold ${themeText} ${themeBg} px-2 py-1 rounded`}>{clientLogs.length} alkalom</span>
                        </div>
                        <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                          <span className="text-gray-600 pr-2">Összegyűjtött Boostok</span>
                          <span className="font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded whitespace-nowrap">{totalBoosts} db</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Jelenlegi széria</span>
                          <span className="font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded flex items-center whitespace-nowrap shrink-0">{currentStreak} nap</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="md:col-span-2 space-y-6">
                  {/* --- FIÓK INFORMÁCIÓK DOBOZ --- */}
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 animate-fade-in-up">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Fiók Információk</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      
                      {/* 1. Név */}
                      <div className="col-span-1 sm:col-span-2 grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Vezetéknév</label>
                          {isEditingProfile ? (
                            <input type="text" className={inputStyle} value={profileData.lastName} onChange={(e) => setProfileData({...profileData, lastName: e.target.value})} />
                          ) : (
                            <p className="font-bold text-gray-900 bg-gray-50 p-4 rounded-xl border border-gray-100">{profileData.lastName}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Keresztnév</label>
                          {isEditingProfile ? (
                            <input type="text" className={inputStyle} value={profileData.firstName} onChange={(e) => setProfileData({...profileData, firstName: e.target.value})} />
                          ) : (
                            <p className="font-bold text-gray-900 bg-gray-50 p-4 rounded-xl border border-gray-100">{profileData.firstName}</p>
                          )}
                        </div>
                      </div>
                      
                      {/* 2. Szerepkör (Egy oszlop, beállított magassággal a szimmetriáért) */}
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Szerepkör</label>
                        <div className={`font-bold px-4 rounded-xl border flex items-center h-[56px] ${isCoach ? "text-purple-700 bg-purple-50 border-purple-100" : "text-emerald-700 bg-emerald-50 border-emerald-100"}`}>
                          {isCoach ? ` ${userSpecialization || "Edzői Fiók"}` : " Kliens Fiók"}
                        </div>
                      </div>

                      {/* 3. Kapcsolt Szakértő (Csak Kliensnek - A Szerepkör mellé kerül) */}
                      {!isCoach && (
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Kapcsolt Szakértő</label>
                          <div 
                            onClick={() => setIsCoachProfileModalOpen(true)}
                            className="flex items-center justify-between p-3.5 bg-white border border-gray-200 rounded-xl hover:bg-blue-50 hover:border-blue-200 transition-all cursor-pointer group shadow-sm h-[76px]"
                          >
                            <div className="flex items-center">
                              <div className="h-11 w-11 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white flex items-center justify-center font-extrabold text-xl mr-3 shadow-md group-hover:scale-105 transition-transform">
                                {assignedCoachName?.charAt(0) || "E"}
                              </div>
                              <div>
                                  <p className="font-extrabold text-gray-900 text-sm group-hover:text-blue-700 transition-colors line-clamp-1">
                                    {assignedCoachName || "Szakértőd"}
                                  </p>
                                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mt-0.5">Személyi Edző</p>
                                </div>
                            </div>
                            <div className="text-gray-300 group-hover:text-blue-600 transition-colors pr-2">
                              <span className="text-xl font-bold">→</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 4. Előfizetési csomag (Teljes szélesség alul) */}
                      <div className="col-span-1 sm:col-span-2">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Előfizetési Csomag</label>
                        <div className="flex items-center justify-between p-3.5 rounded-xl border border-yellow-500/20 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shadow-md relative overflow-hidden group cursor-pointer transition-transform hover:-translate-y-0.5 h-[76px]">
                           <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                           <div className="flex items-center gap-3 relative z-10">
                             <div>
                               <p className="font-extrabold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500 leading-tight">Boosted PRO</p>
                               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Aktív Prémium</p>
                             </div>
                           </div>
                           <div className="relative z-10 text-xs font-bold bg-white/10 px-3 py-1.5 rounded-lg text-yellow-300 border border-white/10 hover:bg-white/20 transition-colors">
                             Kezelés
                           </div>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* ========================================== */}
                  {/* ÚJ: KLIENS FIZIKAI ADATOK ÉS CÉLOK           */}
                  {/* ========================================== */}
                  {!isCoach && (
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-bold text-gray-900">Adatok</h3>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                      {/* Magasság */}
                      <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 flex flex-col items-center justify-center text-center">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Magasság</span>
                        {isEditingProfile ? (
                          <div className="flex items-center"><input type="number" className="w-16 text-center border p-1 rounded font-bold" value={profileData.height} onChange={(e) => setProfileData({...profileData, height: e.target.value})} /> <span className="ml-1 text-sm font-bold">cm</span></div>
                        ) : (
                          <span className="text-lg font-extrabold text-gray-900">{profileData.height || "-"} cm</span>
                        )}
                      </div>
                      {/* Jelenlegi Súly */}
                      <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 flex flex-col items-center justify-center text-center">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Jelenlegi Súly</span>
                        {isEditingProfile ? (
                          <div className="flex items-center"><input type="number" step="0.1" className="w-16 text-center border p-1 rounded font-bold" value={profileData.currentWeight} onChange={(e) => setProfileData({...profileData, currentWeight: e.target.value})} /> <span className="ml-1 text-sm font-bold">kg</span></div>
                        ) : (
                          <span className="text-lg font-extrabold text-gray-900">{profileData.currentWeight || "-"} kg</span>
                        )}
                      </div>
                      {/* Célsúly */}
                      <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 flex flex-col items-center justify-center text-center">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Célsúly</span>
                        {isEditingProfile ? (
                          <div className="flex items-center"><input type="number" step="0.1" className="w-16 text-center border p-1 rounded font-bold" value={profileData.goalWeight} onChange={(e) => setProfileData({...profileData, goalWeight: e.target.value})} /> <span className="ml-1 text-sm font-bold">kg</span></div>
                        ) : (
                          <span className="text-lg font-extrabold text-gray-900">{profileData.goalWeight || "-"} kg</span>
                        )}
                      </div>
                      {/* BMI Kalkuláció */}
                      <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 flex flex-col items-center justify-center text-center shadow-sm">
                        <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">BMI Index</span>
                        <span className="text-lg font-extrabold text-emerald-700">
                          {profileData.height && profileData.currentWeight ? (profileData.currentWeight / ((profileData.height/100) * (profileData.height/100))).toFixed(1) : "-"}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-[11px] font-bold text-gray-400 uppercase mb-2 tracking-wider">Elsődleges Cél</label>
                        {isEditingProfile ? (
                          <textarea rows="2" className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold text-gray-800 resize-none" value={profileData.primaryGoal} onChange={(e) => setProfileData({...profileData, primaryGoal: e.target.value})} />
                        ) : (
                          <p className="text-sm font-bold text-gray-800 bg-gray-50/50 p-3 rounded-xl border border-gray-100 min-h-[46px]">{profileData.primaryGoal || "Még nincs megadva."}</p>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[11px] font-bold text-gray-400 uppercase mb-2 tracking-wider">Étrend / Allergiák</label>
                          {isEditingProfile ? (
                            <input type="text" className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold text-gray-800" value={profileData.dietAllergies} onChange={(e) => setProfileData({...profileData, dietAllergies: e.target.value})} />
                          ) : (
                            <p className="text-sm font-medium text-gray-700 bg-gray-50/50 p-3 rounded-xl border border-gray-100 min-h-[46px]">{profileData.dietAllergies || "Nincs megadva."}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  )}

                  {/* ========================================== */}
                  {/* FINOMÍTOTT: EDZŐI BEMUTATKOZÁS ÉS SZAKMAI PROFIL */}
                  {/* ========================================== */}
                  {isCoach && (
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 animate-fade-in-up">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-gray-900">Bemutatkozás</h3>
                        <span className="text-[10px] bg-blue-50 text-blue-600 font-bold px-2 py-1 rounded border border-blue-100 uppercase tracking-wider">Hamarosan szerkeszthető</span>
                      </div>
                      
                      <div className="space-y-5">
                        <div>
                          <label className="block text-[11px] font-bold text-gray-400 uppercase mb-2 tracking-wider">Rólam / Mivel foglalkozom</label>
                          <p className="text-sm text-gray-700 bg-gray-50/50 p-4 rounded-xl border border-gray-100 leading-relaxed font-medium">
                            Célom, hogy segítsek a klienseimnek elérni a legjobb formájukat, nemcsak fizikailag, hanem mentálisan is. Fő profilom a funkcionális edzés és az életmódváltás támogatása. Hiszem, hogy a fenntartható eredményekhez a tudatos táplálkozás és a következetesség elengedhetetlen.
                          </p>
                        </div>
                        
                        <div>
                          <label className="block text-[11px] font-bold text-gray-400 uppercase mb-2 tracking-wider">Szakmai tapasztalat</label>
                          <p className="text-sm font-bold text-gray-800 bg-gray-50/50 p-3 rounded-xl border border-gray-100 inline-flex items-center">
                            <span className="mr-2">⏳</span> Több mint 5 éve a szakmában
                          </p>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-gray-400 uppercase mb-2 tracking-wider">Fő motivációm / Jeligém</label>
                          <div className="bg-gradient-to-r from-orange-50/50 to-pink-50/50 p-4 rounded-xl border border-orange-100 flex items-start shadow-sm">
                            <span className="text-xl mr-3 mt-0.5">🔥</span>
                            <p className="text-sm leading-relaxed font-semibold italic text-gray-800">
                              &quot;A legnagyobb siker számomra az, amikor egy kliensem rájön, hogy sokkal többre képes, mint amit valaha is el tudott képzelni magáról.&quot;
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

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
                <h2 className="text-2xl font-extrabold text-gray-900 mt-2">Mai Napló</h2>
              </div>

              <div className="space-y-8">
                {/* 1. KÖZEG (Biometria) */}
                <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 space-y-6">
                  <h3 className="text-sm font-extrabold text-gray-800 uppercase tracking-wide border-b border-gray-200 pb-2">Alapvető Biometria</h3>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="font-bold text-gray-700 flex items-center">Alvás mennyisége</label>
                      <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">{sleepHours} óra</span>
                    </div>
                    <input type="range" min="0" max="12" step="1" value={sleepHours} onChange={(e) => setSleepHours(parseInt(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="font-bold text-gray-700 flex items-center">Napi Stresszszint</label>
                      <span className="font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded">{stressLevel} / 10</span>
                    </div>
                    <input type="range" min="1" max="10" step="1" value={stressLevel} onChange={(e) => setStressLevel(parseInt(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500" />
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-2">Vízfogyasztás (Liter)</label>
                    <div className="flex items-center justify-between bg-white p-2 rounded-xl border border-gray-200 shadow-sm">
                      <button type="button" onClick={() => setWaterLiters(Math.max(0, waterLiters - 0.25))} className="w-10 h-10 rounded-lg bg-gray-100 text-gray-600 font-bold text-xl hover:bg-gray-200 transition">-</button>
                      <span className="text-2xl font-extrabold text-blue-600">{waterLiters.toFixed(2)} L</span>
                      <button type="button" onClick={() => setWaterLiters(waterLiters + 0.25)} className="w-10 h-10 rounded-lg bg-gray-100 text-gray-600 font-bold text-xl hover:bg-gray-200 transition">+</button>
                    </div>
                  </div>
                </div>

                {/* 2. KÖZEG (Aktivitás és Edzés) */}
                <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 space-y-6">
                  <h3 className="text-sm font-extrabold text-gray-800 uppercase tracking-wide border-b border-gray-200 pb-2">Aktivitás</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Lépésszám (Opcionális)</label>
                      <input type="number" placeholder="pl. 8500" value={steps} onChange={(e) => setSteps(e.target.value)} className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white text-gray-900 text-sm font-bold shadow-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Testsúly (Opcionális)</label>
                      <input type="number" step="0.1" placeholder="pl. 71.5 kg" value={dailyWeight} onChange={(e) => setDailyWeight(e.target.value)} className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-white text-gray-900 text-sm font-bold shadow-sm" />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-3">Volt ma edzésed?</label>
                    <div className="flex gap-4">
                      <button type="button" onClick={() => setDidWorkout(true)} className={`flex-1 py-3 rounded-xl font-bold transition ${didWorkout ? "bg-blue-600 text-white shadow-md" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}>Igen, edzettem</button>
                      <button type="button" onClick={() => setDidWorkout(false)} className={`flex-1 py-3 rounded-xl font-bold transition ${!didWorkout ? "bg-red-500 text-white shadow-md" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}>Nem, ma pihentem</button>
                    </div>
                  </div>

                  {/* Csak akkor jelenik meg, ha volt edzés */}
                  {didWorkout && (
                    <div className="animate-fade-in-up space-y-6 pt-4 border-t border-gray-200 border-dashed">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className="font-bold text-gray-700 flex items-center">Edzés hossza</label>
                          <span className="font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">{workoutMinutes} perc</span>
                        </div>
                        <input type="range" min="15" max="180" step="15" value={workoutMinutes} onChange={(e) => setWorkoutMinutes(parseInt(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className="font-bold text-gray-700 flex items-center">Edzés intenzitása</label>
                          <span className="font-bold text-red-600 bg-red-50 px-2 py-1 rounded">{workoutIntensity} / 10</span>
                        </div>
                        <input type="range" min="1" max="10" step="1" value={workoutIntensity} onChange={(e) => setWorkoutIntensity(parseInt(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-500" />
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. KÖZEG (Általános) */}
                <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 space-y-6">
                  <h3 className="text-sm font-extrabold text-gray-800 uppercase tracking-wide border-b border-gray-200 pb-2">Egyéb</h3>
                  <div>
                    <label className="font-bold text-gray-700 block mb-2">Hangulatod</label>
                    <div className="grid grid-cols-2 gap-2">
                      {moodOptions.map((opt) => (
                        <button key={opt.label} type="button" onClick={() => setMood(`${opt.icon} ${opt.label}`)} className={`p-3 rounded-xl border flex flex-col items-center justify-center transition ${mood.includes(opt.label) ? "border-emerald-500 bg-white ring-2 ring-emerald-200 shadow-sm" : "border-gray-200 bg-white hover:bg-gray-50 text-gray-500"}`}>
                          <span className="text-2xl mb-1">{opt.icon}</span>
                          <span className={`text-sm font-bold ${mood.includes(opt.label) ? "text-emerald-700" : ""}`}>{opt.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-2">Megjegyzés a szakértőnek (Opcionális)</label>
                    <textarea 
                      rows="2" placeholder="Fájt a térdem a mai edzésen..."
                      value={logNotes} onChange={(e) => setLogNotes(e.target.value)}
                      className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-white text-gray-900 text-sm shadow-sm resize-none"
                    ></textarea>
                  </div>
                </div>

                <button onClick={handleSaveLog} className="w-full bg-gray-900 text-white font-extrabold py-4 rounded-xl hover:bg-black transition shadow-xl text-lg">
                  Mentés
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

                {/* ÚJ: IDŐSÁV BEKÉRÉSE */}
                <div className="mb-4">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Idősáv (Mettől - Meddig)</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="time" 
                      value={planStartTime} 
                      onChange={e => setPlanStartTime(e.target.value)} 
                      className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold text-gray-700 bg-white" 
                    />
                    <span className="font-bold text-gray-400">-</span>
                    <input 
                      type="time" 
                      value={planEndTime} 
                      onChange={e => setPlanEndTime(e.target.value)} 
                      className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold text-gray-700 bg-white" 
                    />
                  </div>
                </div>
                
                <div className="flex-1 flex flex-col mb-6 min-h-[300px]">
                  <textarea 
                    placeholder="Pl.: Felsőtest edzés + 20 perc séta..."
                    value={planText} onChange={(e) => setPlanText(e.target.value)}
                    className="flex-1 w-full border border-gray-300 p-5 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 focus:bg-white text-gray-900 text-sm resize-none transition"
                  ></textarea>
                </div>
                <button onClick={handleSaveDayPlan} className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-md shrink-0 text-sm">
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
                   <input 
                     type="text" 
                     readOnly 
                     value={generatedLink} 
                     className="w-full bg-white border border-green-300 p-2 rounded text-sm text-black outline-none" 
                     onClick={(e) => { 
                       e.target.select(); 
                       navigator.clipboard.writeText(generatedLink); 
                       triggerAlert("Link másolva a vágólapra!", "success"); 
                     }} 
                   />
                 </div>
               )}
             </div>
           </div>
         </div>
        )}

        {/* ========================================== */}
        {/* ÚJ: KLIENS RÉSZLETES EDZÉSTERV OLVASÓ MODAL  */}
        {/* ========================================== */}
        {isClientPlanModalOpen && !isCoach && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-5xl relative animate-fade-in-up flex flex-col md:flex-row gap-8 max-h-[90vh] overflow-hidden">
              
              <button onClick={() => setIsClientPlanModalOpen(false)} className="absolute top-3 right-4 text-gray-400 hover:text-gray-700 text-3xl font-bold z-20 leading-none">×</button>
              
              <div className="flex-1 border-b md:border-b-0 md:border-r border-gray-200 pb-6 md:pb-0 md:pr-6 flex flex-col h-full">
                <h2 className="text-2xl font-extrabold text-gray-900 mb-2 mt-2 md:mt-0">Heti Edzésterv</h2>
                <p className="text-sm text-gray-500 mb-6">Nézd meg a feladataidat, vagy lapozz a hetek között!</p>
                
                <div className="flex items-center justify-between bg-blue-50 p-2 rounded-xl border border-blue-100 mb-6 shrink-0">
                  <button onClick={() => changeWeek(-7)} className="w-10 h-10 rounded-lg bg-white shadow-sm text-blue-700 font-bold hover:bg-blue-100 transition">←</button>
                  <span className="text-sm font-bold text-blue-800">{selectedWeek} hete</span>
                  <button onClick={() => changeWeek(7)} className="w-10 h-10 rounded-lg bg-white shadow-sm text-blue-700 font-bold hover:bg-blue-100 transition">→</button>
                </div>

                <div className="space-y-3 overflow-y-auto pr-2 flex-1 pb-4">
                  {daysOfWeek.map((day, idx) => {
                    const isActive = planDay === day;
                    const activeObj = clientAllPlans.find(p => p.week_start === selectedWeek);
                    const weekPlan = activeObj && activeObj.plan_data ? JSON.parse(activeObj.plan_data) : {};
                    const hasPlan = !!weekPlan[day];
                    
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
                          {isActive && <span className="text-blue-600 text-xs font-bold bg-blue-100 px-2 py-1 rounded">Kiválasztva</span>}
                        </div>
                        <span className={`block text-sm line-clamp-1 ${hasPlan ? "text-gray-800" : "text-gray-400 italic"}`}>
                          {weekPlan[day] || "Pihenőnap"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex-1 flex flex-col h-full bg-gray-50 rounded-2xl p-6 border border-gray-100 relative">
                <div className="mb-6">
                  <h2 className="text-2xl font-extrabold text-blue-600 mb-2">{planDay}</h2>
                  <p className="text-sm text-gray-500">Itt találod az edződ által írt részleteket.</p>
                </div>
                
                <div className="flex-1 overflow-y-auto pr-2 mb-4">
                  {(() => {
                    const activeObj = clientAllPlans.find(p => p.week_start === selectedWeek);
                    const weekPlan = activeObj && activeObj.plan_data ? JSON.parse(activeObj.plan_data) : {};
                    const currentDayText = weekPlan[planDay];

                    if (!currentDayText) {
                      return (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400">
                          <p className="font-bold text-lg">Erre a napra nincs program.</p>
                          <p className="text-sm mt-1">Pihenj és regenerálódj!</p>
                        </div>
                      );
                    }

                    return (
                      <p className="text-gray-800 text-base leading-relaxed whitespace-pre-wrap font-medium p-2">
                        {currentDayText}
                      </p>
                    );
                  })()}
                </div>
                
                <button onClick={() => setIsClientPlanModalOpen(false)} className="mt-auto w-full py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition shadow-md shrink-0 text-sm">
                  Bezárás
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* ÚJ: KLIENS NAPLÓ RÉSZLETEK MODAL (MODERN)    */}
        {/* ========================================== */}
        {selectedLog && !isCoach && (
          <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-md flex items-center justify-center z-[110] p-4">
            <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-2xl w-full max-w-md relative animate-fade-in-up border border-gray-100">
              <button onClick={() => setSelectedLog(null)} className="absolute top-5 right-6 text-gray-400 hover:text-gray-800 transition-colors text-3xl font-light leading-none">×</button>

              <div className="mb-8 pr-8">
                <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1.5">Napi Összefoglaló</p>
                <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">{formatDateLabel(selectedLog.date)}</h2>
                <div className="mt-3">
                  {(() => {
                    const moodText = selectedLog.mood.substring(selectedLog.mood.indexOf(' ') + 1);
                    const isGood = moodText.includes("Szuper") || moodText.includes("Jó");
                    const isBad = moodText.includes("Rossz");
                    const badgeClass = isGood ? "bg-emerald-50 text-emerald-700 border-emerald-200" : (isBad ? "bg-red-50 text-red-700 border-red-200" : "bg-yellow-50 text-yellow-700 border-yellow-200");
                    return <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${badgeClass}`}>{moodText} hangulat</span>;
                  })()}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-8">
                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 transition-all hover:shadow-sm">
                  <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Alvás</span>
                  <span className="text-2xl font-extrabold text-gray-900">{selectedLog.sleep_hours}<span className="text-xs font-medium text-gray-500 ml-1">óra</span></span>
                </div>
                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 transition-all hover:shadow-sm">
                  <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Stressz</span>
                  <span className="text-2xl font-extrabold text-gray-900">{selectedLog.stress_level}<span className="text-xs font-medium text-gray-500 ml-1">/ 10</span></span>
                </div>
                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 transition-all hover:shadow-sm">
                  <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Folyadék</span>
                  <span className="text-2xl font-extrabold text-gray-900">{selectedLog.water_liters}<span className="text-xs font-medium text-gray-500 ml-1">L</span></span>
                </div>
                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 transition-all hover:shadow-sm">
                  <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Edzésidő</span>
                  <span className="text-2xl font-extrabold text-gray-900">{selectedLog.workout_minutes}<span className="text-xs font-medium text-gray-500 ml-1">perc</span></span>
                </div>

                {selectedLog.workout_intensity > 0 && (
                  <div className="bg-red-50/50 p-5 rounded-2xl border border-red-100 col-span-2 sm:col-span-1">
                    <span className="block text-[10px] font-bold text-red-500 uppercase tracking-wider mb-1">Intenzitás</span>
                    <span className="text-2xl font-extrabold text-red-700">{selectedLog.workout_intensity}<span className="text-xs font-medium text-red-500 ml-1">/ 10</span></span>
                  </div>
                )}
                {selectedLog.steps && (
                  <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100 col-span-2 sm:col-span-1">
                    <span className="block text-[10px] font-bold text-blue-500 uppercase tracking-wider mb-1">Lépésszám</span>
                    <span className="text-2xl font-extrabold text-blue-700">{selectedLog.steps}</span>
                  </div>
                )}
                {selectedLog.weight && (
                  <div className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100 col-span-2">
                    <span className="block text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1">Testsúly a méréskor</span>
                    <span className="text-2xl font-extrabold text-emerald-700">{selectedLog.weight}<span className="text-xs font-medium text-emerald-600 ml-1">kg</span></span>
                  </div>
                )}
              </div>

              {selectedLog.notes && (
                <div className="mb-8">
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Megjegyzés az edzőnek</h4>
                  <div className="bg-gray-50 p-4 rounded-2xl border-l-4 border-blue-500 text-gray-700 text-sm leading-relaxed font-medium">
                    {selectedLog.notes}
                  </div>
                </div>
              )}

              <button onClick={() => setSelectedLog(null)} className="w-full py-3.5 bg-white border-2 border-gray-200 text-gray-900 font-bold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all text-sm">
                Bezárás
              </button>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* ÚJ: PUBLIKUS EDZŐI PROFIL MODAL (NAGYOBB & BŐVÍTETT) */}
        {/* ========================================== */}
        {isCoachProfileModalOpen && !isCoach && (
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center z-[120] p-4 sm:p-6">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl relative animate-fade-in-up overflow-hidden border border-gray-200 flex flex-col max-h-[95vh]">
              
              <button onClick={() => setIsCoachProfileModalOpen(false)} className="absolute top-4 right-4 md:top-6 md:right-8 text-gray-400 hover:text-gray-900 transition-colors text-3xl font-light leading-none z-20 bg-white/80 backdrop-blur-md rounded-full w-10 h-10 flex items-center justify-center hover:bg-gray-100 shadow-sm md:shadow-none md:bg-transparent">×</button>
              
              <div className="flex flex-col md:flex-row h-full overflow-y-auto md:overflow-hidden">
                
                <div className="bg-gray-50 md:w-1/3 p-10 lg:p-12 flex flex-col items-center text-center border-b md:border-b-0 md:border-r border-gray-200 relative shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-transparent pointer-events-none"></div>
                  
                  <div className="h-36 w-36 lg:h-40 lg:w-40 bg-white rounded-full p-2 shadow-xl relative z-10 mb-6">
                    <div className="h-full w-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-6xl font-extrabold text-white">
                      {assignedCoachName ? assignedCoachName.charAt(0).toUpperCase() : "E"}
                    </div>
                  </div>
                  
                  <div className="relative z-10 w-full">
                    <span className="inline-block bg-blue-100 text-blue-700 text-[10px] lg:text-xs font-extrabold px-3 py-1.5 rounded-lg border border-blue-200 uppercase tracking-widest shadow-sm mb-4">Hitelesített Szakértő</span>
                    <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight mb-2">{assignedCoachName || "Szakértőd"}</h2>
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Személyi Edző</p>
                    
                    <div className="mt-8 pt-8 border-t border-gray-200 w-full">
                      <button onClick={() => setIsCoachProfileModalOpen(false)} className="w-full py-3.5 bg-white border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition-all text-sm shadow-sm hidden md:block">
                        Vissza a profilomhoz
                      </button>
                    </div>
                  </div>
                </div>

                <div className="md:w-2/3 p-8 sm:p-10 lg:p-12 bg-white overflow-y-auto">
                  <div className="space-y-10 max-w-3xl mx-auto">
                    
                    <div>
                      <h3 className="text-sm font-extrabold text-gray-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                         Szakmai Bemutatkozás
                      </h3>
                      <p className="text-sm sm:text-base text-gray-600 leading-relaxed font-medium bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                        Célom, hogy segítsek a klienseimnek elérni a legjobb formájukat, nemcsak fizikailag, hanem mentálisan is. Fő profilom a funkcionális edzés és az életmódváltás támogatása. Az edzéseimen a precíz kivitelezésre és a fenntartható fejlődésre fókuszálunk, mert hiszem, hogy a minőség mindig megelőzi a mennyiséget.
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-blue-50/30 p-6 rounded-2xl border border-blue-100 flex flex-col items-center sm:items-start justify-center hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-2 mb-2">
                           <span className="text-[10px] lg:text-xs font-bold text-blue-600 uppercase tracking-wider">Tapasztalat</span>
                        </div>
                        <span className="text-3xl font-extrabold text-gray-900">5+ év</span>
                      </div>
                      
                      <div className="bg-emerald-50/30 p-6 rounded-2xl border border-emerald-100 flex flex-col items-center sm:items-start justify-center hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-2 mb-2">
                           <span className="text-[10px] lg:text-xs font-bold text-emerald-600 uppercase tracking-wider">Kliensek</span>
                        </div>
                        <span className="text-3xl font-extrabold text-gray-900">40+</span>
                      </div>

                      <div className="bg-orange-50/30 p-6 rounded-2xl border border-orange-100 flex flex-col items-center sm:items-start justify-center hover:shadow-md transition-shadow">
                         <div className="flex items-center gap-2 mb-2">
                           <span className="text-[10px] lg:text-xs font-bold text-orange-600 uppercase tracking-wider">Értékelés</span>
                        </div>
                        <span className="text-3xl font-extrabold text-gray-900">5.0 <span className="text-base font-medium text-gray-400">/ 5</span></span>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-extrabold text-gray-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                         Fő motivációm
                      </h3>
                      <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-2xl flex items-start shadow-xl relative overflow-hidden">
                        <div className="absolute right-0 top-0 text-9xl opacity-5 -mt-6 -mr-6 pointer-events-none transform rotate-12">🔥</div>
                        <p className="text-sm sm:text-base leading-relaxed font-medium italic text-gray-100 relative z-10 pr-4">
                          A legnagyobb siker számomra az, amikor egy kliensem rájön, hogy sokkal többre képes, mint amit valaha is el tudott képzelni magáról. A határaink csak ott vannak, ahová mi magunk húzzuk meg őket.
                        </p>
                      </div>
                    </div>
                    
                    <div className="pt-4 md:hidden">
                      <button onClick={() => setIsCoachProfileModalOpen(false)} className="w-full py-4 bg-gray-900 text-white font-extrabold rounded-xl hover:bg-black transition-all text-sm shadow-lg">
                        Bezárás
                      </button>
                    </div>
                  </div>
                </div>
                
              </div>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* ÚJ: KLIENS "MEGLEPETÉS" BOOST ÉRTESÍTŐ MODAL */}
        {/* ========================================== */}
        {hasUnseenBoost && !isCoach && (
          <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-md flex items-center justify-center z-[100] p-4 transition-opacity">
            <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-sm relative transform transition-all border border-gray-100 flex flex-col items-center text-center animate-fade-in-up">
              
              {/* Ikon lilás-kékes háttérrel, villám SVG-vel */}
              <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-md bg-gradient-to-br from-blue-100 to-purple-100 text-purple-600">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
              </div>

              <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-2 tracking-tight">
                Szép munka!
              </h2>
              
              <p className="text-sm text-gray-600 mb-8 font-medium leading-relaxed">
                Az edződ látta az adataidat, és küldött neked egy motivációs Boost-ot! Csak így tovább!
              </p>

              <button 
                onClick={handleAcknowledgeBoost} 
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:opacity-90 transition-all shadow-md text-sm"
              >
                Király!
              </button>
            </div>
          </div>
        )}

        {renderAppAlert()}

      </div>
    );
  }
}  