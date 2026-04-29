"use client";
import { useState, useEffect } from "react";
// ÚJ: ComposedChart és Bar importálása az oszlopdiagramhoz
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { jsPDF } from "jspdf";

export default function Home() {
  const [view, setView] = useState("landing"); 

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState(""); // ÚJ
  const [lastName, setLastName] = useState("");   // ÚJ
  const [specialization, setSpecialization] = useState("Személyi Edző");

  const [isClientAiView, setIsClientAiView] = useState(false);

// ÚJ: AI Jelentés generáló állapotok (Chat helyett)
  const [aiReport, setAiReport] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [activeReportType, setActiveReportType] = useState("");
  const [aiDashboardData, setAiDashboardData] = useState(null);
  const [clientAiData, setClientAiData] = useState(null);
  const [isClientAiLoading, setIsClientAiLoading] = useState(false);


  const [dashboardStats, setDashboardStats] = useState(null);

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isProfilePicModalOpen, setIsProfilePicModalOpen] = useState(false);
  const [tempPicUrl, setTempPicUrl] = useState("");
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    height: "",
    currentWeight: "",
    goalWeight: "",
    primaryGoal: "",
    dietAllergies: "",
    city: "",
    bio: "",
    experienceYears: "",
    motivationQuote: "",
    joinDate: "",
    profilePictureUrl: "",
    averageRating: 0,
    reviewCount: 0
  });

  const [boostedClientsToday, setBoostedClientsToday] = useState({});

  // ==========================================
  // ÚJ: TÖLTŐKÉPERNYŐ (LOADING) STATE-EK
  // ==========================================
  const [isPageLoading, setIsPageLoading] = useState(false); // Dashboard adatok letöltéséhez
  const [isActionLoading, setIsActionLoading] = useState(false); // Gombnyomásokhoz (mentés, login stb.)

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

  const [assignedCoachData, setAssignedCoachData] = useState(null);

  const [isDisconnectModalOpen, setIsDisconnectModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");

  
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

  // --- ÚJ ÁLLAPOT A HÉTVÁLASZTÓHOZ ---
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // --- PDF EXPORTÁLÓ FÜGGVÉNY ---
  const handleExportPdf = (weekStartDate) => {
    // 1. Segédfüggvény az ékezetek eltávolítására (jsPDF és fájlnév kompatibilitás)
    const removeAccents = (str) => {
      if (!str) return "";
      const map = {
        'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ö': 'o', 'ő': 'o', 'ú': 'u', 'ü': 'u', 'ű': 'u',
        'Á': 'A', 'É': 'E', 'Í': 'I', 'Ó': 'O', 'Ö': 'O', 'Ő': 'O', 'Ú': 'U', 'Ü': 'U', 'Ű': 'U'
      };
      return str.replace(/[áéíóöőúüűÁÉÍÓÖŐÚÜŰ]/g, match => map[match]);
    };

    // 2. Adatok előkészítése
    const selectedPlanObj = clientAllPlans.find(p => p.week_start === weekStartDate);
    const weekPlan = selectedPlanObj && selectedPlanObj.plan_data ? JSON.parse(selectedPlanObj.plan_data) : {};
    
    // Dátum formázása: 2026-04-13 -> 2026.04.13
    const formattedDate = weekStartDate.replaceAll('-', '.');

    const doc = new jsPDF();
    const displayDays = ["Hétfő", "Kedd", "Szerda", "Csütörtök", "Péntek", "Szombat", "Vasárnap"];
    
    // Stílus beállítások a PDF tartalomban
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(63, 63, 191); 
    doc.text("BOOSTED PRO - EDZESTERV", 20, 20); // Ékezet kiveve

    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.setFont("helvetica", "normal");
    
    const safeClientFullName = removeAccents(`${selectedClient.last_name} ${selectedClient.first_name}`);
    const safeCoachName = removeAccents(`${loggedInLastName} ${loggedInFirstName}`);
    
    doc.text(`Kliens: ${safeClientFullName}`, 20, 30);
    doc.text(`Idoszak (Het kezdete): ${formattedDate}`, 20, 37); // Ékezet kiveve
    doc.text(`Edzo: ${safeCoachName}`, 20, 44); // Ékezet kiveve
    
    doc.setLineWidth(0.5);
    doc.line(20, 50, 190, 50);

    let yPos = 60;
    
    displayDays.forEach((originalDay) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(0);
      doc.text(removeAccents(originalDay).toUpperCase(), 20, yPos);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(60);
      
      const rawText = weekPlan[originalDay] || "Pihenőnap / Nincs program rögzítve.";
      const safeText = removeAccents(rawText);
      
      const splitText = doc.splitTextToSize(safeText, 160);
      doc.text(splitText, 25, yPos + 7);
      
      yPos += (splitText.length * 5) + 15;

      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
    });

    // 3. Fájl mentése az új névformátummal: Vezeteknev_Keresztnev_Datum.pdf
    const fileName = `${removeAccents(selectedClient.last_name)}_${removeAccents(selectedClient.first_name)}_${formattedDate}.pdf`;
    
    doc.save(fileName);
    setIsExportModalOpen(false);
    triggerAlert("PDF sikeresen legenerálva!", "success");
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
    const loadDashboardData = async () => {
      if (view !== "dashboard" || !userId) return;
      
      setIsPageLoading(true);

      try {
        if (userRole === "COACH" && coachId) {
          const res = await fetch(`http://localhost:8000/api/coach/${coachId}/clients`);
          if (res.ok) {
            const data = await res.json();
            setClients(data);
          }
          const statsRes = await fetch(`http://localhost:8000/api/coach/${coachId}/dashboard-stats`);
          if (statsRes.ok) {
            const statsData = await statsRes.json();
            setDashboardStats(statsData);
          }
        } else if (userRole === "CLIENT") {
          const resLogs = await fetch(`http://localhost:8000/api/client/${userId}/logs`);
          if (resLogs.ok) {
            const logs = await resLogs.json();
            setClientLogs(logs);
            const today = new Date().toISOString().split("T")[0];
            setHasLoggedToday(logs.some(log => log.date === today));
            setCurrentStreak(calculateStreak(logs)); 
          }
          
          const resPlans = await fetch(`http://localhost:8000/api/client/${userId}/plans`);
          if (resPlans.ok) {
            const plans = await resPlans.json();
            setClientAllPlans(plans);
          }
        }
      } catch (error) {
        console.error("Hiba az adatok lekérésekor:", error);
        triggerAlert("Hiba történt az adatok betöltésekor.", "error");
      } finally {
        setIsPageLoading(false);
      }
    };

    loadDashboardData();
  }, [view, userRole, coachId, userId]);

  // ==========================================
  // ÚJ: AI DASHBOARD AUTOMATIKUS LEKÉRÉSE (BIZTONSÁGOS)
  // ==========================================
  useEffect(() => {
    // JAVÍTÁS: Ez CSAK akkor futhat le, ha NEM a részletes elemző nézetben vagyunk
    if (currentTab === "ai" && !selectedClient && !isClientAiView && !aiDashboardData && !isAiLoading) {
      const fetchAiDashboard = async () => {
        setIsAiLoading(true);
        let contextData = "";
        
        if (userRole === "COACH") {
          contextData = `Edző vagyok. Klienseim száma: ${clients.length}. Mai naplózások: ${dashboardStats?.today_logs_count || 0}. Csapat átlag stressz: ${dashboardStats?.average_stress || 0}/10.`;
        } else {
          const recentLogsText = clientLogs && clientLogs.length > 0 
            ? clientLogs.slice(0, 3).map(l => `[Alvás: ${l.sleep_hours}h, Stressz: ${l.stress_level}/10, Víz: ${l.water_liters}L]`).join(", ")
            : "Nincsenek friss naplók.";

          contextData = `Kliens vagyok. Célom: ${profileData?.primaryGoal || "ismeretlen"}. Súlyom: ${profileData?.currentWeight || "?"}kg. Szériám: ${currentStreak || 0} nap. Az utolsó 3 naplózásom: ${recentLogsText}.`;
        }

        try {
          const res = await fetch("http://localhost:8000/api/generate-ai-dashboard", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              user_type: userRole, 
              context_data: contextData 
            })
          });
          
          if (res.ok) {
            const data = await res.json();
            setAiDashboardData(data);
          } else {
            setAiDashboardData({ summary_title: "Hiba történt", summary_text: "Nem sikerült elérni az AI szervert." });
            triggerAlert("Hiba a lekérés során", "error");
          }
        } catch (error) {
          console.error("AI hiba:", error);
          setAiDashboardData({ summary_title: "Hálózati Hiba", summary_text: "Ellenőrizd, hogy fut-e a backend." });
        } finally {
          setIsAiLoading(false);
        }
      };
      
      fetchAiDashboard();
    }
  }, [currentTab, selectedClient, isClientAiView, aiDashboardData, isAiLoading, userRole, clients.length, dashboardStats, profileData, currentStreak, clientLogs]);

  const getValidImageUrl = (url) => {
    if (!url) return "";
    if (url.includes("imgur.com") && !url.includes("i.imgur.com") && !url.match(/\.(jpeg|jpg|gif|png)$/i)) {
      return url.replace("imgur.com", "i.imgur.com") + ".png";
    }
    return url;
  };

