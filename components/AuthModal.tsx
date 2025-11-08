"use client";

import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

type AuthModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "register" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  if (!isOpen) return null;

  // 🔹 Connexion
  const handleLogin = async () => {
    setMessage("");

    if (!email || !password) {
      setMessage("Veuillez entrer votre email et mot de passe.");
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email, // TypeScript est content, car email est obligatoirement une string
      password,
    });

    if (error) setMessage(error.message);
    else onClose();
  };

  // 🔹 Inscription
  const handleRegister = async () => {
    if (!username || !email || !password || !confirmPassword) {
      setMessage("Veuillez remplir tous les champs.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Les mots de passe ne correspondent pas.");
      return;
    }

    setMessage("");

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } },
    });

    if (error) setMessage(error.message);
    else setMessage(
      "Compte créé avec succès ! Vous pouvez maintenant vous connecter."
    );
  };

  // 🔹 Mot de passe oublié
  const handleForgotPassword = async () => {
    setMessage("");

    if (!email) {
      setMessage("Veuillez entrer votre email.");
      return;
    }

    const { data, error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) setMessage(error.message);
    else setMessage("Un email de réinitialisation a été envoyé !");
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
            <div className="flex justify-between text-sm">
              <p
                className="text-blue-400 cursor-pointer"
                onClick={() => setMode("register")}
              >
                Créer un compte
              </p>
              <p
                className="text-blue-400 cursor-pointer"
                onClick={() => setMode("forgot")}
              >
                Mot de passe oublié ?
              </p>
            </div>
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

        {mode === "forgot" && (
          <>
            <h2 className="text-red-500 text-2xl mb-4">Mot de passe oublié</h2>
            <input
              type="email"
              placeholder="Email"
              className="w-full p-2 mb-2 rounded bg-gray-800 text-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button
              onClick={handleForgotPassword}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 rounded mb-2"
            >
              Envoyer l’email
            </button>
            <p
              className="text-blue-400 cursor-pointer text-sm"
              onClick={() => setMode("login")}
            >
              Retour à la connexion
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
