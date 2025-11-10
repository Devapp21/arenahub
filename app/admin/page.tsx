"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Tournament = {
  _id: string;
  name: string;
  description: string;
  image: string;
  date: string;
  maxParticipants?: number;
  secretCode?: string;
};

export default function AdminPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Champs pour création de tournoi
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState(""); // Nouvelle entrée pour l'heure
  const [maxParticipants, setMaxParticipants] = useState(0);

  // Gestion code secret
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTournamentId, setSelectedTournamentId] = useState("");
  const [secretCodeInput, setSecretCodeInput] = useState("");

  const [message, setMessage] = useState("");

  // Fonction pour décoder le token JWT côté client
  function decodeToken(token: string) {
    try {
      const payload = token.split(".")[1];
      const decoded = JSON.parse(atob(payload));
      return decoded;
    } catch {
      return null;
    }
  }

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const decoded = decodeToken(token);
    if (!decoded) {
      router.push("/login");
      return;
    }

    if (decoded.role === "admin") setIsAdmin(true);
    else router.push("/");

    setLoading(false);

    // Charger la liste des tournois pour le select code secret
    fetchTournaments();
  }, [router]);

  const fetchTournaments = async () => {
    try {
      const res = await fetch("/api/tournaments");
      const data = await res.json();
      setTournaments(data);
    } catch (err) {
      console.error("Erreur fetch tournois :", err);
    }
  };

  const handleCreateTournament = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("Non autorisé");
      return;
    }

    const res = await fetch("/api/tournaments/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name,
        description,
        image,
        date: `${date}T${time}`, // Combine date + time
        maxParticipants,
      }),
    });

    const data = await res.json();
    if (res.ok) {
      setMessage("✅ Tournoi créé avec succès !");
      setName("");
      setDescription("");
      setImage("");
      setDate("");
      setTime("");
      setMaxParticipants(0);
      fetchTournaments(); // Mettre à jour liste
    } else {
      setMessage(`❌ Erreur : ${data.error || "Impossible de créer le tournoi"}`);
    }
  };

  const handleSetSecretCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (!selectedTournamentId || !secretCodeInput) {
      setMessage("Sélectionnez un tournoi et entrez le code secret.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) return setMessage("Non autorisé");

    try {
      const res = await fetch(`/api/tournaments/${selectedTournamentId}/set-secret`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ secretCode: secretCodeInput }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(`✅ Code secret mis à jour : ${data.secretCode}`);
        setSecretCodeInput("");
        fetchTournaments();
      } else {
        setMessage(`❌ Erreur : ${data.error}`);
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Erreur lors de la mise à jour du code secret");
    }
  };

  if (loading) return <p className="text-center mt-20">Chargement...</p>;
  if (!isAdmin) return <p className="text-center mt-20">Accès refusé.</p>;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-6">
      {/* Création tournoi */}
      <div className="bg-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-lg border border-gray-700 mb-8">
        <h1 className="text-3xl font-bold mb-6 text-center">Créer un tournoi</h1>

        <form onSubmit={handleCreateTournament} className="space-y-4">
          <div>
            <label className="block mb-1 font-semibold">Nom du tournoi</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>

          <div>
            <label className="block mb-1 font-semibold">Image (URL)</label>
            <input
              type="text"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-semibold">Date du tournoi</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block mb-1 font-semibold">Heure du tournoi</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block mb-1 font-semibold">Nombre max de participants</label>
            <input
              type="number"
              min={0}
              value={maxParticipants}
              onChange={(e) => setMaxParticipants(Number(e.target.value))}
              className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-semibold transition"
          >
            Créer le tournoi
          </button>
        </form>
      </div>

      {/* Définir le code secret */}
      <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-4 text-center">Définir le code secret</h2>
        <form onSubmit={handleSetSecretCode} className="space-y-4">
          <div>
            <label className="block mb-1 font-semibold">Sélectionner un tournoi</label>
            <select
              value={selectedTournamentId}
              onChange={(e) => setSelectedTournamentId(e.target.value)}
              className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Choisir --</option>
              {tournaments.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1 font-semibold">Code secret</label>
            <input
              type="text"
              value={secretCodeInput}
              onChange={(e) => setSecretCodeInput(e.target.value)}
              className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-semibold transition"
          >
            Mettre à jour le code secret
          </button>
        </form>

        {message && <p className="mt-4 text-center">{message}</p>}
      </div>
    </div>
  );
}
