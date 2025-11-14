"use client";

import "./globals.css";
import { Black_Ops_One } from "next/font/google";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { useRouter } from "next/navigation";

const blackOps = Black_Ops_One({ subsets: ["latin"], weight: "400", variable: "--font-blackops" });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [user, setUser] = useState<{ pseudo: string; email: string } | null>(null);

  const [email, setEmail] = useState("");
  const [pseudo, setPseudo] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  // Vérifie si l'utilisateur est déjà connecté
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUser({ pseudo: payload.pseudo, email: payload.email });
      } catch (err) {
        console.error("Erreur lecture token JWT :", err);
      }
    }
  }, []);

  // --- Fonction de connexion ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: email, password }), // IMPORTANT : identifier
    });

    const data = await res.json();

    if (!res.ok) setMessage(data.error || "Erreur lors de la connexion");
    else {
      localStorage.setItem("token", data.token);
      setUser({ pseudo: data.user.pseudo, email: data.user.email });
      setAuthModalOpen(false);
      router.push("/profil");
    }
  };

  // --- Fonction d'inscription ---
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (!pseudo || !email || !password || !confirmPassword) {
      setMessage("Veuillez remplir tous les champs.");
      return;
    }
    if (password !== confirmPassword) {
      setMessage("Les mots de passe ne correspondent pas");
      return;
    }

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pseudo, email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.message || "Erreur lors de l'inscription");
      return;
    }

    // ✅ Inscription réussie : connexion automatique
    const loginRes = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: email, password }),
    });

    const loginData = await loginRes.json();
    if (!loginRes.ok) {
      setMessage("Inscription réussie, mais impossible de se connecter automatiquement. Essayez de vous connecter manuellement.");
      setAuthMode("login");
    } else {
      localStorage.setItem("token", loginData.token);
      setUser({ pseudo: loginData.user.pseudo, email: loginData.user.email });
      setAuthModalOpen(false);
      setMessage("");
      router.push("/profil");
    }

    // Reset form
    setPseudo("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
  };

  // --- Déconnexion ---
  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    router.push("/");
  };

  return (
     <html lang="fr" className={`${blackOps.variable} bg-black text-gray-100`}>
      <body className= "font-sans">
        {/* Navbar */}
        <nav className="w-full flex justify-between items-center px-6 py-4 border-b border-gray-800 bg-black/70 backdrop-blur-md fixed top-0 z-50">
          <Link href="/" onClick={() => setMobileMenuOpen(false)}>
            <h1 className="text-3xl font-extrabold tracking-widest text-transparent bg-clip-text 
             bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 drop-shadow-[0_0_10px_rgba(255,0,0,0.8)] 
             uppercase cursor-pointer select-none">  Warzone Arena

            </h1>

          </Link>

          <div className="hidden md:flex gap-8 text-sm uppercase">
            <Link href="/" className="hover:text-red-400 transition">Accueil</Link>
            <Link href="/tournaments" className="hover:text-red-400 transition">Tournois</Link>
            <Link href="/champions" className="hover:text-red-400 transition">Champions</Link>


            {!user ? (
              <>
                <button onClick={() => { setAuthMode("login"); setAuthModalOpen(true); }} className="hover:text-red-400 transition">Connexion</button>
                <button onClick={() => { setAuthMode("register"); setAuthModalOpen(true); }} className="hover:text-red-400 transition">Inscription</button>
              </>
            ) : (
              <>
                <Link href="/profil" className="hover:text-red-400 transition">Profil</Link>
                <button onClick={handleLogout} className="hover:text-red-400 transition">Déconnexion</button>
              </>
            )}
          </div>

          {/* Mobile menu */}
          <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>

          {mobileMenuOpen && (
            <div className="absolute top-full left-0 w-full bg-black/95 backdrop-blur-md flex flex-col items-center py-4 space-y-4 md:hidden">
              <Link href="/" onClick={() => setMobileMenuOpen(false)}>Accueil</Link>
              <Link href="/tournaments" onClick={() => setMobileMenuOpen(false)}>Tournois</Link>
              <Link href="/champions" onClick={() => setMobileMenuOpen(false)}>Champions</Link>


              {!user ? (
                <>
                  <button onClick={() => { setAuthMode("login"); setAuthModalOpen(true); setMobileMenuOpen(false); }}>Connexion</button>
                  <button onClick={() => { setAuthMode("register"); setAuthModalOpen(true); setMobileMenuOpen(false); }}>Inscription</button>
                </>
              ) : (
                <>
                  <Link href="/profil" onClick={() => setMobileMenuOpen(false)}>Profil</Link>
                  <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }}>Déconnexion</button>
                </>
              )}
            </div>
          )}
        </nav>

        {/* Page content */}
        <main className="pt-20">{children}</main>

        {/* --- Modal Auth --- */}
        {authModalOpen && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-gray-900 p-8 rounded-lg w-96 relative">
              <button className="absolute top-2 right-2 text-white" onClick={() => setAuthModalOpen(false)}>X</button>

              <h2 className="text-2xl font-bold text-red-500 mb-4">
                {authMode === "login" ? "Connexion" : "Inscription"}
              </h2>

              <form onSubmit={authMode === "login" ? handleLogin : handleRegister} className="flex flex-col gap-4">
                {authMode === "register" && (
                  <input type="text" placeholder="Pseudo" value={pseudo} onChange={(e) => setPseudo(e.target.value)} className="p-2 rounded bg-gray-800 text-white" required />
                )}
                <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="p-2 rounded bg-gray-800 text-white" required />
                <input type="password" placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} className="p-2 rounded bg-gray-800 text-white" required />
                {authMode === "register" && (
                  <input type="password" placeholder="Confirmer le mot de passe" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="p-2 rounded bg-gray-800 text-white" required />
                )}

                <button type="submit" className="bg-red-500 hover:bg-red-600 p-2 rounded text-white font-bold">
                  {authMode === "login" ? "Se connecter" : "S'inscrire"}
                </button>
              </form>

              <p className="text-sm text-gray-400 mt-4 text-center">
                {authMode === "login" ? (
                  <>
                    Pas de compte ?{" "}
                    <button className="text-red-500" onClick={() => setAuthMode("register")}>S'inscrire</button>
                  </>
                ) : (
                  <>
                    Déjà un compte ?{" "}
                    <button className="text-red-500" onClick={() => setAuthMode("login")}>Se connecter</button>
                  </>
                )}
              </p>

              {message && <p className="text-red-500 mt-2 text-center">{message}</p>}
            </div>
          </div>
        )}
      </body>
    </html>
  );
}
