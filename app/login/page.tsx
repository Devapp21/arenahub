"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState(""); // email ou pseudo
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Si l'utilisateur renseigne un pseudo, on récupère l'email correspondant
    let emailToUse = identifier;
    const { data: userByUsername } = await supabase
      .from("users")
      .select("email")
      .eq("username", identifier)
      .single();

    if (userByUsername?.email) {
      emailToUse = userByUsername.email;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: emailToUse,
      password,
    });

    if (error) setMessage(error.message);
    else {
      setMessage("Connexion réussie !");
      router.push("/profile"); // Redirige vers profil
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-gray-100">
      <h1 className="text-4xl font-bold mb-6 text-red-500">Connexion</h1>
      <form onSubmit={handleLogin} className="flex flex-col gap-4 w-80">
        <input
          type="text"
          placeholder="Email ou pseudo"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
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
          Se connecter
        </button>
      </form>
      {message && <p className="mt-4 text-center">{message}</p>}
    </div>
  );
}
