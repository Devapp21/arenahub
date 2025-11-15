"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { useRouter } from "next/navigation";

export default function RootLayoutClient() {
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    router.push("/");
  };

  return (
    <>
      {/* Navbar */}
      <nav className="w-full flex justify-between items-center px-6 py-4 border-b border-gray-800 bg-black/70 backdrop-blur-md fixed top-0 z-50">
        <Link href="/" onClick={() => setMobileMenuOpen(false)}>
          <h1 className="text-3xl font-extrabold tracking-widest text-transparent bg-clip-text 
             bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 drop-shadow-[0_0_10px_rgba(255,0,0,0.8)] 
             uppercase cursor-pointer select-none">Warzone Arena
          </h1>
        </Link>

        {/* Desktop menu */}
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

        {/* Hamburger mobile */}
        <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 w-full bg-black/95 flex flex-col items-center py-4 space-y-4 md:hidden">
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

        {/* Modal Auth */}
        {authModalOpen && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-gray-900 p-8 rounded-lg w-96 relative">
              <button className="absolute top-2 right-2 text-white" onClick={() => setAuthModalOpen(false)}>X</button>
              <h2 className="text-2xl font-bold text-red-500 mb-4">
                {authMode === "login" ? "Connexion" : "Inscription"}
              </h2>
              <form className="flex flex-col gap-4">
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
              {message && <p className="text-red-500 mt-2 text-center">{message}</p>}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
