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
  podium?: {
    first?: string;
    second?: string;
    third?: string;
  };
};

type Participant = {
  _id: string;
  pseudo: string;
};

export default function AdminPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Création tournoi
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [maxParticipants, setMaxParticipants] = useState(0);

  // Gestion code secret
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTournamentId, setSelectedTournamentId] = useState("");
  const [secretCodeInput, setSecretCodeInput] = useState("");

  // Gestion podium
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [first, setFirst] = useState("");
  const [second, setSecond] = useState("");
  const [third, setThird] = useState("");

  const [message, setMessage] = useState("");

  // Décoder le token JWT côté client
  function decodeToken(token: string) {
    try {
      const payload = token.split(".")[1];
      return JSON.parse(atob(payload));
    } catch {
      return null;
    }
  }

  // Vérifier rôle admin et charger tournois
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return router.push("/login");

    const decoded = decodeToken(token);
    if (!decoded) return router.push("/login");
    if (decoded.role === "admin") setIsAdmin(true);
    else router.push("/");

    setLoading(false);
    fetchTournaments();
  }, [router]);

  // Fetch tournois
  const fetchTournaments = async () => {
    try {
      const res = await fetch("/api/tournaments");
      const data = await res.json();
      setTournaments(data);
      console.log("Tournois récupérés :", data);
    } catch (err) {
      console.error(err);
    }
  };

  // Créer un tournoi
  const handleCreateTournament = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    const token = localStorage.getItem("token");
    if (!token) return setMessage("Non autorisé");

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
        date: `${date}T${time}`,
        maxParticipants,
      }),
    });

    const data = await res.json();
    if (res.ok) {
      setMessage("✅ Tournoi créé !");
      setName(""); setDescription(""); setImage(""); setDate(""); setTime(""); setMaxParticipants(0);
      fetchTournaments();
    } else setMessage(`❌ Erreur : ${data.error || "Impossible de créer le tournoi"}`);
  };

  // Définir code secret
  const handleSetSecretCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (!selectedTournamentId || !secretCodeInput) return setMessage("Sélectionnez un tournoi et entrez le code secret.");

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
      } else setMessage(`❌ Erreur : ${data.error}`);
    } catch (err) {
      console.error(err);
      setMessage("❌ Erreur lors de la mise à jour du code secret");
    }
  };

  // Fetch participants d’un tournoi
  const fetchParticipants = async (tournamentId: string) => {
    if (!tournamentId) return setParticipants([]);
    try {
      const res = await fetch(`/api/tournaments/${tournamentId}/participants`);
      const data = await res.json();
      setParticipants(data);
      console.log("Participants du tournoi :", data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleTournamentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTournamentId(e.target.value);
    setFirst(""); setSecond(""); setThird("");
    fetchParticipants(e.target.value);
  };

  // Enregistrer podium
  const handleSetPodium = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    if (!selectedTournamentId || !first) return setMessage("Le premier doit être défini.");

    const token = localStorage.getItem("token");
    if (!token) return setMessage("Non autorisé");

    try {
      const res = await fetch(`/api/tournaments/${selectedTournamentId}/set-podium`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ first, second, third }),
      });
      const data = await res.json();
      if (res.ok) setMessage("✅ Podium enregistré !");
      else setMessage(`❌ Erreur : ${data.error}`);
    } catch (err) {
      console.error(err);
      setMessage("❌ Erreur lors de l'enregistrement du podium");
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
          <input type="text" placeholder="Nom" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 rounded bg-gray-700" required />
          <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} className="w-full p-2 rounded bg-gray-700"></textarea>
          <input type="text" placeholder="Image URL" value={image} onChange={e => setImage(e.target.value)} className="w-full p-2 rounded bg-gray-700" />
          <div className="grid grid-cols-2 gap-4">
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="p-2 rounded bg-gray-700" required />
            <input type="time" value={time} onChange={e => setTime(e.target.value)} className="p-2 rounded bg-gray-700" required />
          </div>
          <input type="number" min={0} placeholder="Max participants" value={maxParticipants} onChange={e => setMaxParticipants(Number(e.target.value))} className="w-full p-2 rounded bg-gray-700" />
          <button type="submit" className="w-full bg-blue-600 py-2 rounded mt-2">Créer</button>
        </form>
      </div>

      {/* Code secret */}
      <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 w-full max-w-lg mb-8">
        <h2 className="text-2xl font-bold mb-4 text-center">Définir le code secret</h2>
        <form onSubmit={handleSetSecretCode} className="space-y-4">
          <select value={selectedTournamentId} onChange={handleTournamentChange} className="w-full p-2 rounded bg-gray-700">
            <option value="">-- Choisir un tournoi --</option>
            {tournaments.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
          </select>
          <input type="text" placeholder="Code secret" value={secretCodeInput} onChange={e => setSecretCodeInput(e.target.value)} className="w-full p-2 rounded bg-gray-700" />
          <button type="submit" className="w-full bg-blue-600 py-2 rounded mt-2">Mettre à jour</button>
        </form>
      </div>

      {/* Podium */}
      {selectedTournamentId && (
        <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 w-full max-w-lg">
          <h2 className="text-2xl font-bold mb-4 text-center">Définir le podium</h2>
          <form onSubmit={handleSetPodium} className="space-y-4">
            <select value={first} onChange={e => setFirst(e.target.value)} className="w-full p-2 rounded bg-gray-700" required>
              <option value="">-- 1er --</option>
              {participants.map(p => <option key={p._id} value={p.pseudo}>{p.pseudo}</option>)}
            </select>
            <select value={second} onChange={e => setSecond(e.target.value)} className="w-full p-2 rounded bg-gray-700">
              <option value="">-- 2ème --</option>
              {participants.map(p => <option key={p._id} value={p.pseudo}>{p.pseudo}</option>)}
            </select>
            <select value={third} onChange={e => setThird(e.target.value)} className="w-full p-2 rounded bg-gray-700">
              <option value="">-- 3ème --</option>
              {participants.map(p => <option key={p._id} value={p.pseudo}>{p.pseudo}</option>)}
            </select>
            <button type="submit" className="w-full bg-blue-600 py-2 rounded mt-2">Enregistrer le podium</button>
          </form>
        </div>
      )}

      {message && <p className="mt-4 text-center">{message}</p>}
    </div>
  );
}
