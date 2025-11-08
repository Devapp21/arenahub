"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";


export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) setMessage(error.message);
    else setMessage("Inscription réussie ! Vérifie ton email.");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-gray-100">
      <h1 className="text-4xl font-bold mb-6 text-red-500">Inscription</h1>
      <form onSubmit={handleRegister} className="flex flex-col gap-4 w-80">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="p-2 rounded bg-gray-900 text-gray-100 focus:outline-red-500"
          required
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="p-2 rounded bg-gray-900 text-gray-100 focus:outline-red-500"
          required
        />
        <button
          type="submit"
          className="p-2 bg-red-500 rounded hover:bg-red-600 transition"
        >
          S’inscrire
        </button>
      </form>
      {message && <p className="mt-4 text-center">{message}</p>}
    </div>
  );
}
