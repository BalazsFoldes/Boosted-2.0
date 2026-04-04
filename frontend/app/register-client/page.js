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
        alert("Sikeres regisztráció! Most már bejelentkezhetsz.");
        router.push("/"); // Visszadobjuk a főoldalra belépni
      } else {
        const err = await res.json();
        // JAVÍTÁS: FastAPI validációs hibák emberi formátumban történő kiírása
        if (Array.isArray(err.detail)) {
            const errorMessages = err.detail.map(e => `${e.loc[e.loc.length-1]}: ${e.msg}`).join("\n");
            alert("Validációs hiba:\n" + errorMessages);
        } else {
            alert("Hiba: " + err.detail);
        }
      }
    } catch (error) {
      alert("Szerver hiba történt.");
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
          <button type="submit" className="w-full bg-linear-to-r from-blue-600 to-purple-600 text-white font-bold py-4 rounded-xl hover:opacity-90 transition shadow-lg">
            Fiók létrehozása
          </button>
        </form>
      </div>
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