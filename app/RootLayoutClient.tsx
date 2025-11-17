"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { Menu, X } from "lucide-react";
import { useRouter } from "next/navigation";

export default function RootLayoutClient() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register" | "forgot">("login");
  const [user, setUser] = useState<{ pseudo: string; email: string } | null>(null);

  const [emailOrPseudo, setEmailOrPseudo] = useState("");
  const [pseudo, setPseudo] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUser({ pseudo: payload.pseudo || payload.username || payload.name, email: payload.email });
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

  // Login / Register
  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");

    if (authMode === "register") {
      if (!pseudo || !emailOrPseudo || !password || !confirmPassword) {
        setMessage("Tous les champs sont requis.");
        return;
      }
      if (password !== confirmPassword) {
        setMessage("Les mots de passe ne correspondent pas.");
        return;
      }
    } else if (authMode === "login") {
      if (!emailOrPseudo || !password) {
        setMessage("Email ou pseudo et mot de passe requis.");
        return;
      }
    }

    setLoading(true);
    try {
      const endpoint = authMode === "register" ? "/api/register" : "/api/auth/login";
      const body = authMode === "register"
        ? { pseudo, email: emailOrPseudo, password }
        : { identifier: emailOrPseudo, password };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setMessage(data?.message || data?.error || `Erreur ${res.status}`);
        setLoading(false);
        return;
      }

      if (data?.token) {
        localStorage.setItem("token", data.token);
        try {
          const payload = JSON.parse(atob(data.token.split(".")[1]));
          setUser({ pseudo: payload.pseudo || payload.username || payload.name, email: payload.email });
        } catch (err) {
          console.warn("Impossible de lire le token :", err);
        }
        setAuthModalOpen(false);
        router.push("/profil");
      } else {
        setMessage(data?.message || "Connexion/inscription réussie mais pas de token reçu.");
      }
    } catch (err) {
      console.error("Erreur fetch auth :", err);
      setMessage("Erreur réseau lors de l'opération.");
    } finally {
      setLoading(false);
    }
  }, [authMode, emailOrPseudo, password, pseudo, confirmPassword, router]);

  // Mot de passe oublié
  const handleForgotPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");
    if (!emailOrPseudo) {
      setMessage("Veuillez saisir votre email.");
      return;
    }
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailOrPseudo }),
      });

      const data = await res.json();
      if (!res.ok) {
        setMessage(data?.message || `Erreur ${res.status}`);
        setLoading(false);
        return;
      }

      setMessage("Un email de réinitialisation a été envoyé si cet email existe.");
    } catch (err) {
      console.error("Erreur forgot password:", err);
      setMessage("Erreur réseau, réessayez.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Navbar */}
      <nav className="w-full flex justify-between items-center px-6 py-4 border-b border-gray-800 bg-black/70 backdrop-blur-md fixed top-0 z-50 h-[80px] font-inherit">
        <Link href="/" onClick={() => setMobileMenuOpen(false)}>
          <h1 className="text-3xl font-extrabold tracking-widest text-transparent bg-clip-text 
             bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 drop-shadow-[0_0_10px_rgba(255,0,0,0.8)] 
             uppercase cursor-pointer select-none">Warzone Arena
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

        <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        {mobileMenuOpen && (
          <div className="absolute top-full left-0 w-full bg-black/95 flex flex-col items-center py-4 space-y-4 md:hidden font-inherit">
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

      {/* Modal Auth */}
      {authModalOpen && (
        <div className="fixed inset-0 z-[9999] bg-black/70 flex items-center justify-center p-4 font-inherit" onClick={() => setAuthModalOpen(false)}>
          <div className="bg-gray-900 rounded-lg w-full max-w-md p-6 max-h-[95vh] overflow-y-auto relative" onClick={(e) => e.stopPropagation()}>
            <button className="absolute top-2 right-2 text-white" onClick={() => setAuthModalOpen(false)}>X</button>
            <h2 className="text-2xl font-bold text-red-500 mb-4">
              {authMode === "login" ? "Connexion" : authMode === "register" ? "Inscription" : "Mot de passe oublié"}
            </h2>

            {authMode === "forgot" ? (
              <form onSubmit={handleForgotPassword} className="flex flex-col gap-4">
                <input
                  type="email"
                  placeholder="Votre email"
                  value={emailOrPseudo}
                  onChange={(e) => setEmailOrPseudo(e.target.value)}
                  className="p-2 rounded bg-gray-800 text-white"
                  required
                />
                <button type="submit" disabled={loading} className="bg-red-500 hover:bg-red-600 p-2 rounded text-white font-bold disabled:opacity-60">
                  {loading ? "Envoi..." : "Envoyer"}
                </button>
                <button type="button" onClick={() => setAuthMode("login")} className="text-sm text-red-400 hover:underline mt-2 self-start">
                  Retour à la connexion
                </button>
              </form>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {authMode === "register" && (
                  <input type="text" placeholder="Pseudo" value={pseudo} onChange={(e) => setPseudo(e.target.value)} className="p-2 rounded bg-gray-800 text-white" required />
                )}
                <input type="text" placeholder={authMode === "login" ? "Email" : "Email"} value={emailOrPseudo} onChange={(e) => setEmailOrPseudo(e.target.value)} className="p-2 rounded bg-gray-800 text-white" required />
                <input type="password" placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} className="p-2 rounded bg-gray-800 text-white" required />
                {authMode === "register" && (
                  <input type="password" placeholder="Confirmer le mot de passe" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="p-2 rounded bg-gray-800 text-white" required />
                )}
                {authMode === "login" && (
                  <button type="button" onClick={() => setAuthMode("forgot")} className="text-sm text-red-400 hover:underline self-start mt-1">
                    Mot de passe oublié ?
                  </button>
                )}
                <button type="submit" disabled={loading} className="bg-red-500 hover:bg-red-600 p-2 rounded text-white font-bold disabled:opacity-60">
                  {loading ? (authMode === "login" ? "Connexion..." : "Inscription...") : (authMode === "login" ? "Se connecter" : "S'inscrire")}
                </button>
              </form>
            )}

            {message && <p className="text-red-500 mt-2 text-center">{message}</p>}
          </div>
        </div>
      )}
    </>
  );
}
