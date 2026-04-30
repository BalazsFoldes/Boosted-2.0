"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function ClientRegistrationForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [coachName, setCoachName] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState(""); 
  const [lastName, setLastName] = useState("");   

  const [isActionLoading, setIsActionLoading] = useState(false);

  // ==========================================
  // SAJÁT ALERT RENDSZER (Zöld témára igazítva)
  // ==========================================
  const [appAlert, setAppAlert] = useState({ isOpen: false, message: "", type: "info" });
  
  const triggerAlert = (message, type = "info") => {
    setAppAlert({ isOpen: true, message, type });
  };

  const renderAppAlert = () => {
    if (!appAlert.isOpen) return null;

    const isError = appAlert.type === "error";
    const isSuccess = appAlert.type === "success";

    let iconClass = "bg-red-50 text-red-600";
    if (!isError) iconClass = "bg-emerald-50 text-emerald-600";

    let borderClass = "border-red-500";
    if (!isError) borderClass = "border-emerald-500";

    let buttonClass = "bg-red-600 hover:bg-red-700";
    if (!isError) buttonClass = "bg-emerald-500 hover:bg-emerald-600";

    return (
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-[300] p-4 transition-opacity">
        <div className={`bg-white p-8 rounded-3xl shadow-2xl w-full max-w-sm relative transform transition-all flex flex-col items-center text-center animate-fade-in-up border-t-8 ${borderClass}`}>
          
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 shadow-sm ${iconClass}`}>
            {isError ? (
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
            ) : isSuccess ? (
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
            ) : (
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            )}
          </div>

          <h2 className="text-xl font-extrabold text-slate-900 mb-2 tracking-tight">
            {isError ? "Hiba történt" : isSuccess ? "Sikeres!" : "Értesítés"}
          </h2>
          
          <p className="text-sm text-slate-600 mb-8 font-medium leading-relaxed whitespace-pre-wrap">
            {appAlert.message}
          </p>

          <button 
            onClick={() => {
              setAppAlert({ ...appAlert, isOpen: false });
              if (isSuccess) router.push("/");
            }} 
            className={`w-full py-3.5 text-white font-extrabold rounded-xl transition-all shadow-md text-sm ${buttonClass}`}
          >
            Rendben
          </button>
        </div>
      </div>
    );
  };

  // ==========================================
  // TOKEN ELLENŐRZÉS ÉS ADATOK LEKÉRÉSE
  // ==========================================
  useEffect(() => {
    if (!token) {
      setErrorMsg("Nincs megadva meghívó token az URL-ben.");
      setIsLoading(false);
      return;
    }

    const checkToken = async () => {
      try {
        const res = await fetch(`https://boosted-backend-bvvv.onrender.com/api/invite/${token}`);
        if (res.ok) {
          const data = await res.json();
          setCoachName(data.coach_name);
          if (data.prefilled_email) {
            setEmail(data.prefilled_email);
          }
        } else {
          const err = await res.json();
          setErrorMsg(err.detail || "Érvénytelen meghívó.");
        }
      } catch (e) {
        setErrorMsg("Szerver hiba. Nem tudtuk ellenőrizni a meghívót.");
      } finally {
        setIsLoading(false);
      }
    };

    checkToken();
  }, [token]);

  // ==========================================
  // REGISZTRÁCIÓ BEKÜLDÉSE
  // ==========================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsActionLoading(true);
    try {
      const res = await fetch("https://boosted-backend-bvvv.onrender.com/api/register-client", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, email, password, first_name: firstName, last_name: lastName }),
      });

      if (res.ok) {
        triggerAlert("Sikeres regisztráció! Most már bejelentkezhetsz.", "success");
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
      triggerAlert("Szerver hiba történt.", "error");
    } finally {
      setIsActionLoading(false);
    }
  };

  // Közös stílusosztályok az inputokhoz és a labelekhez
  const inputClass = "w-full bg-slate-50 border border-slate-200 p-4 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 font-medium transition-all text-sm";
  const labelClass = "block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-2 ml-1";

  // --- TÖLTŐKÉPERNYŐ ---
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-emerald-200/40 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-t-transparent border-emerald-500 rounded-full animate-spin mb-4"></div>
          <p className="text-emerald-600 font-bold animate-pulse tracking-wide">Meghívó ellenőrzése...</p>
        </div>
      </div>
    );
  }

  // --- HIBAKÉPERNYŐ ---
  if (errorMsg) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-red-200/40 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="bg-white/90 backdrop-blur-xl p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200 w-full max-w-md text-center border border-slate-100 relative z-10 animate-fade-in-up">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl shadow-sm">⚠️</div>
          <h2 className="text-2xl font-extrabold text-slate-900 mb-2 tracking-tight">Hiba történt</h2>
          <p className="text-slate-600 mb-8 font-medium">{errorMsg}</p>
          <button onClick={() => router.push("/")} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold py-4 rounded-xl transition-all shadow-lg active:scale-95">
            Ugrás a főoldalra
          </button>
        </div>
      </div>
    );
  }

  // --- SIKERES TOKEN (Regisztrációs űrlap) ---
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 relative overflow-hidden font-sans">
      
      {/* ================================================== */}
      {/* HÁTTÉR GRADIENS FOLTOK (A Home dizájnhoz igazítva) */}
      {/* ================================================== */}
      <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-emerald-200/40 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-teal-100/40 rounded-full blur-[100px] pointer-events-none z-0"></div>

      <div className="bg-white/95 backdrop-blur-2xl p-8 sm:p-12 rounded-[2.5rem] shadow-2xl shadow-slate-200/60 w-full max-w-[480px] border border-white relative z-10 animate-fade-in-up">
        
        {/* Ikon és Címsor */}
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/30 transform transition-transform hover:scale-105">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">Csatlakozz!</h1>
          <p className="text-sm text-slate-500 font-medium leading-relaxed">
            <span className="font-extrabold text-emerald-600">{coachName}</span> meghívott, hogy csatlakozz a praxisához.<br/>
            Hozd létre a profilod a folytatáshoz!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Név mezők egymás mellett */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Vezetéknév</label>
              <input type="text" required className={inputClass} value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Kiss" />
            </div>
            <div>
              <label className={labelClass}>Keresztnév</label>
              <input type="text" required className={inputClass} value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Dominik" />
            </div>
          </div>

          {/* Email mező */}
          <div>
            <label className={labelClass}>Email cím</label>
            <input type="email" required className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="kiss.dominik@gmail.com" />
            <p className="text-[10px] font-bold text-emerald-600 mt-2 ml-1">Az edződ ezt az emailt adta meg a meghívóban.</p>
          </div>

          {/* Jelszó mező */}
          <div>
            <label className={labelClass}>Jelszó</label>
            <input type="password" required className={inputClass} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </div>

          {/* Beküldés gomb */}
          <button 
            type="submit" 
            disabled={isActionLoading} 
            className={`w-full mt-4 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold py-4 rounded-xl transition-all shadow-lg shadow-emerald-200 active:scale-95 text-[15px] ${isActionLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isActionLoading ? "Fiók létrehozása..." : "Csatlakozás Kliensként"}
          </button>
        </form>
      </div>

      {/* POPUP MEGJELENÍTÉSE */}
      {renderAppAlert()}
      
    </div>
  );
}

// Fő komponens (A Suspense a Next.js elvárása az URL paraméterek használatához)
export default function RegisterClientPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center relative">
        <div className="w-12 h-12 border-4 border-t-transparent border-emerald-500 rounded-full animate-spin"></div>
      </div>
    }>
      <ClientRegistrationForm />
    </Suspense>
  );
}