"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

// Segédkomponens a paraméterek olvasásához
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
  // ÚJ: SAJÁT ALERT RENDSZER (MODERN POPUP)
  // ==========================================
  const [appAlert, setAppAlert] = useState({ isOpen: false, message: "", type: "info" });
  
  const triggerAlert = (message, type = "info") => {
    setAppAlert({ isOpen: true, message, type });
  };

  const renderAppAlert = () => {
    if (!appAlert.isOpen) return null;

    const isError = appAlert.type === "error";
    const isSuccess = appAlert.type === "success";

    // Kliens téma: Smaragdzöld (Emerald)
    let iconClass = "bg-red-50 text-red-600";
    if (!isError) {
      iconClass = "bg-gradient-to-br from-emerald-100 to-teal-100 text-emerald-600";
    }

    let borderClass = "border-red-500";
    if (!isError) {
      borderClass = "border-emerald-500";
    }

    let buttonClass = "bg-red-600 hover:bg-red-700 shadow-red-200";
    if (!isError) {
      buttonClass = "bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-90 shadow-emerald-200";
    }

    return (
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[300] p-4 transition-opacity">
        <div className={`bg-white p-8 rounded-[2rem] shadow-2xl w-full max-w-sm relative transform transition-all flex flex-col items-center text-center animate-fade-in-up border-t-8 ${borderClass}`}>
          
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
            {isError ? "Hiba történt" : isSuccess ? "Sikeres Csatlakozás!" : "Értesítés"}
          </h2>
          
          <p className="text-sm text-slate-600 mb-8 font-medium leading-relaxed whitespace-pre-wrap">
            {appAlert.message}
          </p>

          <button 
            onClick={() => {
              setAppAlert({ ...appAlert, isOpen: false });
              if (isSuccess) {
                router.push("/");
              }
            }} 
            className={`w-full py-3.5 text-white font-bold rounded-xl transition-all shadow-lg text-sm ${buttonClass}`}
          >
            {isSuccess ? "Tovább a belépéshez" : "Rendben"}
          </button>
        </div>
      </div>
    );
  };

  // Amikor betölt az oldal, ellenőrizzük a tokent a backenddel
  useEffect(() => {
    if (!token) {
      setErrorMsg("Nincs megadva meghívó token az URL-ben.");
      setIsLoading(false);
      return;
    }

    const checkToken = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/invite/${token}`);
        if (res.ok) {
          const data = await res.json();
          setCoachName(data.coach_name);
          if (data.prefilled_email) {
            setEmail(data.prefilled_email);
          }
        } else {
          const err = await res.json();
          setErrorMsg(err.detail || "Érvénytelen vagy lejárt meghívó.");
        }
      } catch (e) {
        setErrorMsg("Szerver hiba. Nem tudtuk ellenőrizni a meghívót.");
      } finally {
        setIsLoading(false);
      }
    };

    checkToken();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsActionLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/register-client", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, email, password, first_name: firstName, last_name: lastName }),
      });

      if (res.ok) {
        triggerAlert("Sikeres regisztráció! A fiókod elkészült, most már bejelentkezhetsz az alkalmazásba.", "success");
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
      triggerAlert("Szerver hiba történt a regisztráció során.", "error");
    } finally {
      setIsActionLoading(false);
    }
  };

  // --- TÖLTŐKÉPERNYŐ ---
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMSI+PC9yZWN0Pgo8cGF0aCBkPSJNMCAwTDggOFpNOCAwTDAgOFoiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLW9wYWNpdHk9IjAuMSI+PC9wYXRoPgo8L3N2Zz4=')] opacity-30"></div>
        <div className="w-16 h-16 border-4 border-emerald-100 border-t-emerald-500 rounded-full animate-spin z-10"></div>
        <p className="mt-6 text-slate-500 font-bold text-lg tracking-wide animate-pulse z-10">Meghívó ellenőrzése...</p>
      </div>
    );
  }

  // --- HIBAKÉPERNYŐ (Lejárt / Rossz token) ---
  if (errorMsg) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 relative overflow-hidden font-sans">
        <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-red-200/40 rounded-full blur-[100px] pointer-events-none z-0"></div>
        
        <div className="bg-white/90 backdrop-blur-xl p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 w-full max-w-md text-center border border-slate-100 relative z-10 animate-fade-in-up">
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl shadow-inner">⚠️</div>
          <h2 className="text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">Hiba történt</h2>
          <p className="text-slate-600 mb-8 font-medium leading-relaxed">{errorMsg}</p>
          <button onClick={() => router.push("/")} className="w-full py-4 bg-slate-900 text-white font-extrabold rounded-xl hover:bg-slate-800 transition shadow-lg">
            Vissza a főoldalra
          </button>
        </div>
      </div>
    );
  }

  // --- SIKERES TOKEN (Regisztrációs űrlap) ---
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 relative overflow-hidden font-sans">
      
      {/* Háttér fény effektek (Smaragdzöld Kliens Téma) */}
      <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-emerald-200/40 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-teal-100/40 rounded-full blur-[100px] pointer-events-none z-0"></div>

      <div className="absolute inset-0 opacity-20 pointer-events-none z-0 flex items-center justify-center overflow-hidden">
         <span className="text-[25vw] font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600/[0.05] to-teal-600/[0.05] tracking-tighter leading-none whitespace-nowrap">
           Boosted
         </span>
      </div>

      {/* Fő Kártya */}
      <div className="bg-white/90 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl shadow-slate-200/60 w-full max-w-lg border border-slate-100 relative z-10 p-8 sm:p-12 animate-fade-in-up">
        
        {/* Logó és Ikon */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-200 relative z-10">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
            </div>
            <div className="absolute -inset-2 bg-emerald-400/20 rounded-[1.5rem] blur-sm z-0"></div>
          </div>
        </div>

        {/* Személyes üzenet */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">Csatlakozz!</h2>
          <p className="text-slate-600 font-medium leading-relaxed">
            <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">{coachName}</span> meghívott, hogy csatlakozz a praxisához. Hozd létre a profilod a folytatáshoz!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Vezetéknév</label>
              <input type="text" required className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 font-medium transition-all" value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Keresztnév</label>
              <input type="text" required className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 font-medium transition-all" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </div>
          </div>
          
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Email cím</label>
            <input type="email" required className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 font-medium transition-all" value={email} onChange={(e) => setEmail(e.target.value)} />
            {email && <p className="text-[10px] text-emerald-600 mt-1 font-bold">Az edződ ezt az emailt adta meg a meghívóban.</p>}
          </div>
          
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Jelszó</label>
            <input type="password" required className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 font-medium transition-all" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          
          <button type="submit" disabled={isActionLoading} className={`w-full mt-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-extrabold py-4 rounded-xl transition-all shadow-lg ${isActionLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02] hover:shadow-emerald-200 active:scale-95'}`}>
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-500 rounded-full animate-spin"></div>
      </div>
    }>
      <ClientRegistrationForm />
    </Suspense>
  );
}