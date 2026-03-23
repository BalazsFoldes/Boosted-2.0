"use client";
import { useState, useEffect } from "react";

export default function Home() {
  const [view, setView] = useState("landing"); 

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  
  const [loggedInUser, setLoggedInUser] = useState(""); 
  const [coachId, setCoachId] = useState(null); 
  const [userRole, setUserRole] = useState(""); 
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clientEmail, setClientEmail] = useState("");
  const [generatedLink, setGeneratedLink] = useState("");

  // ÚJ ÁLLAPOT: Itt tároljuk az edző klienseit
  const [clients, setClients] = useState([]);

  // ÚJ FUNKCIÓ: Kliensek lekérése a backendről
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

  // ÚJ: Automatikusan lekéri a klienseket, ha betölt a dashboard és edző az illető
  useEffect(() => {
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
        body: JSON.stringify({ email, password, full_name: fullName }),
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
        setCoachId(data.coach_id); 
        setUserRole(data.role); 
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
    setClients([]); // Kilépéskor ürítjük a listát is
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
            A Boosted egy adatközpontú platform, amely összeköti a személyi edzőket és klienseiket. Kövesd az alvást, a stresszt és az energiát egyetlen, AI által támogatott felületen.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl text-left">
            <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100 flex flex-col">
              <div className="text-4xl mb-4">🏃‍♂️</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Klienseknek</h2>
              <p className="text-gray-600 mb-6 flex-1">Naplózd egyszerűen a napi biometrikus adataidat, hogy az edződ személyre szabottabb és hatékonyabb edzéstervet tudjon neked készíteni.</p>
              <div className="p-4 bg-orange-50 text-orange-800 rounded-lg text-sm border border-orange-100 font-medium">
                ⚠️ Csatlakozni kizárólag az edződtől kapott személyes meghívó linkkel tudsz!
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl shadow-md border border-blue-100 flex flex-col">
              <div className="text-4xl mb-4">📊</div>
              <h2 className="text-2xl font-bold text-blue-900 mb-3">Személyi Edzőknek</h2>
              <p className="text-blue-800 mb-6 flex-1 opacity-90">Lásd át az összes kliensed állapotát egyetlen Dashboardon. Generálj AI riportokat és előzd meg a túledzést még mielőtt bekövetkezne.</p>
              <button onClick={() => setView("register")} className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg hover:shadow-blue-200">
                Regisztráció Edzőként
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
            Edzői Fiók Létrehozása
          </h2>
          <form onSubmit={handleRegister} className="space-y-5 mt-8">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Teljes Név</label>
              <input type="text" required className={inputStyle} value={fullName} onChange={(e) => setFullName(e.target.value)} />
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

    return (
      <div className="min-h-screen bg-gray-100 font-sans relative">
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <div className="text-xl font-bold text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-purple-600 tracking-tight">
            Boosted {isCoach ? "Coach" : "Client"}
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600 font-medium">
              {loggedInUser} <span className="text-gray-400">({isCoach ? "Edző" : "Kliens"})</span>
            </span>
            <button onClick={handleLogout} className="px-4 py-2 bg-red-50 text-red-600 text-sm font-bold rounded-lg hover:bg-red-100 transition">Kijelentkezés</button>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-10">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900">Szia, {loggedInUser}! 👋</h1>
              <p className="text-gray-500 mt-2">
                {isCoach 
                  ? "Itt találod majd a klienseid adatait és az elemzéseket." 
                  : "Itt rögzítheted a napi adataidat az edződ számára."}
              </p>
            </div>
            
            {isCoach && (
              <button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-md"
              >
                <span className="text-xl mr-2">+</span> Új kliens meghívása
              </button>
            )}
          </div>

          {isCoach ? (
            /* --- EDZŐI TARTALOM (Lista vagy Üres állapot) --- */
            clients.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-dashed border-gray-300 p-16 text-center animate-fade-in-up">
                <div className="text-5xl mb-4 opacity-50">📂</div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">Még nincsenek klienseid</h3>
                <p className="text-gray-500 max-w-md mx-auto">Küldj ki egy meghívó linket az első kliensednek, hogy elkezdhesse naplózni az adatait!</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden animate-fade-in-up">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                  <h3 className="text-lg font-bold text-gray-800">Saját klienseim ({clients.length})</h3>
                </div>
                <ul className="divide-y divide-gray-200">
                  {clients.map(client => (
                    <li key={client.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition">
                      <div className="flex items-center">
                        <div className="h-12 w-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xl mr-4">
                          {client.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-md font-bold text-gray-900">{client.full_name}</p>
                          <p className="text-sm text-gray-500">{client.email}</p>
                        </div>
                      </div>
                      <button className="text-sm bg-white border border-gray-300 px-4 py-2 rounded-lg text-gray-700 font-bold hover:bg-gray-50 transition shadow-sm">
                        Adatok megtekintése →
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )
          ) : (
            /* --- KLIENS TARTALOM --- */
            <div className="bg-white rounded-2xl shadow-sm border border-dashed border-gray-300 p-16 text-center">
              <div className="text-5xl mb-4 opacity-50">📝</div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">Napi Naplózás</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Ide kerülnek majd a csúszkák, ahol a vizet, alvást és a stresszt tudod majd rögzíteni az edződnek!
              </p>
            </div>
          )}
        </main>

        {/* --- MEGHÍVÓ MODAL --- */}
        {isModalOpen && isCoach && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md relative">
              <button 
                onClick={() => { setIsModalOpen(false); setGeneratedLink(""); }}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>

              <h2 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">
                Kliens Meghívása
              </h2>
              <p className="text-sm text-gray-500 mb-6">A meghívó link biztonsági okokból 24 óráig érvényes.</p>

              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">Küldés Emailben</label>
                <div className="flex">
                  <input 
                    type="email" 
                    placeholder="kliens@email.hu" 
                    className="flex-1 border border-gray-300 p-3 rounded-l-xl focus:outline-blue-500 bg-white text-black"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                  />
                  <button 
                    onClick={() => handleGenerateInvite(true)}
                    disabled={!clientEmail.includes("@")}
                    className="bg-blue-600 text-white font-bold px-6 rounded-r-xl hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Küldés
                  </button>
                </div>
              </div>

              <div className="relative flex py-4 items-center">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="shrink-0 px-4 text-gray-400 text-sm font-bold">VAGY</span>
                <div className="flex-grow border-t border-gray-200"></div>
              </div>

              <div>
                <button 
                  onClick={() => handleGenerateInvite(false)}
                  className="w-full py-3 bg-gray-100 text-gray-800 font-bold rounded-xl hover:bg-gray-200 transition mb-4"
                >
                  🔗 Manuális Link Generálása
                </button>

                {generatedLink && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                    <p className="text-xs font-bold text-green-800 mb-1 uppercase tracking-wide">Másolható Link:</p>
                    <input 
                      type="text" 
                      readOnly 
                      value={generatedLink} 
                      className="w-full bg-white border border-green-300 p-2 rounded text-sm text-black outline-none"
                      onClick={(e) => { e.target.select(); navigator.clipboard.writeText(generatedLink); alert("Másolva!"); }}
                    />
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