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
  // JAVÍTÁS: fullName helyett firstName és lastName
  const [firstName, setFirstName] = useState(""); 
  const [lastName, setLastName] = useState("");   

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

    // Mivel ez a regisztrációs oldal, használjuk a prémium kék/lila dizájnt a sikeres/infó üzenetekhez
    let iconClass = "bg-red-50 text-red-600";
    if (!isError) {
      iconClass = "bg-gradient-to-br from-blue-100 to-purple-100 text-purple-600";
    }

    let borderClass = "border-red-500";
    if (!isError) {
      borderClass = "border-purple-500";
    }

    let buttonClass = "bg-red-600 hover:bg-red-700";
    if (!isError) {
      buttonClass = "bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90";
    }

    return (
      <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-md flex items-center justify-center z-[300] p-4 transition-opacity">
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

          <h2 className="text-xl font-extrabold text-gray-900 mb-2 tracking-tight">
            {isError ? "Hiba történt" : isSuccess ? "Sikeres!" : "Értesítés"}
          </h2>
          
          <p className="text-sm text-gray-600 mb-8 font-medium leading-relaxed whitespace-pre-wrap">
            {appAlert.message}
          </p>

          <button 
            onClick={() => {
              setAppAlert({ ...appAlert, isOpen: false });
              // Ha sikeres volt a regisztráció, az alert bezárása után irányítjuk át a felhasználót
              if (isSuccess) {
                router.push("/");
              }
            }} 
            className={`w-full py-3.5 text-white font-bold rounded-xl transition-all shadow-md text-sm ${buttonClass}`}
          >
            Rendben
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
            setEmail(data.prefilled_email); // Ha emailben küldték, kitöltjük neki előre!
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

  // Regisztráció beküldése
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:8000/api/register-client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // JAVÍTÁS: first_name és last_name küldése a backendnek
        body: JSON.stringify({ 
          token, 
          email, 
          password, 
          first_name: firstName, 
          last_name: lastName 
        }),
      });

      if (res.ok) {
        // JAVÍTÁS: natív alert helyett az új rendszer
        triggerAlert("Sikeres regisztráció! Most már bejelentkezhetsz.", "success");
        // Az átirányítást (router.push) betettem a popup "Rendben" gombjára, 
        // hogy a felhasználó el tudja olvasni az üzenetet, mielőtt elugrik az oldal.
      } else {
        const err = await res.json();
        // JAVÍTÁS: FastAPI validációs hibák emberi formátumban történő kiírása + új alert
        if (Array.isArray(err.detail)) {
            const errorMessages = err.detail.map(e => `${e.loc[e.loc.length-1]}: ${e.msg}`).join("\n");
            triggerAlert("Validációs hiba:\n" + errorMessages, "error");
        } else {
            triggerAlert(err.detail, "error");
        }
      }
    } catch (error) {
      triggerAlert("Szerver hiba történt.", "error");
    }
  };

  const inputStyle = "w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white text-gray-900 font-sans font-medium tracking-wide transition-all";

  // --- TÖLTŐKÉPERNYŐ ---
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500 font-bold animate-pulse">Meghívó ellenőrzése...</p>
      </div>
    );
  }

  // --- HIBAKÉPERNYŐ (Lejárt / Rossz token) ---
  if (errorMsg) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center border-t-4 border-red-500">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Hiba történt</h2>
          <p className="text-gray-600 mb-6">{errorMsg}</p>
          <button onClick={() => router.push("/")} className="text-blue-600 font-bold hover:underline">
            Ugrás a főoldalra
          </button>
        </div>
      </div>
    );
  }

  // --- SIKERES TOKEN (Regisztrációs űrlap) ---
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border-t-4 border-purple-600">
        
        {/* Személyes üzenet */}
        <div className="text-center mb-6">
          <span className="inline-block p-3 bg-purple-100 text-purple-600 rounded-full mb-3 text-3xl">🤝</span>
          <h2 className="text-2xl font-bold text-gray-800 mb-1">Szia!</h2>
          <p className="text-gray-600">
            <span className="font-bold text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-purple-600">{coachName}</span> meghívott, hogy csatlakozz a Boosted platformhoz.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* JAVÍTÁS: Két külön mező a vezetéknévnek és keresztnévnek */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Név</label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Vezetéknév</label>
                <input type="text" required className={inputStyle} value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Keresztnév</label>
                <input type="text" required className={inputStyle} value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Email cím</label>
            <input type="email" required className={inputStyle} value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Jelszó</label>
            <input type="password" required className={inputStyle} value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-4 rounded-xl hover:opacity-90 transition shadow-lg">
            Fiók létrehozása
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
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Betöltés...</div>}>
      <ClientRegistrationForm />
    </Suspense>
  );
}