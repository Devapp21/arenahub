"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error);
        return;
      }

      // ✅ Stocke le token dans localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("username", data.user.username);
      localStorage.setItem("email", data.user.email);

      setMessage("Connexion réussie !");
      router.push("/profile");
    } catch (err) {
      console.error(err);
      setMessage("Erreur lors de la connexion.");
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