const handleUpdateProfile = async () => {
    setIsActionLoading(true);
    try {
      const payload = {
        first_name: profileData.firstName,
        last_name: profileData.lastName,
        height: profileData.height ? parseInt(profileData.height) : null,
        current_weight: profileData.currentWeight ? parseFloat(profileData.currentWeight.toString().replace(',', '.')) : null,
        goal_weight: profileData.goalWeight ? parseFloat(profileData.goalWeight.toString().replace(',', '.')) : null,
        primary_goal: profileData.primaryGoal,
        diet_allergies: profileData.dietAllergies,
        city: profileData.city,
        bio: profileData.bio,
        experience_years: profileData.experienceYears,
        motivation_quote: profileData.motivationQuote,
        profile_picture_url: profileData.profilePictureUrl
      };

      // --- ÚJ: KIVESSZÜK A TOKENT A LOCALSTORAGE-BŐL ---
      const token = localStorage.getItem("boosted_token");

      const res = await fetch(`http://localhost:8000/api/user/${userId}/profile`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          // --- ÚJ: FELMUTATJUK AZ ŐRNEK A TOKENT ---
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        triggerAlert("Profil sikeresen frissítve!", "success");
        setIsEditingProfile(false);
        setLoggedInFirstName(profileData.firstName);
        setLoggedInLastName(profileData.lastName);
      } else {
        // Opcionális: Ha nagyon pro akarsz lenni, a 401/403-as hibákat is le lehet külön kezelni
        if (res.status === 401 || res.status === 403) {
            triggerAlert("Nincs jogosultságod a profil szerkesztésére. Kérlek jelentkezz be újra!", "error");
        } else {
            triggerAlert("Hiba a profil mentésekor.", "error");
        }
      }
    } catch (error) {
      triggerAlert("Szerver hiba.", "error");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleViewClient = async (client) => {
    setSelectedClient(client);
    setIsClientAiView(false);
    setClientAiData(null);
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
    setIsActionLoading(true);
    try {
      const today = new Date().toISOString().split("T")[0]; 
      
      const finalMinutes = didWorkout ? workoutMinutes : 0;
      const finalIntensity = didWorkout ? workoutIntensity : 0;

      const payload = {
        client_id: userId, date: today, sleep_hours: sleepHours, stress_level: stressLevel,
        water_liters: waterLiters, workout_minutes: finalMinutes, workout_intensity: finalIntensity,
        mood: mood, notes: logNotes || "" 
      };

      if (steps) payload.steps = parseInt(steps);
      if (dailyWeight) payload.weight = parseFloat(dailyWeight.replace(',', '.')); 

      const res = await fetch("http://localhost:8000/api/client/log", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
      });

      if (res.ok) {
        setHasLoggedToday(true); setIsLogModalOpen(false);
        const newLogs = [{...payload, id: Date.now()}, ...clientLogs];
        setClientLogs(newLogs); setCurrentStreak(calculateStreak(newLogs));
        if (dailyWeight) { setClientProfile(prev => ({ ...prev, weight: parseFloat(dailyWeight.replace(',', '.')) })); }
        
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
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleSaveDayPlan = async () => {
    setIsActionLoading(true);
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
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ week_start_date: selectedWeek, plan_data: planDataStr }),
      });
      if (res.ok) {
        triggerAlert(`${planDay} nap terve sikeresen elmentve!`, "success");
      }
    } catch (error) {
      triggerAlert("Szerver hiba a terv mentésekor.", "error");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleSaveNotes = async () => {
    setIsActionLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/api/client/${selectedClient.id}/notes`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coach_notes: coachNotes }),
      });
      if (res.ok) {
        setClients(clients.map(c => c.id === selectedClient.id ? { ...c, coach_notes: coachNotes } : c));
        triggerAlert("Jegyzet sikeresen elmentve!", "success");
      }
    } catch (error) {
      triggerAlert("Hiba a mentés során.", "error");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDisconnectConfirm = async () => {
    setIsActionLoading(true);
    try {
      // JAVÍTÁS: Itt helyben ellenőrizzük a szerepkört!
      const checkIsCoach = userRole === "COACH"; 
      
      const targetClientId = checkIsCoach ? selectedClient.id : userId;
      const targetCoachId = checkIsCoach ? coachId : (assignedCoachData?.id || coachId);

      const res = await fetch("http://localhost:8000/api/disconnect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client_id: targetClientId, coach_id: targetCoachId })
      });

      if (res.ok) {
        setIsDisconnectModalOpen(false);
        if (checkIsCoach) {
          triggerAlert("Kapcsolat megszakítva a klienssel.", "success");
          setClients(clients.filter(c => c.id !== selectedClient.id));
          setSelectedClient(null);
        } else {
          // Ha a kliens bontott kapcsolatot, nyissuk meg az értékelő ablakot!
          setIsReviewModalOpen(true);
        }
      } else {
        triggerAlert("Hiba a kapcsolat megszakításakor.", "error");
      }
    } catch (err) {
      console.error(err); // Ha legközelebb hiba van, lássuk a böngésző konzoljában!
      triggerAlert("Rendszer hiba a megszakításkor.", "error");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleReviewSubmit = async () => {
    setIsActionLoading(true);
    try {
      const targetCoachId = assignedCoachData?.id || coachId;
      const res = await fetch(`http://localhost:8000/api/coach/${targetCoachId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client_id: userId, rating: reviewRating, review_text: reviewText })
      });
      
      if (res.ok) {
        triggerAlert("Köszönjük az értékelést!", "success");
        setIsReviewModalOpen(false);
        // Kiléptetjük a klienst, mert már nincs edzője
        handleLogout();
      } else {
        triggerAlert("Hiba történt az értékelés mentésekor.", "error");
      }
    } catch (err) {
      triggerAlert("Szerver hiba.", "error");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleSendBoost = async () => {
    // Limit ellenőrzése
    if (boostedClientsToday[selectedClient.id]) {
      triggerAlert("Ennek a kliensnek ma már küldtél Boost-ot! Gyere vissza holnap.", "info");
      return;
    }

    setIsActionLoading(true);
    try {
      // VALÓDI FETCH HÍVÁS A BACKENDRE
      const res = await fetch(`http://localhost:8000/api/client/${selectedClient.id}/boost`, {
        method: "POST",
      });

      if (res.ok) {
        const data = await res.json(); // A backend visszaküldi az új total_boosts értéket
        
        triggerAlert(`Sikeresen küldtél egy motivációs Boost-ot ${selectedClient.last_name} ${selectedClient.first_name} számára!`, "success");
        
        // 1. Megjegyezzük a frontendnek, hogy ma már kapott (ne lehessen spammelni)
        setBoostedClientsToday(prev => ({ ...prev, [selectedClient.id]: true }));
        
        // 2. Frissítjük a kiválasztott klienst, hogy az adatlapján is jó szám jelenjen meg
        setSelectedClient({ ...selectedClient, total_boosts: data.total_boosts });
        
        // 3. JAVÍTÁS: Frissítjük a teljes klienslistát is! 
        // Így az Edzői "Statisztikák" dobozban a "Kiosztott Boostok" azonnal növekedni fog!
        setClients(clients.map(c => c.id === selectedClient.id ? { ...c, total_boosts: data.total_boosts } : c));
        
      } else {
        triggerAlert("Hiba a boost küldésekor.", "error");
      }
    } catch (error) {
      triggerAlert("Szerver hiba a boost küldésekor.", "error");
    } finally {
      setIsActionLoading(false);
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

  useEffect(() => {
    if (userRole === "COACH" && selectedClient && isClientAiView && !clientAiData && !isClientAiLoading) {
      const fetchClientAi = async () => {
        setIsClientAiLoading(true);
        
        const logText = selectedClientLogs.slice(0, 7).map(l => `[${l.date}: Alvás ${l.sleep_hours}h, Stressz ${l.stress_level}/10, Víz ${l.water_liters}L, Edzés ${l.workout_minutes}p]`).join(", ");
        const contextData = `Kliens: ${selectedClient.last_name} ${selectedClient.first_name}. Cél: ${selectedClient.primary_goal || "Nem megadott"}. Étrend és allergiák: ${selectedClient.diet_allergies || "Nincs megadva"}. Jelenlegi súly: ${selectedClient.current_weight || "?"}kg, Célsúly: ${selectedClient.goal_weight || "?"}kg. Edzői jegyzetek róla: ${coachNotes || "Nincs jegyzet"}. Utolsó heti naplói: ${logText || "Nincs rögzített naplója"}`;

        try {
          const res = await fetch("http://localhost:8000/api/generate-client-analysis", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ context_data: contextData })
          });
          
          if (res.ok) {
            const data = await res.json();
            setClientAiData(data);
          } else {
            setClientAiData({
              summary_text: "Az AI szerver jelenleg túlterhelt (Rate Limit) vagy nem elérhető.",
              risk_status: "Hiba", risk_desc: "Kérlek, próbáld újra pár perc múlva.", risk_action: "-",
              goal_status: "Hiba", goal_metric: "-", goal_desc: "Nincs adat.", goal_action: "-",
              pattern1_icon: "⚠️", pattern1_title: "Hálózati hiba", pattern1_desc: "A kapcsolat megszakadt.",
              pattern2_icon: "⏳", pattern2_title: "Túl sok lekérés", pattern2_desc: "Várj egy kicsit."
            });
            triggerAlert("Az AI API elérte a limitet.", "error");
          }
        } catch (error) {
          console.error("AI Kliens Hiba:", error);
          setClientAiData({
            summary_text: "Nem sikerült kapcsolódni a szerverhez.",
            risk_status: "Hiba", risk_desc: "Nincs kapcsolat.", risk_action: "-",
            goal_status: "Hiba", goal_metric: "-", goal_desc: "Nincs kapcsolat.", goal_action: "-",
            pattern1_icon: "🚫", pattern1_title: "Szerverhiba", pattern1_desc: "A backend nem válaszol.",
            pattern2_icon: "🔌", pattern2_title: "Offline", pattern2_desc: "Ellenőrizd a szervert."
          });
        } finally {
          setIsClientAiLoading(false);
        }
      };
      
      fetchClientAi();
    }
  }, [userRole, selectedClient, isClientAiView, clientAiData, isClientAiLoading, selectedClientLogs, coachNotes]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsActionLoading(true);
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
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsActionLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/login", {
        method: "POST", headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const data = await res.json();

        if (data.access_token) {
          localStorage.setItem("boosted_token", data.access_token);
        }

        setLoggedInFirstName(data.first_name); 
        setLoggedInLastName(data.last_name); 
        setUserRole(data.role); 
        setUserId(data.user_id); 
        setUserSpecialization(data.specialization); 
        setCoachId(data.role === "COACH" ? data.user_id : data.coach_id);

        setProfileData({
          firstName: data.first_name || "", lastName: data.last_name || "",
          height: data.height || "", currentWeight: data.current_weight || "",
          goalWeight: data.goal_weight || "", primaryGoal: data.primary_goal || "",
          dietAllergies: data.diet_allergies || "",
          city: data.city || "",
          bio: data.bio || "",
          experienceYears: data.experience_years || "",
          motivationQuote: data.motivation_quote || "",
          joinDate: data.join_date || "Ismeretlen",
          profilePictureUrl: data.profile_picture_url || "",
          averageRating: data.average_rating || 0,
          reviewCount: data.review_count || 0
        });
        
        if (data.role === "CLIENT") {
          setAssignedCoachName(data.coach_name || "Szakértőd");
           setClientWeeklyPlan(data.weekly_plan ? JSON.parse(data.weekly_plan) : {});
           setTotalBoosts(data.total_boosts || 0);
           setHasUnseenBoost(data.has_unseen_boost || false);
           setAssignedCoachName(data.coach_name || "Szakértőd");
           setAssignedCoachData(data.coach_data || null);
        }

        setCurrentTab("overview"); 
        setView("dashboard"); 
      } else {
        const err = await res.json();
        triggerAlert(err.detail, "error");
      }
    } catch (error) {
      console.error("Login hiba:", error);
      triggerAlert("Szerver hiba a bejelentkezés során.", "error");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleGenerateInvite = async (sendEmail = false) => {
    setIsActionLoading(true);
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
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("boosted_token");
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
  
    setAiDashboardData(null); 
    setIsAiLoading(false);
  };


  // ÚJ: AI Jelentés Lekérése gombnyomásra
  const handleGenerateReport = async (reportTitle, promptInstruction) => {
    setIsAiLoading(true);
    setActiveReportType(reportTitle);

    // 1. Összegyűjtjük az aktuális valós adatokat a kontextushoz
    let contextData = "";
    if (userRole === "COACH") {
       contextData = `Kliensek száma: ${clients.length}. Mai naplózások: ${dashboardStats?.today_logs_count || 0}. Csapat átlag stressz: ${dashboardStats?.average_stress || 0}/10. Riasztások száma: ${dashboardStats?.alerts?.length || 0}.`;
    } else {
       contextData = `Saját adataim - Magasság: ${profileData.height || "ismeretlen"}cm, Súly: ${profileData.currentWeight || "ismeretlen"}kg, Cél: ${profileData.primaryGoal || "általános fittség"}. Allergiák/Étrend: ${profileData.dietAllergies || "nincs"}. Aktuális szériám: ${currentStreak} nap.`;
    }

    // 2. Összerakjuk a végső, rejtett promptot az AI-nak
    const finalPrompt = `Itt vannak a rendszer aktuális adatai: [${contextData}]. \n\nKérés: ${promptInstruction}. \nA választ szépen formázva, HTML vagy Markdown nélkül, jól olvasható bekezdésekkel és felsorolásokkal add vissza. Ne írj bevezetőt, rögtön a lényeggel kezdd.`;

    try {
      const res = await fetch("http://localhost:8000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: finalPrompt }],
          user_type: userRole
        })
      });

      if (res.ok) {
        const data = await res.json();
        setAiReport(data.reply);
      } else {
        triggerAlert("Hiba a jelentés generálásakor.", "error");
      }
    } catch (error) {
      triggerAlert("Nem sikerült kapcsolódni az AI szerverhez.", "error");
    } finally {
      setIsAiLoading(false);
    }
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
      // FRISSÍTVE: 'relative' osztály hozzáadva a háttér elemek miatt
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans overflow-x-hidden relative">
        
        {/* ================================================== */}
        {/* ÚJ: FIX HÁTTÉR GRADIENS FOLTOK (A MENŐ HÁTTÉR) */}
        {/* ================================================== */}
        <div className="fixed top-0 left-0 w-[500px] h-[500px] bg-purple-200/30 rounded-full blur-[120px] pointer-events-none z-0"></div>
        <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-emerald-100/30 rounded-full blur-[120px] pointer-events-none z-0"></div>
        
        <header className="w-full p-6 flex justify-between items-center bg-white shadow-sm border-b border-slate-100 z-50 sticky top-0 transition-colors duration-500">
          {/* ÚJ: LOGO ÉS SZÖVEG EGYÜTT */}
          <div className="flex items-center gap-3">
            <button onClick={() => setView("landing")} className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 tracking-tight hover:opacity-80 transition-opacity text-left">
              Boosted
            </button>
          </div>
          <button onClick={() => setView("login")} className="px-6 py-2 bg-slate-100 text-slate-800 font-bold rounded-lg hover:bg-slate-200 transition text-sm">
            Bejelentkezés
          </button>
        </header>

        {/* FRISSÍTVE: justify-center helyettitems-center, és relative z-10 */}
        <main className="flex-1 flex flex-col justify-center items-center pt-8 pb-12 md:pt-12 md:pb-16 relative z-10">
          
          {/* ================================================== */}
          {/* ÚJ: ÓRIÁSI VILLÁM VÍZJEL A HÁTTÉRBEN */}
          {/* ================================================== */}
          <div className="absolute inset-0 flex items-center justify-center z-0 opacity-[0.03] pointer-events-none overflow-hidden">
            <svg className="w-[800px] h-[800px] text-purple-900" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
          </div>
          
          <section className="max-w-6xl mx-auto px-6 flex flex-col items-center text-center w-full relative z-10">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-slate-950 mb-5 tracking-tighter leading-[1.1]">
              Emeld új szintre a <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                közös munkát
              </span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 mb-10 md:mb-12 max-w-2xl leading-relaxed font-medium">
              A Boosted egy adatközpontú platform, amely összeköti a szakértőket és klienseiket. Kövesd az alvást, a stresszt és az edzéseket egyetlen, modern felületen.
            </p>
          </section>

          <section className="max-w-6xl mx-auto px-6 w-full relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 hover:[&>div]:z-20">
              
              {/* 1. KÁRTYA: EDZŐKNEK/SZAKÉRTŐKNEK */}
              <div className="group bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-100 transition-all duration-300 relative overflow-hidden min-h-[380px] h-full z-10">
                <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-purple-100 rounded-full blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                
                <div className="relative z-10 flex flex-col h-full">
                  <div className="w-14 h-14 rounded-2xl bg-purple-100 border border-purple-200 flex items-center justify-center mb-6 shrink-0 shadow-sm transition-transform group-hover:scale-110">
                    <svg className="w-7 h-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                  </div>

                  <span className="text-purple-600 text-xs font-bold uppercase tracking-widest mb-2">Edzői Megoldás</span>
                  <h3 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-4 leading-tight tracking-tight">
                    Skálázd a Praxist
                  </h3>
                  <p className="text-slate-600 text-base md:text-lg leading-relaxed mb-8 flex-1 font-medium">
                    Kezelj korlátlan számú klienst, lásd át az állapotukat egyetlen Dashboardon, és optimalizáld a folyamataidat.
                  </p>

                  <button onClick={() => setView("register")} className="w-full mt-auto px-6 py-3.5 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition shadow-lg shadow-purple-200 text-center text-sm md:text-base active:scale-95">
                    Regisztráció Szakértőként
                  </button>
                </div>
              </div>

              {/* 2. KÁRTYA: KLIENSEKNEK */}
              <div className="group bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col hover:-translate-y-2 hover:shadow-2xl hover:shadow-emerald-100 transition-all duration-300 relative overflow-hidden min-h-[380px] h-full z-10">
                <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-emerald-100 rounded-full blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                <div className="relative z-10 flex flex-col h-full">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center mb-6 shrink-0 shadow-sm transition-transform group-hover:scale-110">
                    <svg className="w-7 h-7 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                    </svg>
                  </div>

                  <span className="text-emerald-600 text-xs font-bold uppercase tracking-widest mb-2">Kliens Platform</span>
                  <h3 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-4 leading-tight tracking-tight">
                    Érd el a Céljaid
                  </h3>
                  <p className="text-slate-600 text-base md:text-lg leading-relaxed mb-8 flex-1 font-medium">
                    Naplózd egyszerűen a biometrikus adataidat, kövesd az edzéstervedet, és kapj visszajelzést a szakértődtől.
                  </p>

                  <div className="w-full mt-auto p-4 bg-emerald-50 text-emerald-900 rounded-xl text-sm border border-emerald-100 font-semibold flex items-start gap-3 shadow-inner group-hover:border-emerald-200 transition-colors">
                    <svg className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                    </svg>
                    <span className="text-xs md:text-sm leading-snug">
                      <strong className="block mb-0.5 text-emerald-950">Meghívó szükséges</strong>
                      Csatlakozni kizárólag egyedi meghívóval tudsz az edződtől.
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </section>
        </main>
      </div>
    );
  }

  if (view === "login" || view === "register") {
    const isLogin = view === "login";

    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 relative overflow-hidden font-sans">
        
        {/* Háttér fény effektek */}
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-purple-200/50 rounded-full blur-[120px] pointer-events-none z-0"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-indigo-100/50 rounded-full blur-[100px] pointer-events-none z-0"></div>

        {/* Vissza a főoldalra gomb */}
        <button onClick={() => setView("landing")} className="absolute top-6 left-6 md:top-10 md:left-10 flex items-center gap-2 text-slate-500 hover:text-purple-600 transition-colors font-bold z-20 text-sm">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
          Vissza a főoldalra
        </button>

        {/* Fő Auth Kártya */}
        <div className="bg-white/90 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl shadow-slate-200 w-full max-w-5xl border border-slate-100 relative z-10 flex flex-col md:flex-row overflow-hidden animate-fade-in-up mt-12 md:mt-0">
          
          {/* BAL PANEL: Branding & Inkluzív szövegek */}
          <div className="md:w-5/12 bg-gradient-to-br from-purple-600 via-indigo-600 to-indigo-800 p-10 md:p-12 flex flex-col justify-between relative overflow-hidden text-white shrink-0">
            <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMSI+PC9yZWN0Pgo8cGF0aCBkPSJNMCAwTDggOFpNOCAwTDAgOFoiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLW9wYWNpdHk9IjAuMSI+PC9wYXRoPgo8L3N2Zz4=')]"></div>
            
            <div className="relative z-10">
              {/* ÚJ: TIPOGRÁFIAI LOGÓ A VILLÁM HELYETT */}
              <div className="mb-10">
                <span className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/80 tracking-tight">
                  Boosted
                </span>
                <div className="h-1 w-8 bg-white/40 rounded-full mt-1"></div>
              </div>

              <h2 className="text-3xl md:text-4xl font-extrabold mb-5 tracking-tight leading-tight">
                {isLogin ? "Üdv újra a rendszerben!" : "Kezdd el a praxisod skálázását."}
              </h2>
              <p className="text-purple-100/90 font-medium leading-relaxed text-sm md:text-base">
                {isLogin 
                  ? "Lépj be a fiókodba a közös munka folytatásához. Legyél akár szakértő, akár kliens, az adataid és a fejlődésed egyetlen helyen várnak." 
                  : "Csatlakozz a leginnovatívabb edzői platformhoz. Adatvezérelt döntések, automatizált elemzések és korlátlan növekedés."}
              </p>
            </div>

            {/* Rendszer Státusz */}
            <div className="relative z-10 mt-12 md:mt-0">
              <div className="bg-black/20 backdrop-blur-md rounded-2xl p-5 border border-white/10">
                <div className="flex items-center gap-3 mb-2">
                  <span className="flex h-3 w-3 relative shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </span>
                  <span className="text-xs font-bold uppercase tracking-widest text-emerald-300">Online</span>
                </div>
              </div>
            </div>
          </div>

          {/* JOBB PANEL: Űrlapok */}
          <div className="md:w-7/12 p-8 md:p-14 bg-white flex flex-col justify-center">
            
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight hidden sm:block">
                {isLogin ? "Bejelentkezés" : "Szakértői Fiók"}
              </h3>
              
              <div className="bg-slate-100/80 p-1.5 rounded-xl flex text-sm font-bold w-full sm:w-auto">
                <button onClick={() => setView("login")} className={`flex-1 sm:flex-none px-5 py-2.5 rounded-lg transition-all ${isLogin ? "bg-white text-purple-600 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}>
                  Belépés
                </button>
                <button onClick={() => setView("register")} className={`flex-1 sm:flex-none px-5 py-2.5 rounded-lg transition-all ${!isLogin ? "bg-white text-purple-600 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}>
                  Új Fiók
                </button>
              </div>
            </div>

            {isLogin ? (
              <form onSubmit={handleLogin} className="space-y-6 animate-fade-in-up">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Email cím</label>
                  <input type="email" required className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none text-slate-900 font-medium transition-all" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="pelda@email.hu" />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Jelszó</label>
                    <span className="text-[10px] font-bold text-purple-600 cursor-pointer hover:underline transition-all">Elfelejtetted?</span>
                  </div>
                  <input type="password" required className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none text-slate-900 font-medium transition-all" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
                </div>
                
                <button type="submit" disabled={isActionLoading} className={`w-full mt-2 bg-slate-900 text-white font-extrabold py-4 rounded-xl transition-all shadow-lg ${isActionLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-purple-600 hover:shadow-purple-200 active:scale-95'}`}>
                  {isActionLoading ? "Hitelesítés..." : "Bejelentkezés"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-5 animate-fade-in-up">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Vezetéknév</label>
                    <input type="text" required className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none text-slate-900 font-medium transition-all" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Keresztnév</label>
                    <input type="text" required className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none text-slate-900 font-medium transition-all" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                  </div>
                </div>
                
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Szakma / Terület</label>
                  <select className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none text-slate-900 font-medium transition-all cursor-pointer appearance-none" value={specialization} onChange={(e) => setSpecialization(e.target.value)}>
                    <option value="Személyi Edző">Személyi Edző</option>
                    <option value="Fizioterapeuta / Gyógytornász">Fizioterapeuta / Gyógytornász</option>
                    <option value="Dietetikus / Táplálkozási Tanácsadó">Dietetikus / Táplálkozási Tanácsadó</option>
                    <option value="Sportpszichológus">Sportpszichológus</option>
                    <option value="Életmód Tanácsadó (Health Coach)">Életmód Tanácsadó (Health Coach)</option>
                    <option value="Egyéb Szakértő">Egyéb</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Email cím</label>
                  <input type="email" required className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none text-slate-900 font-medium transition-all" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Jelszó</label>
                  <input type="password" required className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none text-slate-900 font-medium transition-all" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                
                <button type="submit" disabled={isActionLoading} className={`w-full mt-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-extrabold py-4 rounded-xl transition-all shadow-lg ${isActionLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02] hover:shadow-purple-200 active:scale-95'}`}>
                  {isActionLoading ? "Mentés folyamatban..." : "Fiók Létrehozása"}
                </button>
              </form>
            )}
          </div>
        </div>
        
        {renderAppAlert()}
      </div>
    );
  }

  if (view === "premium") {
    return (
      <div className="min-h-screen bg-gray-900 font-sans text-white overflow-hidden relative">
        {/* Háttér effektek */}
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-600/30 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[100px] pointer-events-none"></div>

        <header className="p-6 flex justify-between items-center relative z-10 max-w-6xl mx-auto">
          <div className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 tracking-tight cursor-pointer" onClick={() => setView("dashboard")}>
            Boosted <span className="text-white">PRO</span>
          </div>
          <button onClick={() => setView("dashboard")} className="text-gray-400 hover:text-white font-bold text-sm transition">← Vissza a Dashboardra</button>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-12 md:py-20 relative z-10 flex flex-col items-center text-center">
          <span className="px-4 py-1.5 rounded-full bg-purple-500/20 text-purple-300 font-bold text-xs uppercase tracking-widest border border-purple-500/30 mb-6">Fejleszd a potenciálod</span>
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight">
            Emeld a munkát <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-500 to-orange-500">Prémium szintre</span>
          </h1>
          <p className="text-xl text-gray-400 mb-12 max-w-2xl leading-relaxed">
            Oldd fel az okos AI asszisztenst, a korlátlan visszamenőleges elemzéseket és a prémium gamifikációs funkciókat.
          </p>

          <div className="bg-white/5 border border-white/10 backdrop-blur-xl p-8 md:p-12 rounded-3xl shadow-2xl w-full max-w-2xl relative overflow-hidden">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 border-b border-white/10 pb-8 gap-6 text-left">
              <div>
                <h3 className="text-3xl font-extrabold text-white mb-2">Boosted PRO</h3>
                <p className="text-gray-400 text-sm">Minden, ami a profi elemzéshez kell.</p>
              </div>
              <div className="text-right">
                <span className="text-4xl font-extrabold text-white">1.490 Ft</span>
                <span className="text-gray-500 block text-sm mt-1">/ hónap</span>
              </div>
            </div>

            <ul className="space-y-4 text-left mb-10">
              <li className="flex items-center text-gray-300 font-medium">
                <span className="text-emerald-400 mr-3 text-xl">✓</span> <strong>AI Asszisztens</strong> – prediktív sérülés és kiégés előrejelzés
              </li>
              <li className="flex items-center text-gray-300 font-medium">
                <span className="text-emerald-400 mr-3 text-xl">✓</span> <strong>Korlátlan Kliens</strong> – ne legyen akadálya a növekedésnek
              </li>
              <li className="flex items-center text-gray-300 font-medium">
                <span className="text-emerald-400 mr-3 text-xl">✓</span> <strong>Mély statisztikák</strong> – exportálható PDF elemzések
              </li>
              <li className="flex items-center text-gray-300 font-medium">
                <span className="text-emerald-400 mr-3 text-xl">✓</span> <strong>Prioritásos ügyfélszolgálat</strong>
              </li>
            </ul>

            <button className="w-full py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-extrabold text-lg rounded-xl hover:scale-[1.02] transition-transform shadow-lg shadow-orange-500/20">
              Előfizetés Indítása
            </button>
            <p className="text-xs text-gray-500 mt-4">7 napos ingyenes próbaidőszak. Bármikor lemondható.</p>
          </div>
        </main>
      </div>
    );
  }

  if (view === "dashboard") {
    const isCoach = userRole === "COACH";
    const isAiMode = (currentTab === "ai" && !selectedClient) || (selectedClient && isClientAiView);
    
    // KÉK HELYETT LILA TÉMA AZ EDZŐNEK
    const themeGradient = isCoach ? "from-purple-600 to-indigo-600" : "from-emerald-500 to-teal-400";
    const themeText = isCoach ? "text-purple-700" : "text-emerald-700";
    const themeBg = isCoach ? "bg-purple-50" : "bg-emerald-50";

    return (
      <div className={`min-h-screen font-sans relative transition-colors duration-500 ${isAiMode ? "bg-slate-950" : "bg-slate-100"}`}>
        
        <header className={`shadow-sm border-b px-6 py-4 flex flex-col sm:flex-row justify-between items-center z-10 sticky top-0 transition-colors duration-500 ${isAiMode ? "bg-slate-950/80 backdrop-blur-lg border-purple-900/30" : "bg-white border-slate-200"}`}>
          <div className="flex items-center justify-between w-full sm:w-auto mb-4 sm:mb-0">
            
            <button 
              onClick={() => { setSelectedClient(null); setCurrentTab("overview"); }} 
              className={`text-2xl font-extrabold text-transparent bg-clip-text tracking-tight mr-8 hover:opacity-80 transition-opacity text-left ${isAiMode ? "bg-gradient-to-r from-purple-400 to-indigo-300" : `bg-gradient-to-r ${themeGradient}`}`}
            >
              Boosted {isCoach ? "Coach" : "Client"}
            </button>
            
            {!selectedClient && (
              <nav className="hidden sm:flex space-x-2">
                <button onClick={() => setCurrentTab("overview")} className={`px-5 py-2 text-sm font-bold rounded-full transition-all duration-200 ${currentTab === "overview" ? `${themeBg} ${themeText}` : (isAiMode ? "text-purple-300 hover:bg-white/5" : "text-gray-500 hover:bg-gray-100")}`}>Áttekintés</button>
                <button onClick={() => setCurrentTab("ai")} className={`px-5 py-2 text-sm font-bold rounded-full transition-all duration-200 flex items-center gap-1.5 ${currentTab === "ai" ? "bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.5)]" : "text-gray-500 hover:bg-purple-50 hover:text-purple-600"}`}>
                  AI Asszisztens
                </button>
                <button onClick={() => setCurrentTab("profile")} className={`px-5 py-2 text-sm font-bold rounded-full transition-all duration-200 ${currentTab === "profile" ? `${themeBg} ${themeText}` : (isAiMode ? "text-purple-300 hover:bg-white/5" : "text-gray-500 hover:bg-gray-100")}`}>Saját Profil</button>
              </nav>
            )}
          </div>
          
          <div className="flex items-center space-x-4 w-full sm:w-auto justify-between sm:justify-end">
            {!selectedClient && (
              <nav className="sm:hidden flex space-x-1 flex-1 mr-4">
                <button onClick={() => setCurrentTab("overview")} className={`px-3 py-2 text-xs font-bold rounded-full transition-all ${currentTab === "overview" ? `${themeBg} ${themeText}` : (isAiMode ? "text-purple-300" : "text-gray-500")}`}>Áttek</button>
                <button onClick={() => setCurrentTab("ai")} className={`px-3 py-2 text-xs font-bold rounded-full transition-all ${currentTab === "ai" ? "bg-purple-600 text-white shadow-md" : "text-gray-500"}`}>AI</button>
                <button onClick={() => setCurrentTab("profile")} className={`px-3 py-2 text-xs font-bold rounded-full transition-all ${currentTab === "profile" ? `${themeBg} ${themeText}` : (isAiMode ? "text-purple-300" : "text-gray-500")}`}>Profil</button>
              </nav>
            )}
            <span className={`text-sm font-medium hidden md:inline transition-colors ${isAiMode ? "text-purple-200" : "text-gray-600"}`}>
              {loggedInUser} <span className={isAiMode ? "text-purple-400/50" : "text-gray-400"}>({isCoach ? "Edző" : "Kliens"})</span>
            </span>
            <button onClick={handleLogout} className={`px-4 py-2 text-sm font-bold rounded-lg transition whitespace-nowrap ${isAiMode ? "bg-red-500/10 text-red-400 hover:bg-red-500/20" : "bg-red-50 text-red-600 hover:bg-red-100"}`}>
              Kijelentkezés
            </button>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-10 pt-7">

          {isPageLoading ? (
            <div className="flex flex-col items-center justify-center py-32 animate-fade-in-up">
              <div className={`w-16 h-16 border-4 border-t-transparent rounded-full animate-spin ${isCoach ? 'border-purple-600' : 'border-emerald-500'}`}></div>
              <p className="mt-6 text-gray-500 font-bold text-lg tracking-wide animate-pulse">Adatok szinkronizálása...</p>
            </div>
          ) : (
            <>
          
          {/* ========================================== */}
          {/* EDZŐ: RÉSZLETES KLIENS ADATLAP VAGY AI NÉZET */}
          {/* ========================================== */}
          {isCoach && selectedClient && (
            isClientAiView ? (
              <div className="animate-fade-in-up w-full max-w-6xl mx-auto pt-2 pb-12 relative z-10 text-white">
                
                <div className="fixed top-[20%] right-[-10%] w-[600px] h-[600px] bg-purple-600/15 rounded-full blur-[120px] pointer-events-none z-0"></div>
                <div className="fixed bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-orange-600/10 rounded-full blur-[120px] pointer-events-none z-0"></div>

                <div className="relative z-10">
                  
                  <div className="flex justify-between items-center mb-6 w-full">
                    <button onClick={() => { setIsClientAiView(false); setClientAiData(null); }} className="flex items-center text-purple-300 hover:text-white transition-colors font-bold text-sm bg-white/5 px-4 py-2.5 rounded-xl border border-white/10 shadow-sm backdrop-blur-md">
                      <span className="mr-2 text-lg leading-none">←</span> Vissza az adatlapra
                    </button>

                    <button 
                      onClick={() => setIsExportModalOpen(true)} 
                      className="flex items-center text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 transition-all font-bold text-sm px-5 py-2.5 rounded-xl shadow-lg shadow-blue-500/20 active:scale-95"
                    >
                      <span className="mr-2 text-lg"></span> Heti terv letöltése (PDF)
                    </button>
                  </div>

                  <div className="flex flex-col md:flex-row gap-8 items-center md:items-start justify-between mb-8 bg-white/5 backdrop-blur-xl border border-white/10 p-8 md:p-10 rounded-[2rem] shadow-2xl">
                    <div className="max-w-2xl flex-1">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
                        <span className="text-orange-400 text-xs font-bold uppercase tracking-widest">
                          Neural Engine Profil Elemzés
                        </span>
                      </div>
                      <h2 className="text-3xl md:text-5xl font-extrabold mb-4 tracking-tight text-white leading-tight">
                        {selectedClient.last_name} {selectedClient.first_name}
                      </h2>
                      <p className="text-purple-200/70 text-lg leading-relaxed font-medium">
                        {clientAiData ? clientAiData.summary_text : "Az AI modell elemzi a kliens utolsó időszakának biometrikus adatait, edzésvolumenét és jegyzeteidet..."}
                      </p>
                    </div>
                    <div className="text-7xl md:text-8xl drop-shadow-[0_0_30px_rgba(249,115,22,0.4)] animate-pulse hidden md:block">
                      🧠
                    </div>
                  </div>

                  {/* TARTALOM: BETÖLTÉS VAGY ADATOK */}
                  {isClientAiLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                      <div className="w-16 h-16 border-4 border-t-transparent border-orange-500 rounded-full animate-spin mb-6"></div>
                      <h3 className="text-xl font-bold text-white mb-2">Egyedi profil felépítése folyamatban...</h3>
                      <p className="text-purple-300/60 animate-pulse tracking-widest uppercase text-xs font-bold">Trendek elemzése...</p>
                    </div>
                  ) : clientAiData ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up">
                      
                      {/* Sérülés & Kimerültség Kockázat */}
                      <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-white/5 hover:border-red-500/30 transition-all relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-rose-400 opacity-70 group-hover:opacity-100 transition-opacity"></div>
                        <div className="flex justify-between items-center mb-4 mt-2">
                          <h3 className="text-xl font-extrabold text-white tracking-wide">Kockázat & Állapot</h3>
                          <span className={`border px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider shadow-sm ${clientAiData.risk_status === 'Kritikus' ? 'bg-red-500/20 text-red-400 border-red-500/30' : clientAiData.risk_status === 'Stabil' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-orange-500/20 text-orange-400 border-orange-500/30'}`}>
                            {clientAiData.risk_status}
                          </span>
                        </div>
                        <p className="text-sm text-purple-200/70 font-medium mb-6 leading-relaxed flex-1 min-h-[60px]">
                          {clientAiData.risk_desc}
                        </p>
                        <div className="mt-auto bg-black/40 p-4 rounded-xl border border-white/5 relative overflow-hidden">
                          <div className={`absolute left-0 top-0 w-1 h-full ${clientAiData.risk_status === 'Kritikus' ? 'bg-red-500' : clientAiData.risk_status === 'Stabil' ? 'bg-emerald-500' : 'bg-orange-500'}`}></div>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5 pl-2">AI Javaslat</span>
                          <p className="text-sm text-white font-semibold pl-2">{clientAiData.risk_action}</p>
                        </div>
                      </div>

                      {/* Cél Előrejelzés */}
                      <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-white/5 hover:border-emerald-500/30 transition-all relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-600 to-teal-400 opacity-70 group-hover:opacity-100 transition-opacity"></div>
                        <div className="flex justify-between items-center mb-4 mt-2">
                          <h3 className="text-xl font-extrabold text-white tracking-wide">Cél Előrejelzés</h3>
                          <span className={`border px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider shadow-sm ${clientAiData.goal_status === 'Kiváló' || clientAiData.goal_status === 'Pozitív' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : clientAiData.goal_status === 'Stagnál' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>
                            {clientAiData.goal_status}
                          </span>
                        </div>
                        <div className="flex items-end gap-3 mb-6">
                          <span className="text-3xl font-extrabold text-white">{clientAiData.goal_metric}</span>
                        </div>
                        <p className="text-sm text-purple-200/70 font-medium mb-6 leading-relaxed flex-1 min-h-[60px]">
                          {clientAiData.goal_desc}
                        </p>
                        <div className="mt-auto bg-black/40 p-4 rounded-xl border border-white/5 relative overflow-hidden">
                          <div className="absolute left-0 top-0 w-1 h-full bg-emerald-500"></div>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5 pl-2">AI Javaslat</span>
                          <p className="text-sm text-white font-semibold pl-2">{clientAiData.goal_action}</p>
                        </div>
                      </div>

                      {/* Felfedezett Mintázatok */}
                      <div className="md:col-span-2 bg-gradient-to-br from-slate-800 to-slate-900 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-white/5 hover:border-blue-500/30 transition-all relative overflow-hidden group shadow-xl">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-purple-500 opacity-70 group-hover:opacity-100 transition-opacity"></div>
                        <h3 className="text-xl font-extrabold text-white tracking-wide mt-2 mb-6 flex items-center">
                          Rejtett mintázatok a naplókban
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="bg-white/5 p-6 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                            <div className="text-3xl mb-3 drop-shadow-md">{clientAiData.pattern1_icon}</div>
                            <h4 className="text-white font-bold mb-2 text-base">{clientAiData.pattern1_title}</h4>
                            <p className="text-sm text-purple-200/70 leading-relaxed">{clientAiData.pattern1_desc}</p>
                          </div>
                          <div className="bg-white/5 p-6 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                            <div className="text-3xl mb-3 drop-shadow-md">{clientAiData.pattern2_icon}</div>
                            <h4 className="text-white font-bold mb-2 text-base">{clientAiData.pattern2_title}</h4>
                            <p className="text-sm text-purple-200/70 leading-relaxed">{clientAiData.pattern2_desc}</p>
                          </div>
                        </div>
                      </div>

                    </div>
                  ) : (
                    <div className="text-center py-20 bg-white/5 rounded-[2rem] border border-dashed border-white/10">
                      <p className="text-gray-400 font-medium italic">Hiba történt az elemzés betöltésekor.</p>
                    </div>
                  )}

                </div> {/* Itt záródik be az új relatív wrapper */}
              </div>
            ) : (
              /* --- 2. RÉGI, VILÁGOS KLIENS ADATLAP NÉZET (A TE KÓDOD) --- */
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
                    disabled={boostedClientsToday[selectedClient.id]}
                    className={`px-6 py-3 font-bold rounded-xl transition flex items-center justify-center shadow-md text-base ${
                      boostedClientsToday[selectedClient.id] 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200' 
                        : 'bg-gradient-to-r from-orange-400 to-pink-500 text-white hover:shadow-lg'
                    }`}
                  >
                    <span className="text-xl mr-2">{boostedClientsToday[selectedClient.id] ? "" : "⚡"}</span> 
                    {boostedClientsToday[selectedClient.id] ? "Boost elküldve" : "Boost küldése"}
                  </button>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 mb-8 flex flex-col lg:flex-row gap-8 items-stretch animate-fade-in-up">
  
                  {/* BAL OLDAL: Identitás és Fizikai paraméterek */}
                  <div className="flex-1 w-full">
                    
                    {/* Felső sor: Avatár, Név, Email, Tagek */}
                    <div className="flex items-start gap-6 mb-6">
                      
                      <div className="h-24 w-24 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-4xl font-extrabold shrink-0 shadow-inner overflow-hidden">
                        {selectedClient.profile_picture_url ? (
                          <img src={getValidImageUrl(selectedClient.profile_picture_url)} alt="Kliens" className="h-full w-full object-cover" />
                        ) : (
                          selectedClient.last_name ? selectedClient.last_name.charAt(0).toUpperCase() : "K"
                        )}
                      </div>
                      
                      <div className="space-y-3 mt-1">
                        <h1 className="text-3xl font-extrabold text-gray-900 leading-none tracking-tight">
                          {selectedClient.last_name} {selectedClient.first_name}
                        </h1>
                        <div className="flex flex-col gap-1.5 text-sm text-gray-600 font-medium">
                          <span className="flex items-center text-gray-500">{selectedClient.email}</span>
                          <span className="flex items-center text-gray-400 text-xs uppercase tracking-wider font-bold">Csatlakozott: {selectedClient.join_date || "2026.03.14"}</span>
                          <div className="flex flex-wrap gap-2 mt-1">
                            <span className="inline-flex items-center text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-widest shadow-sm">
                              Aktív Kliens
                            </span>
                            {selectedClient.total_boosts > 0 && (
                              <span className="inline-flex items-center text-orange-700 bg-orange-50 border border-orange-200 px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-widest shadow-sm">
                                ⚡ Boosted {selectedClient.total_boosts}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Alsó sor: Fizikai adatok és célok */}
                    <div className="pt-6 border-t border-gray-100">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Magasság</span>
                          <span className="text-xl font-extrabold text-gray-900">
                            {selectedClient.height ? `${selectedClient.height} ` : "N/A"} 
                            {selectedClient.height && <span className="text-sm text-gray-500 font-bold">cm</span>}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Súly</span>
                          <span className="text-xl font-extrabold text-gray-900">
                            {selectedClient.current_weight ? `${selectedClient.current_weight} ` : "N/A"} 
                            {selectedClient.current_weight && <span className="text-sm text-gray-500 font-bold">kg</span>}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Célsúly</span>
                          <span className="text-xl font-extrabold text-gray-900">
                            {selectedClient.goal_weight ? `${selectedClient.goal_weight} ` : "N/A"} 
                            {selectedClient.goal_weight && <span className="text-sm text-gray-500 font-bold">kg</span>}
                          </span>
                        </div>
                        <div className="flex flex-col pl-4 border-l border-gray-100">
                          <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-0.5">BMI Index</span>
                          <span className="text-xl font-extrabold text-emerald-600">
                            {selectedClient.height && selectedClient.current_weight 
                              ? (selectedClient.current_weight / Math.pow(selectedClient.height / 100, 2)).toFixed(1) 
                              : "N/A"}
                          </span>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 text-sm">
                        <div className="mb-2">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Elsődleges Cél</span>
                          <span className="font-bold text-gray-800">
                            {selectedClient.primary_goal || "Nincs megadva"}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Étrend / Allergiák</span>
                          <span className="font-medium text-gray-600">
                            {selectedClient.diet_allergies || "Nincs megadva"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* JOBB OLDAL: Edzői Jegyzetek */}
                  <div className="flex-1 w-full lg:w-auto bg-gray-50 p-5 rounded-xl border border-gray-100 flex flex-col min-h-[300px]">
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
                      className="flex-1 w-full bg-white border border-gray-200 rounded-lg p-3 text-sm text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none resize-none transition"
                      placeholder="Írd ide a klienssel kapcsolatos fontos infókat (pl. sérülések, célok, betegségek)..."
                    ></textarea>
                  </div>
                  
                </div>

                {/* AI Asszisztens Jelentése (Visszaállítva a régi dizájnra) */}
                <div className="bg-gradient-to-r from-indigo-900 to-purple-900 rounded-2xl p-8 mb-8 shadow-lg text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-10 text-9xl"></div>
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
                    <button 
                      onClick={() => setIsClientAiView(true)} 
                      className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-sm font-bold transition"
                    >
                      Elemzés megnyitása
                    </button>
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

                {/* ========================================== */}
                {/* ÚJ: VESZÉLYES ZÓNA AZ ADATLAP ALJÁN        */}
                {/* ========================================== */}
                <div className="mt-12 bg-red-50/40 border border-red-100 rounded-3xl p-8 md:p-10 relative overflow-hidden animate-fade-in-up">
                  <div className="relative z-10 flex flex-col md:flex-row justify-between items-center md:items-end gap-6">
                    <div className="max-w-2xl text-center md:text-left">
                      <h3 className="text-xl font-extrabold text-red-800 mb-2">Kapcsolat megszakítása</h3>
                      <p className="text-sm text-red-600/80 font-medium leading-relaxed">
                        A megszakítással a kliens fiókja, valamint az összes naplója és edzésterve véglegesen törlésre kerül a rendszerből. Ez a művelet nem visszavonható!
                      </p>
                    </div>
                    <button 
                      onClick={() => setIsDisconnectModalOpen(true)} 
                      className="px-6 py-3.5 bg-white border border-red-200 text-red-600 font-bold rounded-xl hover:bg-red-600 hover:text-white hover:border-red-600 transition-all flex items-center shadow-sm text-sm shrink-0"
                    >
                      Fiók törlése
                    </button>
                  </div>
                </div>
              </div>
            )
          )}

          {/* ========================================== */}
          {/* 1. ÁTTEKINTÉS TAB (MODERNIZÁLT ALAP NÉZET)   */}
          {/* ========================================== */}
          {currentTab === "overview" && !selectedClient && (
            <div className="animate-fade-in-up">
              
              {/* Üdvözlő fejléc */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                <div className="relative">
                  <div className={`absolute -left-4 -top-4 w-16 h-16 rounded-full blur-2xl opacity-20 pointer-events-none ${isCoach ? 'bg-purple-500' : 'bg-emerald-500'}`}></div>
                  <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight relative z-10 mb-2">
                    Szia, <span className={`text-transparent bg-clip-text bg-gradient-to-r ${themeGradient}`}>{loggedInFirstName}</span>!
                  </h1>
                  <p className="text-slate-500 font-medium text-lg relative z-10">
                    {isCoach ? "Készen állsz a mai napra? Itt a praxisod összefoglalója." : "Kövesd a fejlődésed és maradj fókuszban!"}
                  </p>
                </div>
                {isCoach && (
                  <button onClick={() => setIsModalOpen(true)} className={`group relative flex items-center px-7 py-3.5 bg-gradient-to-r ${themeGradient} text-white font-bold rounded-2xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 w-full md:w-auto justify-center overflow-hidden`}>
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
                    <span className="relative z-10 flex items-center">
                      <span className="text-xl mr-2 leading-none mb-0.5">+</span> Új kliens meghívása
                    </span>
                  </button>
                )}
              </div>

              {isCoach ? (
                /* --- EDZŐI TARTALOM --- */
                clients.length === 0 ? (
                  <div className="bg-white/60 backdrop-blur-xl rounded-[2.5rem] shadow-sm border border-slate-200/60 p-16 text-center relative overflow-hidden group">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-400/10 rounded-full blur-3xl pointer-events-none transition-all group-hover:bg-purple-400/20"></div>
                    <div className="text-6xl mb-6 transform group-hover:scale-110 transition-transform duration-500">📂</div>
                    <h3 className="text-2xl font-extrabold text-slate-800 mb-3 tracking-tight">Még nincsenek klienseid</h3>
                    <p className="text-slate-500 max-w-md mx-auto text-base font-medium">Küldj ki egy meghívó linket az első kliensednek, hogy elkezdhesse naplózni az adatait és beinduljon a közös munka!</p>
                  </div>
                ) : (
                  <div className="space-y-10">
                    
                    {/* --- GYORS STATISZTIKA KÁRTYÁK --- */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in-up">
                      <div className="bg-white p-7 rounded-3xl shadow-sm border border-slate-200/60 flex flex-col justify-center relative overflow-hidden group hover:border-blue-300 hover:shadow-md transition-all">
                        <div className="absolute -right-6 -top-6 text-8xl opacity-[0.03] group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">📝</div>
                        <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-3">Mai naplózások</h4>
                        <div className="flex items-end gap-2 mb-4">
                          <span className="text-5xl font-black text-slate-900 tracking-tighter">{dashboardStats?.today_logs_count || 0}</span>
                          <span className="text-lg font-bold text-slate-400 mb-1.5">/ {clients.length || 0} kliens</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full transition-all duration-1000 ease-out relative" 
                            style={{ width: `${clients.length > 0 ? ((dashboardStats?.today_logs_count || 0) / clients.length) * 100 : 0}%` }}
                          >
                            <div className="absolute inset-0 bg-white/20 w-full animate-pulse"></div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-7 rounded-3xl shadow-sm border border-orange-100 flex flex-col justify-center relative overflow-hidden group hover:shadow-md transition-all">
                        <div className="absolute -right-4 -top-2 text-7xl opacity-10 group-hover:scale-110 transition-transform duration-500">🔥</div>
                        <h4 className="text-xs font-extrabold text-orange-400/80 uppercase tracking-widest mb-3">Aktív Szériák (Rekorder)</h4>
                        <span className="text-3xl font-black text-orange-950 truncate tracking-tight">{dashboardStats?.top_streak_client || "-"}</span>
                        <span className="text-sm font-extrabold text-orange-600 mt-3 flex items-center gap-2 bg-orange-100/50 w-fit px-3 py-1.5 rounded-xl">
                          <span className="text-base">⚡</span> {dashboardStats?.top_streak_days || 0} napja folyamatosan
                        </span>
                      </div>

                      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-7 rounded-3xl shadow-lg text-white flex flex-col justify-center relative overflow-hidden group">
                        <div className="absolute -right-2 -bottom-4 text-7xl opacity-10 group-hover:scale-110 transition-transform duration-500">📉</div>
                        <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-3">Csapat Átlag Stressz</h4>
                        <div className="flex items-end gap-2 mb-2">
                          <span className="text-5xl font-black text-white tracking-tighter">{dashboardStats?.average_stress || "0.0"}</span>
                          <span className="text-xl font-bold text-slate-500 mb-1.5">/ 10</span>
                        </div>
                        <span className={`text-sm font-bold mt-2 flex items-center gap-2 w-fit px-3 py-1.5 rounded-xl ${dashboardStats?.average_stress >= 7 ? "bg-red-500/20 text-red-400" : "bg-emerald-500/20 text-emerald-400"}`}>
                          {dashboardStats?.average_stress >= 7 ? "Magas stressz szint!" : "Ideális zónában van"}
                        </span>
                      </div>
                    </div>

                    {/* --- FIGYELMET IGÉNYEL (AI RIASZTÁSOK) --- */}
                    {dashboardStats?.alerts && dashboardStats.alerts.length > 0 && (
                      <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200/60 rounded-[2rem] p-7 md:p-9 shadow-sm relative overflow-hidden animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                        <div className="absolute right-0 top-0 w-64 h-64 bg-orange-400 opacity-5 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none"></div>
                        <h3 className="text-xl font-black text-orange-950 mb-6 flex items-center tracking-tight">
                          <span className="bg-gradient-to-r from-orange-400 to-red-500 text-white text-xs px-3 py-1.5 rounded-xl uppercase tracking-widest mr-4 shadow-sm font-extrabold">AI Asszisztens</span>
                          Figyelmet igényel ({dashboardStats.alerts.length})
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 relative z-10">
                          {dashboardStats.alerts.map((alert, idx) => (
                            <div key={idx} className={`flex flex-col bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border hover:shadow-md transition-all hover:-translate-y-0.5 ${alert.type === "stress" ? "border-red-100" : "border-orange-100"}`}>
                              <div className="flex items-start gap-4 mb-5">
                                <div className="text-3xl mt-0.5 drop-shadow-sm">{alert.type === "stress" ? "🚨" : "⚠️"}</div>
                                <div>
                                  <p className="font-extrabold text-slate-900 text-lg tracking-tight">{alert.client_name}</p>
                                  <p className="text-sm text-slate-600 mt-1.5 font-medium leading-relaxed">{alert.message}</p>
                                </div>
                              </div>
                              <button className={`mt-auto w-full py-3.5 text-sm font-bold rounded-xl transition-colors border ${alert.type === "stress" ? "bg-red-50 text-red-700 hover:bg-red-100 border-red-100" : "bg-orange-50 text-orange-700 hover:bg-orange-100 border-orange-100"}`}>
                                {alert.type === "stress" ? "Terv módosítása →" : "Kapcsolatfelvétel →"}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* --- MODERN KLIENS KÁRTYA GRID NÉZET --- */}
                    <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                        <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">Saját klienseim <span className="text-slate-400 font-bold text-lg ml-1">({clients.length})</span></h3>
                        <div className="w-full sm:w-80 relative group">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <svg className="w-5 h-5 text-slate-400 group-focus-within:text-purple-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                          </div>
                          <input 
                            type="text" 
                            placeholder="Keresés név alapján..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-4 py-3.5 border border-slate-200/80 rounded-2xl focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none bg-white text-slate-900 text-sm font-bold tracking-wide transition-all shadow-sm"
                          />
                        </div>
                      </div>
                      
                      {filteredClients.length === 0 ? (
                        <div className="p-16 text-center text-slate-500 bg-white rounded-[2rem] border border-dashed border-slate-300 shadow-sm">
                          <p className="text-lg font-bold">Nincs találat a keresésre: <span className="text-slate-800">"{searchQuery}"</span></p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                          {filteredClients.map(client => (
                            <div 
                              key={client.id} 
                              onClick={() => handleViewClient(client)}
                              className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm hover:shadow-xl hover:-translate-y-1.5 hover:border-purple-200 transition-all cursor-pointer group relative overflow-hidden flex flex-col"
                            >
                              <div className="absolute -right-12 -top-12 w-40 h-40 bg-purple-50/50 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                              
                              <div className="flex items-start gap-4 mb-6 relative z-10">
                                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center font-black text-2xl shrink-0 group-hover:scale-105 transition-transform shadow-sm overflow-hidden">
                                  {client.profile_picture_url ? (
                                    <img src={getValidImageUrl(client.profile_picture_url)} alt="Kliens" className="h-full w-full object-cover" />
                                  ) : (
                                    client.last_name ? client.last_name.charAt(0).toUpperCase() : "K"
                                  )}
                                </div>
                                <div className="pt-1">
                                  <p className="text-lg font-extrabold text-slate-900 leading-tight tracking-tight mb-1 group-hover:text-purple-700 transition-colors">{client.last_name} {client.first_name}</p>
                                  <p className="text-xs font-bold text-slate-500 truncate">{client.email}</p>
                                </div>
                              </div>
                              
                              <div className="mt-auto flex justify-between items-center relative z-10 pt-4 border-t border-slate-100">
                                <div>
                                  {client.total_boosts > 0 ? (
                                    <span className="inline-flex items-center text-[11px] font-extrabold text-orange-600 bg-orange-50 px-2.5 py-1.5 rounded-lg border border-orange-100 uppercase tracking-widest">
                                      <span className="mr-1.5 text-sm">⚡</span> {client.total_boosts} Boost
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center text-[11px] font-extrabold text-slate-400 uppercase tracking-widest px-1 py-1.5">
                                      Nincs aktív boost
                                    </span>
                                  )}
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-purple-600 group-hover:text-white group-hover:border-purple-600 transition-colors shadow-sm">
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"></path></svg>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )
              ) : (
                /* --- KLIENS TARTALOM --- */
                <div className="space-y-8 animate-fade-in-up">
                  
                  {/* Dinamikus Naplózó Banner */}
                  <div className={`relative overflow-hidden rounded-[2.5rem] p-8 md:p-12 shadow-lg flex flex-col md:flex-row items-center justify-between text-white transition-all duration-500 ${hasLoggedToday ? "bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/20" : "bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 shadow-purple-500/20"}`}>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-black/10 rounded-full blur-2xl -ml-10 -mb-10 pointer-events-none"></div>
                    
                    <div className="relative z-10 text-center md:text-left mb-8 md:mb-0 max-w-xl">
                      <div className="inline-block px-3 py-1.5 rounded-lg bg-white/20 backdrop-blur-md border border-white/20 text-xs font-extrabold uppercase tracking-widest mb-4">
                        {hasLoggedToday ? "Küldetés Teljesítve" : "Napi Feladat"}
                      </div>
                      <h3 className="text-3xl md:text-4xl font-black mb-3 tracking-tight">
                        {hasLoggedToday ? "Szuper, mára megvagyunk!" : "Ma még nem naplóztál!"}
                      </h3>
                      <p className="text-white/80 text-lg font-medium leading-relaxed">
                        {hasLoggedToday 
                          ? "Az adataidat sikeresen továbbítottuk a szakértődnek. Pihenj, és térj vissza holnap újult erővel!" 
                          : "Az edződ várja az adataidat. Szánj rá 1 percet, és rögzítsd az alvásodat, stressz-szintedet és a vízfogyasztásodat!"}
                      </p>
                    </div>
                    
                    {!hasLoggedToday && (
                      <button onClick={() => setIsLogModalOpen(true)} className="relative z-10 px-8 py-4 bg-white text-indigo-700 font-black rounded-2xl hover:bg-slate-50 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] hover:-translate-y-1 shrink-0 w-full md:w-auto text-lg">
                        Adatok Rögzítése
                      </button>
                    )}
                  </div>

                  {/* KLIENS HETI TERV (MODERN KÁRTYÁK) */}
                  <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200/60 p-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2">
                      <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">Heti Fókusz</h3>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">Kattints a napra a részletekért</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
                      {daysOfWeek.map((day, idx) => {
                        const hasPlan = !!clientWeeklyPlan[day];
                        return (
                          <div 
                            key={day} 
                            onClick={() => {
                              setPlanDay(day);
                              setIsClientPlanModalOpen(true); 
                            }}
                            className={`p-5 rounded-2xl border cursor-pointer hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group ${hasPlan ? "border-indigo-200 bg-indigo-50/40 hover:shadow-lg hover:shadow-indigo-500/10" : "border-slate-100 bg-slate-50/50 hover:border-slate-300 hover:shadow-md"}`}
                          >
                            {hasPlan && <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>}
                            <span className={`text-[11px] font-black uppercase block mb-1 tracking-widest ${hasPlan ? "text-indigo-600" : "text-slate-400"}`}>
                              {day}
                            </span>
                            <span className="text-xs text-slate-500 font-bold block mb-3">{getDayDateLabel(currentRealMonday, idx)}</span>
                            <div className="text-sm text-slate-800 font-medium whitespace-pre-wrap line-clamp-3">
                              {clientWeeklyPlan[day] || <span className="text-slate-400 italic font-normal">Pihenő</span>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* KORÁBBI NAPLÓZÁSOK */}
                  <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200/60 overflow-hidden">
                    <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                      <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Korábbi naplózásaid</h3>
                      {clientLogs.length > 0 && <span className="text-xs font-extrabold text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-xl uppercase tracking-widest shadow-sm">{clientLogs.length} Napló rögzítve</span>}
                    </div>
                    {clientLogs.length === 0 ? (
                      <div className="p-12 text-center text-slate-500 bg-slate-50/30">
                        <div className="text-5xl mb-4 opacity-30">⏳</div>
                        <p className="font-bold text-lg">Még nem rögzítettél adatot.</p>
                      </div>
                    ) : (
                      <ul className="divide-y divide-slate-100">
                        {clientLogs.map((log) => {
                          const isGood = log.mood.includes("Szuper") || log.mood.includes("Jó");
                          const isBad = log.mood.includes("Rossz");
                          const badgeColor = isGood ? "text-emerald-700 bg-emerald-50 border-emerald-200" : (isBad ? "text-red-700 bg-red-50 border-red-200" : "text-amber-700 bg-amber-50 border-amber-200");
                          return (
                            <li key={log.id} onClick={() => setSelectedLog(log)} className="p-6 sm:px-8 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 cursor-pointer group">
                              <div>
                                <p className="font-extrabold text-slate-900 text-lg mb-1 tracking-tight group-hover:text-indigo-600 transition-colors">{formatDateLabel(log.date)}</p>
                                <div className="flex items-center gap-3 text-sm font-medium text-slate-500">
                                  <span className="flex items-center gap-1"><span className="text-indigo-400">🌙</span> {log.sleep_hours}h</span>
                                  <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                  <span className="flex items-center gap-1"><span className="text-blue-400">💧</span> {log.water_liters}L</span>
                                  <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                  <span className="flex items-center gap-1"><span className="text-orange-400">⚡</span> {log.workout_minutes}p</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end mt-2 sm:mt-0">
                                <span className={`px-3 py-1.5 rounded-lg text-xs font-extrabold border uppercase tracking-widest ${badgeColor}`}>
                                  {log.mood}
                                </span>
                                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all shadow-sm">
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"></path></svg>
                                </div>
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
                  <div className="h-32 w-32 bg-white rounded-full p-1 shadow-lg shrink-0 relative z-10 group">
                  {/* Ha szerkesztés módban vagyunk, a kurzor átvált, és kattintható lesz */}
                  <div 
                    className={`relative h-full w-full rounded-full overflow-hidden ${isEditingProfile ? "cursor-pointer" : ""}`}
                    onClick={() => {
                      if (isEditingProfile) {
                        setTempPicUrl(profileData.profilePictureUrl || "");
                        setIsProfilePicModalOpen(true);
                      }
                    }}
                  >
                    {profileData.profilePictureUrl ? (
                      <img src={getValidImageUrl(profileData.profilePictureUrl)} alt="Profilkép" className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full bg-gray-100 flex items-center justify-center text-5xl font-extrabold text-gray-400">
                        {loggedInLastName ? loggedInLastName.charAt(0).toUpperCase() : "U"}
                      </div>
                    )}
                    
                    {/* Hover effektus: Sötétítő réteg és kamera ikon CSAK szerkesztéskor */}
                    {isEditingProfile && (
                      <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg className="w-8 h-8 text-white mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                        <span className="text-[10px] font-bold text-white uppercase tracking-widest">Kép cseréje</span>
                      </div>
                    )}
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
                          <span className="font-bold text-gray-900">{profileData.joinDate || "-"}</span>
                        </div>
                        <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                          <span className="text-gray-600">Aktív kliensek</span>
                          <span className={`font-bold ${themeText} ${themeBg} px-3 py-1 rounded-lg`}>{clients.length} fő</span>
                        </div>
                        <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                          <span className="text-gray-600 pr-2">Kiosztott Boostok</span>
                          <span className="font-bold text-orange-600 bg-orange-50 px-3 py-1 rounded-lg whitespace-nowrap shadow-sm">
                            {clients.reduce((sum, c) => sum + (c.total_boosts || 0), 0)} db
                          </span>
                        </div>
                        {/* ÚJ: Edzői Saját Értékelés */}
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 pr-2">Átlagos Értékelés</span>
                          <span className="font-bold text-yellow-600 bg-yellow-50 px-3 py-1 rounded-lg flex items-center shadow-sm">
                            ⭐ {profileData.averageRating > 0 ? profileData.averageRating.toFixed(1) : "-"} 
                            <span className="text-xs text-yellow-500 ml-1">({profileData.reviewCount} db)</span>
                          </span>
                        </div>
                      </div>
                    ) : (
                      /* KLIENS STATISZTIKÁK */
                      <div className="space-y-4">
                        <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                          <span className="text-gray-600">Regisztráció</span>
                          <span className="font-bold text-gray-900">{profileData.joinDate || "-"}</span>
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
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Szerep</label>
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
                          
                          {/* ÚJ: Kapcsolat megszakítása gomb kliensnek */}
                          <button 
                            onClick={() => setIsDisconnectModalOpen(true)}
                            className="w-full mt-3 py-2 border border-red-200 text-red-500 font-bold rounded-xl hover:bg-red-50 hover:text-red-600 transition text-xs uppercase tracking-wider shadow-sm"
                          >
                            Kapcsolat megszakítása
                          </button>
                        </div>
                      )}

                      {/* 4. Előfizetési csomag (Teljes szélesség alul) */}
                      <div className="col-span-1 sm:col-span-2">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Előfizetési Csomag</label>
                        <div 
                          onClick={() => setView("premium")} 
                          className="flex items-center justify-between p-3.5 rounded-xl border border-yellow-500/20 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shadow-md relative overflow-hidden group cursor-pointer transition-transform hover:-translate-y-0.5 h-[76px]"
                        >
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
                        {isEditingProfile && <span className="text-[10px] bg-purple-50 text-purple-600 font-bold px-2 py-1 rounded border border-purple-100 uppercase tracking-wider">Szerkesztés alatt</span>}
                      </div>
                      
                      <div className="space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[11px] font-bold text-gray-400 uppercase mb-2 tracking-wider">Város / Helyszín</label>
                            {isEditingProfile ? (
                              <input type="text" placeholder="Pl.: Budapest, vagy Online" className={inputStyle} value={profileData.city} onChange={(e) => setProfileData({...profileData, city: e.target.value})} />
                            ) : (
                              <p className="text-sm font-bold text-gray-800 bg-gray-50/50 p-3 rounded-xl border border-gray-100 inline-flex items-center min-h-[46px] w-full">
                                <span className="mr-2">📍</span> {profileData.city || "Nincs megadva város"}
                              </p>
                            )}
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-gray-400 uppercase mb-2 tracking-wider">Szakmai tapasztalat</label>
                            {isEditingProfile ? (
                              <input type="text" placeholder="Pl.: 5+ év" className={inputStyle} value={profileData.experienceYears} onChange={(e) => setProfileData({...profileData, experienceYears: e.target.value})} />
                            ) : (
                              <p className="text-sm font-bold text-gray-800 bg-gray-50/50 p-3 rounded-xl border border-gray-100 inline-flex items-center min-h-[46px] w-full">
                                <span className="mr-2"></span> {profileData.experienceYears ? `${profileData.experienceYears} év a szakmában` : "Nincs megadva tapasztalat"}
                              </p>
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-gray-400 uppercase mb-2 tracking-wider">Rólam / Mivel foglalkozom</label>
                          {isEditingProfile ? (
                            <textarea rows="4" placeholder="Írj pár mondatot a szakmai hátteredről..." className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-sm font-bold text-gray-800 resize-none transition-all" value={profileData.bio} onChange={(e) => setProfileData({...profileData, bio: e.target.value})} />
                          ) : (
                            <p className="text-sm text-gray-700 bg-gray-50/50 p-4 rounded-xl border border-gray-100 leading-relaxed font-medium min-h-[100px]">
                              {profileData.bio || "Még nem írtál bemutatkozást. Kattints a Profil Szerkesztése gombra fent!"}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-gray-400 uppercase mb-2 tracking-wider">Fő motivációm / Jeligém</label>
                          {isEditingProfile ? (
                            <input type="text" placeholder="Pl.: A legnagyobb siker számomra..." className={inputStyle} value={profileData.motivationQuote} onChange={(e) => setProfileData({...profileData, motivationQuote: e.target.value})} />
                          ) : (
                            <div className="bg-gradient-to-r from-orange-50/50 to-pink-50/50 p-4 rounded-xl border border-orange-100 flex items-start shadow-sm min-h-[70px]">
                              <span className="text-xl mr-3 mt-0.5">🔥</span>
                              <p className="text-sm leading-relaxed font-semibold italic text-gray-800">
                                {profileData.motivationQuote ? `"${profileData.motivationQuote}"` : "Még nincs megadva jelige."}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </div>
          )}

            </>
          )}
          {/* TÖLTŐKÉPERNYŐ FELTÉTEL VÉGE */}

          {/* ========================================== */}
          {/* 3. AI ASSZISZTENS TAB (DINAMIKUS DASHBOARD)  */}
          {/* ========================================== */}
          {currentTab === "ai" && !selectedClient && (
            <div className="animate-fade-in-up w-full max-w-6xl mx-auto pt-4 pb-12">
              
              {/* Háttér fényeffektek */}
              <div className="fixed top-[20%] right-[-10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none z-0"></div>
              <div className="fixed bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none z-0"></div>
              
              <div className="relative z-10">
                
                {/* FEJLÉC */}
                <div className="flex flex-col md:flex-row gap-8 items-center md:items-start justify-between mb-12 bg-white/5 backdrop-blur-xl border border-white/10 p-8 md:p-12 rounded-[2rem] shadow-2xl">
                  <div className="max-w-2xl">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
                      <span className="text-purple-300 text-xs font-bold uppercase tracking-widest">
                        Boosted Neural Engine
                      </span>
                    </div>
                    <h2 className="text-3xl md:text-5xl font-extrabold mb-5 tracking-tight text-white leading-tight">
                      {isCoach ? "AI Asszisztens Elemző Központ" : "Személyes Elemzés"}
                    </h2>
                    <p className="text-purple-200/70 text-lg leading-relaxed font-medium">
                      A mesterséges intelligencia elemezte a rendszeredben lévő adatokat. Íme az aktuális kimutatások:
                    </p>
                  </div>
                  <div className="text-7xl md:text-8xl drop-shadow-[0_0_30px_rgba(168,85,247,0.4)] animate-pulse hidden md:block">🧠</div>
                </div>

                {/* TARTALOM: BETÖLTÉS VAGY ADATOK */}
                {isAiLoading ? (
                  <div className="flex flex-col items-center justify-center py-24">
                    <div className="w-20 h-20 border-4 border-t-transparent border-purple-500 rounded-full animate-spin mb-8"></div>
                    <h3 className="text-2xl font-bold text-white mb-2 italic">Neural Engine elemzés...</h3>
                    <p className="text-purple-300/60 animate-pulse tracking-widest uppercase text-xs font-bold">Adatok strukturálása folyamatban</p>
                  </div>
                ) : aiDashboardData ? (
                  <div className="space-y-6 animate-fade-in-up">
                    
                    {/* 3 Dinamikus Kártya */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {[1, 2, 3].map((num) => (
                        <div key={num} className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/5 flex flex-col hover:border-purple-500/30 transition-all relative overflow-hidden group">
                          <div className={`absolute top-0 left-0 w-full h-1 opacity-70 group-hover:opacity-100 transition-opacity bg-gradient-to-r ${
                            num === 1 ? "from-emerald-500 to-teal-400" : num === 2 ? "from-blue-500 to-cyan-400" : "from-pink-500 to-rose-400"
                          }`}></div>
                          <h3 className="text-lg font-extrabold text-white mb-3 tracking-wide mt-2">
                            {aiDashboardData[`card${num}_title`]}
                          </h3>
                          <p className="text-sm text-purple-200/70 font-medium mb-6 leading-relaxed flex-1">
                            {aiDashboardData[`card${num}_text`]}
                          </p>
                          <div className="mt-auto bg-black/40 p-4 rounded-xl border border-white/5">
                            <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest block mb-1.5">AI Javaslat</span>
                            <p className="text-sm text-gray-200 font-semibold">{aiDashboardData[`card${num}_action`]}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Széles Összegző Doboz */}
                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-purple-500/20 rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden">
                      <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
                        <div className="w-16 h-16 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center shrink-0">
                          <div className="w-6 h-6 border-t-2 border-r-2 border-purple-400 transform rotate-45"></div>
                        </div>
                        <div className="flex-1 text-center md:text-left">
                          <h3 className="text-2xl font-extrabold text-white mb-3 tracking-tight">
                            {aiDashboardData.summary_title}
                          </h3>
                          <p className="text-purple-100/80 font-medium leading-relaxed mb-8 text-lg">
                            {aiDashboardData.summary_text}
                          </p>
                          <button 
                            onClick={() => { setAiDashboardData(null); }}
                            className="px-8 py-3.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-2xl transition-all shadow-[0_0_20px_rgba(147,51,234,0.3)] hover:shadow-[0_0_30px_rgba(147,51,234,0.5)] text-sm uppercase tracking-widest"
                          >
                            Elemzés Frissítése
                          </button>
                        </div>
                      </div>
                    </div>

                  </div>
                ) : (
                  <div className="text-center py-20 bg-white/5 rounded-[2rem] border border-dashed border-white/10">
                    <p className="text-gray-400 font-medium italic">Hiba történt az elemzés betöltésekor.</p>
                  </div>
                )}

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
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 sm:p-4">
            {/* JAVÍTÁS: Fix magasság md:h-[85vh], hogy ne nyúljon ki a képernyőből */}
            <div className="bg-white p-5 sm:p-8 rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-5xl relative animate-fade-in-up flex flex-col md:flex-row gap-4 sm:gap-8 h-[90vh] md:h-[85vh] overflow-hidden">
              
              <button onClick={() => setIsPlanModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-3xl font-light z-20 leading-none bg-white/80 rounded-full w-10 h-10 flex items-center justify-center backdrop-blur-sm">×</button>
              
              {/* Bal oldali sáv: Idővonal */}
              <div className="md:w-1/3 border-b md:border-b-0 md:border-r border-gray-100 pb-4 md:pb-0 md:pr-6 flex flex-col shrink-0">
                <div className="pr-12">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 mb-1 mt-1 md:mt-0">Idővonal</h2>
                  <p className="text-xs sm:text-sm text-gray-500 mb-4">Kattints a napra a szerkesztéshez!</p>
                </div>
                
                <div className="flex items-center justify-between bg-blue-50 p-2 rounded-xl border border-blue-100 mb-4 shrink-0">
                  <button onClick={() => changeWeek(-7)} className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-white shadow-sm text-blue-700 font-bold hover:bg-blue-100 transition">←</button>
                  <span className="text-xs sm:text-sm font-bold text-blue-800">{selectedWeek} hete</span>
                  <button onClick={() => changeWeek(7)} className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-white shadow-sm text-blue-700 font-bold hover:bg-blue-100 transition">→</button>
                </div>

                <div className="flex flex-row md:flex-col overflow-x-auto md:overflow-y-auto gap-3 md:gap-2 pb-2 md:pb-4 flex-1 snap-x scrollbar-hide -mx-5 px-5 md:mx-0 md:px-0">
                  {daysOfWeek.map((day, idx) => {
                    const isActive = planDay === day;
                    return (
                      <div 
                        key={day} 
                        onClick={() => setPlanDay(day)}
                        className={`p-3 sm:p-4 rounded-xl border cursor-pointer transition-all shrink-0 w-[70vw] sm:w-[250px] md:w-auto snap-center ${
                          isActive 
                          ? "border-blue-500 bg-blue-50 shadow-md ring-2 ring-blue-200" 
                          : "border-gray-200 bg-white hover:bg-gray-50 hover:border-blue-300"
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className={`font-extrabold text-sm sm:text-base ${isActive ? "text-blue-700" : "text-gray-700"}`}>
                            {day} <span className="text-gray-400 font-normal text-xs ml-1">({getDayDateLabel(selectedWeek, idx)})</span>
                          </span>
                          {isActive && <span className="text-blue-600 text-[10px] font-bold bg-blue-100 px-2 py-1 rounded hidden sm:inline-block">Szerkesztés</span>}
                        </div>
                        {/* JAVÍTÁS: Csak 1 sorban látszódjon a rövidítő a letisztultabb kinézetért */}
                        <span className={`block text-[10px] sm:text-xs line-clamp-1 mt-0.5 ${modalWeeklyPlan[day] ? "text-gray-500" : "text-gray-400 italic"}`}>
                          {modalWeeklyPlan[day] || "Nincs program rögzítve"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Jobb oldali sáv: Szerkesztő (Kliens stílusú doboz) */}
              <div className="flex-1 flex flex-col h-full bg-gray-50/80 rounded-2xl p-4 sm:p-6 border border-gray-100 relative overflow-hidden">
                <div className="mb-3 shrink-0">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-blue-600 mb-1">{planDay}</h2>
                  <p className="text-xs sm:text-sm text-gray-500">Tervezd meg a kliens napi programját!</p>
                </div>

                <div className="mb-4 shrink-0">
                  <label className="block text-[10px] sm:text-xs font-bold text-gray-500 uppercase mb-1.5">Idősáv (Mettől - Meddig)</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="time" 
                      value={planStartTime} 
                      onChange={e => setPlanStartTime(e.target.value)} 
                      // JAVÍTÁS: Kék gyűrű levéve, focus esetén a border sötétül
                      className="w-full border border-gray-200 p-2.5 sm:p-3 rounded-xl outline-none focus:border-gray-400 text-xs sm:text-sm font-bold text-gray-700 bg-white transition-colors" 
                    />
                    <span className="font-bold text-gray-400">-</span>
                    <input 
                      type="time" 
                      value={planEndTime} 
                      onChange={e => setPlanEndTime(e.target.value)} 
                      className="w-full border border-gray-200 p-2.5 sm:p-3 rounded-xl outline-none focus:border-gray-400 text-xs sm:text-sm font-bold text-gray-700 bg-white transition-colors" 
                    />
                  </div>
                </div>
                
                {/* JAVÍTÁS: Fix konténer, ami kitölti a helyet és görgethető magát a textarea-t tartja */}
                <div className="flex-1 flex flex-col min-h-0 mb-4 bg-white rounded-xl border border-gray-200 overflow-hidden shadow-inner focus-within:border-gray-400 transition-colors">
                  <textarea 
                    placeholder="Pl.: Felsőtest edzés + 20 perc séta..."
                    value={planText} onChange={(e) => setPlanText(e.target.value)}
                    // JAVÍTÁS: Nincs kék gyűrű, 100% magasság a konténeren belül, saját görgetősáv a szövegnek
                    className="flex-1 w-full h-full p-4 sm:p-5 outline-none text-gray-800 text-sm sm:text-base font-medium resize-none custom-scrollbar bg-transparent"
                  ></textarea>
                </div>

                <button disabled={isActionLoading} onClick={handleSaveDayPlan} className="mt-auto w-full py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-md shrink-0 text-sm disabled:opacity-50">
                  {isActionLoading ? "Mentés..." : "Terv Mentése"}
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
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 sm:p-4">
            <div className="bg-white p-5 sm:p-8 rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-5xl relative animate-fade-in-up flex flex-col md:flex-row gap-4 sm:gap-8 h-[85vh] md:h-auto md:max-h-[90vh] overflow-hidden">
              
              <button onClick={() => setIsClientPlanModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-3xl font-light z-20 leading-none bg-white/80 rounded-full w-10 h-10 flex items-center justify-center backdrop-blur-sm">×</button>
              
              {/* Bal oldali sáv: Idővonal */}
              <div className="md:w-1/3 border-b md:border-b-0 md:border-r border-gray-100 pb-4 md:pb-0 md:pr-6 flex flex-col shrink-0">
                <div className="pr-12">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 mb-1 mt-1 md:mt-0">Heti Edzésterv</h2>
                  <p className="text-xs sm:text-sm text-gray-500 mb-4">Nézd meg a feladataidat, vagy lapozz a hetek között!</p>
                </div>
                
                <div className="flex items-center justify-between bg-blue-50 p-2 rounded-xl border border-blue-100 mb-4 shrink-0">
                  <button onClick={() => changeWeek(-7)} className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-white shadow-sm text-blue-700 font-bold hover:bg-blue-100 transition">←</button>
                  <span className="text-xs sm:text-sm font-bold text-blue-800">{selectedWeek} hete</span>
                  <button onClick={() => changeWeek(7)} className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-white shadow-sm text-blue-700 font-bold hover:bg-blue-100 transition">→</button>
                </div>

                {/* Vízszintes görgetés mobilon */}
                <div className="flex flex-row md:flex-col overflow-x-auto md:overflow-y-auto gap-3 md:gap-0 md:space-y-3 pb-2 md:pb-4 flex-1 snap-x scrollbar-hide -mx-5 px-5 md:mx-0 md:px-0">
                  {daysOfWeek.map((day, idx) => {
                    const isActive = planDay === day;
                    const activeObj = clientAllPlans.find(p => p.week_start === selectedWeek);
                    const weekPlan = activeObj && activeObj.plan_data ? JSON.parse(activeObj.plan_data) : {};
                    const hasPlan = !!weekPlan[day];
                    
                    return (
                      <div 
                        key={day} 
                        onClick={() => setPlanDay(day)}
                        className={`p-3 sm:p-4 rounded-xl border cursor-pointer transition-all shrink-0 w-[70vw] sm:w-[250px] md:w-auto snap-center ${
                          isActive 
                          ? "border-blue-500 bg-blue-50 shadow-md ring-2 ring-blue-200" 
                          : "border-gray-200 bg-white hover:bg-gray-50 hover:border-blue-300"
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className={`font-extrabold text-sm sm:text-base ${isActive ? "text-blue-700" : "text-gray-700"}`}>
                            {day} <span className="text-gray-400 font-normal text-xs ml-1">({getDayDateLabel(selectedWeek, idx)})</span>
                          </span>
                          {isActive && <span className="text-blue-600 text-[10px] font-bold bg-blue-100 px-2 py-1 rounded hidden sm:inline-block">Kiválasztva</span>}
                        </div>
                        <span className={`block text-xs sm:text-sm line-clamp-1 ${hasPlan ? "text-gray-800" : "text-gray-400 italic"}`}>
                          {weekPlan[day] || "Pihenőnap"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Jobb oldali sáv: Tartalom olvasása */}
              <div className="flex-1 flex flex-col h-full bg-gray-50/80 rounded-2xl p-4 sm:p-6 border border-gray-100 relative overflow-hidden">
                <div className="mb-4 shrink-0">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-blue-600 mb-1">{planDay}</h2>
                  <p className="text-xs sm:text-sm text-gray-500">Itt találod az edződ által írt részleteket.</p>
                </div>
                
                <div className="flex-1 overflow-y-auto pr-2 mb-4 bg-white rounded-xl p-4 border border-gray-100 shadow-inner">
                  {(() => {
                    const activeObj = clientAllPlans.find(p => p.week_start === selectedWeek);
                    const weekPlan = activeObj && activeObj.plan_data ? JSON.parse(activeObj.plan_data) : {};
                    const currentDayText = weekPlan[planDay];

                    if (!currentDayText) {
                      return (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400">
                          <p className="font-bold text-base sm:text-lg">Erre a napra nincs program.</p>
                          <p className="text-xs sm:text-sm mt-1">Pihenj és regenerálódj!</p>
                        </div>
                      );
                    }

                    return (
                      <p className="text-gray-800 text-sm sm:text-base leading-relaxed whitespace-pre-wrap font-medium">
                        {currentDayText}
                      </p>
                    );
                  })()}
                </div>
                
                <button onClick={() => setIsClientPlanModalOpen(false)} className="mt-auto w-full py-4 sm:py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition shadow-md shrink-0 text-sm">
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
        {/* ÚJ: PUBLIKUS EDZŐI PROFIL MODAL (DINAMIKUS)  */}
        {/* ========================================== */}
        {isCoachProfileModalOpen && !isCoach && (
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center z-[120] p-4 sm:p-6">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl relative animate-fade-in-up overflow-hidden border border-gray-200 flex flex-col max-h-[95vh]">
              
              <button onClick={() => setIsCoachProfileModalOpen(false)} className="absolute top-4 right-4 md:top-6 md:right-8 text-gray-400 hover:text-gray-900 transition-colors text-3xl font-light leading-none z-20 bg-white/80 backdrop-blur-md rounded-full w-10 h-10 flex items-center justify-center hover:bg-gray-100 shadow-sm md:shadow-none md:bg-transparent">×</button>
              
              <div className="flex flex-col md:flex-row h-full overflow-y-auto md:overflow-hidden">
                
                <div className="bg-gray-50 md:w-1/3 p-10 lg:p-12 flex flex-col items-center text-center border-b md:border-b-0 md:border-r border-gray-200 relative shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-transparent pointer-events-none"></div>
                  
                  <div className="h-36 w-36 lg:h-40 lg:w-40 bg-white rounded-full p-2 shadow-xl relative z-10 mb-6">
                    {assignedCoachData?.profile_picture_url ? (
                      <img src={assignedCoachData.profile_picture_url} alt="Edző" className="h-full w-full object-cover rounded-full" />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-6xl font-extrabold text-white">
                        {assignedCoachName ? assignedCoachName.charAt(0).toUpperCase() : "E"}
                      </div>
                    )}
                  </div>
                  
                  <div className="relative z-10 w-full">
                    <span className="inline-block bg-blue-100 text-blue-700 text-[10px] lg:text-xs font-extrabold px-3 py-1.5 rounded-lg border border-blue-200 uppercase tracking-widest shadow-sm mb-4">Hitelesített Szakértő</span>
                    <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight mb-2">{assignedCoachName || "Szakértőd"}</h2>
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Személyi Edző</p>
                    
                    {/* DINAMIKUS VÁROS ÉS DÁTUM */}
                    <div className="flex flex-col gap-2 items-center justify-center text-sm font-medium text-gray-600">
                      <span className="flex items-center"><span className="mr-1.5"></span>{assignedCoachData?.city || "Nincs megadva"}</span>
                      <span className="flex items-center"><span className="mr-1.5"></span> Platform tagja: {assignedCoachData?.join_date || "-"}</span>
                    </div>

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
                      {/* DINAMIKUS BEMUTATKOZÁS */}
                      <p className="text-sm sm:text-base text-gray-600 leading-relaxed font-medium bg-gray-50/50 p-6 rounded-2xl border border-gray-100 whitespace-pre-wrap">
                        {assignedCoachData?.bio || "A szakértő még nem írt bemutatkozást."}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-blue-50/30 p-6 rounded-2xl border border-blue-100 flex flex-col items-center sm:items-start justify-center hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-2 mb-2">
                           <span className="text-[10px] lg:text-xs font-bold text-blue-600 uppercase tracking-wider">Tapasztalat</span>
                        </div>
                        {/* DINAMIKUS TAPASZTALAT */}
                        <span className="text-3xl font-extrabold text-gray-900">{assignedCoachData?.experience_years || "-"} év</span>
                      </div>
                      
                      <div className="bg-emerald-50/30 p-6 rounded-2xl border border-emerald-100 flex flex-col items-center sm:items-start justify-center hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-2 mb-2">
                           <span className="text-[10px] lg:text-xs font-bold text-emerald-600 uppercase tracking-wider">Kliensek</span>
                        </div>
                        <span className="text-3xl font-extrabold text-gray-900">Aktív</span>
                      </div>

                      {/* DINAMIKUS ÉRTÉKELÉS DOBOZ */}
                      <div className="bg-orange-50/30 p-6 rounded-2xl border border-orange-100 flex flex-col items-center sm:items-start justify-center hover:shadow-md transition-shadow">
                         <div className="flex items-center gap-2 mb-2">
                           <span className="text-[10px] lg:text-xs font-bold text-orange-600 uppercase tracking-wider">Értékelés</span>
                        </div>
                        <span className="text-3xl font-extrabold text-gray-900">
                          {assignedCoachData?.average_rating > 0 ? assignedCoachData.average_rating.toFixed(1) : "-"} 
                          <span className="text-base font-medium text-gray-400 ml-1">
                            / 5 <span className="text-sm">({assignedCoachData?.review_count || 0})</span>
                          </span>
                        </span>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-extrabold text-gray-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                         Fő motivációm
                      </h3>
                      {/* DINAMIKUS MOTIVÁCIÓ */}
                      <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-2xl flex items-start shadow-xl relative overflow-hidden">
                        <div className="absolute right-0 top-0 text-9xl opacity-5 -mt-6 -mr-6 pointer-events-none transform rotate-12">🔥</div>
                        <p className="text-sm sm:text-base leading-relaxed font-medium italic text-gray-100 relative z-10 pr-4">
                          {assignedCoachData?.motivation_quote ? `"${assignedCoachData.motivation_quote}"` : "A legnagyobb siker számomra a klienseim fejlődése."}
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

        {/* ========================================== */}
        {/* ÚJ: PROFILKÉP SZERKESZTŐ MODAL               */}
        {/* ========================================== */}
        {isProfilePicModalOpen && (
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center z-[200] p-4 transition-opacity">
            <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md relative animate-fade-in-up border border-gray-100">
              <button onClick={() => setIsProfilePicModalOpen(false)} className="absolute top-5 right-6 text-gray-400 hover:text-gray-800 transition-colors text-3xl font-light leading-none">×</button>
              
              <div className="mb-6 pr-8">
                <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1.5">Kinézet módosítása</p>
                <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight">Profilkép beállítása</h3>
              </div>
              
              <p className="text-sm text-gray-600 mb-6 font-medium leading-relaxed">
                Másold be ide a képed webes linkjét (pl. egy Imgur linket), hogy lecseréld az alapértelmezett avatárt.
              </p>
              
              <div className="mb-8">
                <input 
                  type="text" 
                  placeholder="https://i.imgur.com/..." 
                  className={inputStyle} 
                  value={tempPicUrl} 
                  onChange={(e) => setTempPicUrl(e.target.value)} 
                />
              </div>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setIsProfilePicModalOpen(false)} 
                  className="flex-1 py-3.5 bg-gray-100 text-gray-800 font-bold rounded-xl hover:bg-gray-200 transition text-sm"
                >
                  Mégse
                </button>
                <button 
                  onClick={() => {
                    setProfileData({ ...profileData, profilePictureUrl: tempPicUrl });
                    setIsProfilePicModalOpen(false);
                  }} 
                  className="flex-1 py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-md text-sm"
                >
                  Kép mentése
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* ÚJ: HÉTVÁLASZTÓ PDF EXPORT MODAL           */}
        {/* ========================================== */}
        {isExportModalOpen && (
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center z-[250] p-4 transition-opacity">
            <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md relative animate-fade-in-up border border-gray-100">
              <button onClick={() => setIsExportModalOpen(false)} className="absolute top-5 right-6 text-gray-400 hover:text-gray-800 transition-colors text-3xl font-light leading-none">×</button>
              
              <div className="mb-6 pr-8">
                <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1.5">Exportálás</p>
                <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight">Válassz hetet</h3>
              </div>
              
              <p className="text-sm text-gray-600 mb-6 font-medium leading-relaxed">
                Válaszd ki, melyik hét tervét szeretnéd PDF formátumban letölteni és megosztani a klienssel.
              </p>

              <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {clientAllPlans.length === 0 ? (
                  <p className="text-center py-4 text-gray-400 italic font-medium">Még nincs rögzített terv a kliensnél.</p>
                ) : (
                  clientAllPlans.map((plan) => (
                    <button 
                      key={plan.week_start} 
                      onClick={() => handleExportPdf(plan.week_start)}
                      className="w-full p-4 text-left bg-gray-50 hover:bg-blue-50 border border-gray-100 hover:border-blue-200 rounded-2xl transition-all flex justify-between items-center group shadow-sm hover:shadow-md"
                    >
                      <div>
                        <span className="block text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-1">Hét kezdete</span>
                        <span className="text-gray-900 font-bold text-lg">{plan.week_start}</span>
                      </div>
                      <span className="text-blue-600 bg-white border border-blue-100 px-3 py-1.5 rounded-lg text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                        Letöltés ↓
                      </span>
                    </button>
                  ))
                )}
              </div>

              <button 
                onClick={() => setIsExportModalOpen(false)} 
                className="w-full mt-6 py-3.5 bg-gray-100 text-gray-800 font-bold rounded-xl hover:bg-gray-200 transition text-sm"
              >
                Mégse
              </button>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* ÚJ: KAPCSOLAT MEGSZAKÍTÁSA MEGERŐSÍTŐ MODAL */}
        {/* ========================================== */}
        {isDisconnectModalOpen && (
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center z-[250] p-4">
            <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md relative text-center">
              <h3 className="text-2xl font-extrabold text-gray-900 mb-2">Biztosan megszakítod a kapcsolatot?</h3>
              <p className="text-sm text-gray-600 mb-8 font-medium">
                {isCoach 
                  ? "A kliens azonnal lekerül a listádról, és többé nem látod az adatait." 
                  : "Többé nem kapod meg az edzéstervedet, és az edződ nem látja a naplóidat."}
                Ez a folyamat nem vonható vissza!
              </p>
              <div className="flex gap-3">
                <button onClick={() => setIsDisconnectModalOpen(false)} className="flex-1 py-3.5 bg-gray-100 text-gray-800 font-bold rounded-xl hover:bg-gray-200 transition">
                  Mégse
                </button>
                <button onClick={handleDisconnectConfirm} disabled={isActionLoading} className="flex-1 py-3.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition shadow-md">
                  Igen, megszakítom
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* ÚJ: ÉRTÉKELÉS MODAL (KLIENSNEK MEGSZAKÍTÁS UTÁN) */}
        {/* ========================================== */}
        {isReviewModalOpen && !isCoach && (
          <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-md flex items-center justify-center z-[300] p-4">
            <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md relative text-center animate-fade-in-up">
              <div className="h-20 w-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-3xl font-extrabold text-white mx-auto mb-4 shadow-lg">
                {assignedCoachName ? assignedCoachName.charAt(0).toUpperCase() : "E"}
              </div>
              <h3 className="text-2xl font-extrabold text-gray-900 mb-1">Értékeld a közös munkát!</h3>
              <p className="text-sm text-gray-500 mb-6 font-medium">Milyen volt együtt dolgozni a szakértőddel?</p>
              
              {/* Csillagos értékelés */}
              <div className="flex justify-center gap-2 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button 
                    key={star} 
                    onClick={() => setReviewRating(star)}
                    className={`text-4xl transition-transform hover:scale-110 ${star <= reviewRating ? 'text-yellow-400 drop-shadow-sm' : 'text-gray-200'}`}
                  >
                    ★
                  </button>
                ))}
              </div>

              <textarea 
                rows="3" 
                placeholder="Írj pár szót az edződről (opcionális)..." 
                value={reviewText} 
                onChange={(e) => setReviewText(e.target.value)}
                className="w-full border border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-sm font-medium text-gray-800 resize-none mb-6 bg-gray-50"
              />

              <button onClick={handleReviewSubmit} disabled={isActionLoading} className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-extrabold rounded-xl hover:opacity-90 transition shadow-lg">
                {isActionLoading ? "Küldés..." : "Értékelés beküldése"}
              </button>
            </div>
          </div>
        )}

        {renderAppAlert()}

      </div>
    );
  }
}