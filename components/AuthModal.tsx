"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type AuthModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  if (!isOpen) return null;

  // 🔹 Connexion
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (!email || !password) {
      setMessage("Veuillez entrer votre email et mot de passe.");
      return;
    }

    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.message || "Erreur lors de la connexion.");
    } else {
      localStorage.setItem("token", data.token);
      localStorage.setItem("pseudo", data.pseudo);
      localStorage.setItem("email", data.email);

      onClose();
      router.push("/profil");
    }
  };

  // 🔹 Inscription
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (!username || !email || !password || !confirmPassword) {
      setMessage("Veuillez remplir tous les champs.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Les mots de passe ne correspondent pas.");
      return;
    }

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pseudo: username, email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.message || "Erreur lors de l'inscription.");
    } else {
      setMessage("Compte créé avec succès ! Vous pouvez maintenant vous connecter.");
      setMode("login");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-6 w-96 relative">
        <button
          className="absolute top-2 right-2 text-white"
          onClick={onClose}
        >
          X
        </button>

        {mode === "login" && (
          <>
            <h2 className="text-red-500 text-2xl mb-4">Connexion</h2>
            <input
              type="email"
              placeholder="Email"
              className="w-full p-2 mb-2 rounded bg-gray-800 text-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Mot de passe"
              className="w-full p-2 mb-2 rounded bg-gray-800 text-white"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              onClick={handleLogin}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 rounded mb-2"
            >
              Se connecter
            </button>
            <p
              className="text-blue-400 cursor-pointer text-sm"
              onClick={() => setMode("register")}
            >
              Créer un compte
            </p>
          </>
        )}

        {mode === "register" && (
          <>
            <h2 className="text-red-500 text-2xl mb-4">Inscription</h2>
            <input
              type="text"
              placeholder="Pseudo"
              className="w-full p-2 mb-2 rounded bg-gray-800 text-white"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              type="email"
              placeholder="Email"
              className="w-full p-2 mb-2 rounded bg-gray-800 text-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Mot de passe"
              className="w-full p-2 mb-2 rounded bg-gray-800 text-white"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <input
              type="password"
              placeholder="Confirmer le mot de passe"
              className="w-full p-2 mb-2 rounded bg-gray-800 text-white"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <button
              onClick={handleRegister}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 rounded mb-2"
            >
              S'inscrire
            </button>
            <p
              className="text-blue-400 cursor-pointer text-sm"
              onClick={() => setMode("login")}
            >
              Déjà un compte ?
            </p>
          </>
        )}

        {message && (
          <p className="text-white mt-2 text-center">{message}</p>
        )}
      </div>
    </div>
  );
}
