"use client";

import "./globals.css";
import { Orbitron } from "next/font/google";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/navigation";

const orbitron = Orbitron({ subsets: ["latin"], variable: "--font-orbitron" });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [user, setUser] = useState<any>(null);

  const [email, setEmail] = useState("");
  const [pseudo, setPseudo] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  // Vérifier si utilisateur déjà connecté au chargement
  useEffect(() => {
    const sessionUser = supabase.auth.getSession().then(({ data }) => {
      if (data.session) setUser(data.session.user);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) setUser(session.user);
      else setUser(null);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // --- Fonctions Auth ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    let identifier = email || pseudo; // On permet email ou pseudo
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email, // Pour simplifier, on ne gère que email ici
      password,
    });
    if (error) setMessage(error.message);
    else {
      setMessage("Connexion réussie !");
      setAuthModalOpen(false);
      router.push("/profil"); // Redirige vers profil
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    if (password !== confirmPassword) {
      setMessage("Les mots de passe ne correspondent pas");
      return;
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) setMessage(error.message);
    else {
      setMessage("Compte créé avec succès !");
      setAuthMode("login");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/");
  };

  return (
    <html lang="fr" className="bg-black text-gray-100">
      <body className={`${orbitron.variable} font-sans`}>
        {/* Navbar */}
        <nav className="w-full flex justify-between items-center px-6 py-4 border-b border-gray-800 bg-black/70 backdrop-blur-md fixed top-0 z-50">
          <Link href="/" onClick={() => setMobileMenuOpen(false)}>
            <h1 className="text-2xl font-bold text-red-500 tracking-widest cursor-pointer">
              ArenaHub
            </h1>
          </Link>

          <div className="hidden md:flex gap-8 text-sm uppercase">
            <Link href="/" className="hover:text-red-400 transition">
              Accueil
            </Link>
            <Link href="/tournaments" className="hover:text-red-400 transition">
              Tournois
            </Link>

            {!user && (
              <>
                <button
                  onClick={() => {
                    setAuthMode("login");
                    setAuthModalOpen(true);
                  }}
                  className="hover:text-red-400 transition"
                >
                  Connexion
                </button>
                <button
                  onClick={() => {
                    setAuthMode("register");
                    setAuthModalOpen(true);
                  }}
                  className="hover:text-red-400 transition"
                >
                  Inscription
                </button>
              </>
            )}

            {user && (
              <>
                <Link href="/profil" className="hover:text-red-400 transition">
                  Profil
                </Link>
                <button onClick={handleLogout} className="hover:text-red-400 transition">
                  Déconnexion
                </button>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>

          {mobileMenuOpen && (
            <div className="absolute top-full left-0 w-full bg-black/95 backdrop-blur-md flex flex-col items-center py-4 space-y-4 md:hidden">
              <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                Accueil
              </Link>
              <Link href="/tournaments" onClick={() => setMobileMenuOpen(false)}>
                Tournois
              </Link>

              {!user && (
                <>
                  <button
                    onClick={() => {
                      setAuthMode("login");
                      setAuthModalOpen(true);
                      setMobileMenuOpen(false);
                    }}
                  >
                    Connexion
                  </button>
                  <button
                    onClick={() => {
                      setAuthMode("register");
                      setAuthModalOpen(true);
                      setMobileMenuOpen(false);
                    }}
                  >
                    Inscription
                  </button>
                </>
              )}

              {user && (
                <>
                  <Link href="/profil" onClick={() => setMobileMenuOpen(false)}>
                    Profil
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                  >
                    Déconnexion
                  </button>
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
              <button
                className="absolute top-2 right-2 text-white"
                onClick={() => setAuthModalOpen(false)}
              >
                X
              </button>
              <h2 className="text-2xl font-bold text-red-500 mb-4">
                {authMode === "login" ? "Connexion" : "Inscription"}
              </h2>

              <form onSubmit={authMode === "login" ? handleLogin : handleRegister} className="flex flex-col gap-4">
                {authMode === "register" && (
                  <input
                    type="text"
                    placeholder="Pseudo"
                    value={pseudo}
                    onChange={(e) => setPseudo(e.target.value)}
                    className="p-2 rounded bg-gray-800 text-white"
                    required
                  />
                )}
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="p-2 rounded bg-gray-800 text-white"
                  required
                />
                <input
                  type="password"
                  placeholder="Mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="p-2 rounded bg-gray-800 text-white"
                  required
                />
                {authMode === "register" && (
                  <input
                    type="password"
                    placeholder="Confirmer le mot de passe"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="p-2 rounded bg-gray-800 text-white"
                    required
                  />
                )}

                <button type="submit" className="bg-red-500 hover:bg-red-600 p-2 rounded text-white font-bold">
                  {authMode === "login" ? "Se connecter" : "S'inscrire"}
                </button>
              </form>

              <p className="text-sm text-gray-400 mt-4 text-center">
                {authMode === "login" ? (
                  <>
                    Pas de compte ?{" "}
                    <button className="text-red-500" onClick={() => setAuthMode("register")}>
                      S'inscrire
                    </button>
                  </>
                ) : (
                  <>
                    Déjà un compte ?{" "}
                    <button className="text-red-500" onClick={() => setAuthMode("login")}>
                      Se connecter
                    </button>
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
