"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";

type Tournament = {
  _id: string;
  name: string;
  description: string;
  image: string;
  date: string;
  maxParticipants?: number;
  secretCode?: string;
};

type Participant = {
  _id: string;
  pseudo?: string;
  email?: string;
  tournament_id: string;
  user_id?: string;
};

export default function TournamentPage() {
  const { id } = useParams();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [message, setMessage] = useState("");
  const [codeMessage, setCodeMessage] = useState("");
  const [countdown, setCountdown] = useState<string | null>(null);
  const [acceptRules, setAcceptRules] = useState(false); // ✅ Nouvelle case à cocher

  // Charger le tournoi et participants depuis l'API
  useEffect(() => {
    if (!id) return;

    const fetchTournament = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/tournaments/${id}`);
        if (!res.ok) throw new Error("Tournoi introuvable");

        const data = await res.json();
        setTournament(data.tournament);
        setParticipants(data.participants);
      } catch (err) {
        console.error(err);
        setTournament(null);
      } finally {
        setLoading(false);
      }
    };

    fetchTournament();
  }, [id]);

  // Compte à rebours dynamique
  useEffect(() => {
    if (!tournament) return;

    const tournamentDate = new Date(tournament.date).getTime();
    const now = new Date().getTime();
    const diffMs = tournamentDate - now;

    if (diffMs <= 0) {
      setCountdown("Le tournoi a déjà commencé !");
      return;
    }

    if (diffMs <= 5 * 60 * 60 * 1000) {
      const interval = setInterval(() => {
        const now = new Date().getTime();
        const remaining = tournamentDate - now;

        if (remaining <= 0) {
          setCountdown("Le tournoi a commencé !");
          clearInterval(interval);
        } else {
          const h = Math.floor(remaining / (1000 * 60 * 60));
          const m = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
          const s = Math.floor((remaining % (1000 * 60)) / 1000);
          setCountdown(`${h}h ${m}m ${s}s`);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [tournament]);

  // Fonction pour s'inscrire
  const handleRegister = async () => {
    if (!tournament) return;

    if (!acceptRules) {
      setMessage("❌ Vous devez accepter les règles pour vous inscrire.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("Vous devez être connecté pour vous inscrire.");
      setShowConfirm(false);
      return;
    }

    try {
      const res = await fetch(`/api/tournaments/${id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (res.ok) {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setParticipants([
          ...participants,
          { ...data.participant, user_id: payload.id },
        ]);
        setMessage("✅ Inscription réussie !");
      } else {
        setMessage(data.error || "Erreur lors de l'inscription");
      }
    } catch (err) {
      console.error(err);
      setMessage("Erreur lors de l'inscription");
    }

    setShowConfirm(false);
    setAcceptRules(false); // ✅ Réinitialiser la checkbox
  };

  // Récupérer l'ID utilisateur courant
  const getCurrentUserId = () => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.id;
    } catch {
      return null;
    }
  };

  // Afficher le code secret
  const handleShowSecret = () => {
    if (!tournament) return;

    const userId = getCurrentUserId();
    const isRegistered = participants.some((p) => p.user_id === userId);

    if (!isRegistered) {
      setCodeMessage("❌ Vous n'êtes pas inscrit à ce tournoi.");
    } else {
      if (tournament.secretCode) {
        setCodeMessage(`🗝️ Code secret  : ${tournament.secretCode}`);
      } else {
        setCodeMessage("⏳ Patiente, jeune soldat. Le code sera bientôt dévoilé !");
      }
    }
  };

  if (loading)
    return <p className="text-center mt-20 text-white">Chargement...</p>;
  if (!tournament)
    return <p className="text-center mt-20 text-white">Tournoi introuvable.</p>;

  return (
    <div className="min-h-screen p-8 bg-black text-gray-100 flex flex-col items-center">
      <div className="max-w-3xl w-full flex flex-col items-center gap-6">
        {tournament.image && (
          <div className="relative w-full h-80 rounded-xl overflow-hidden shadow-lg">
            <Image
              src={
                tournament.image.startsWith("/")
                  ? tournament.image
                  : `/${tournament.image}`
              }
              alt={tournament.name}
              fill
              className="object-cover"
            />
          </div>
        )}

        <h1 className="text-3xl font-bold text-red-500">{tournament.name}</h1>

        <p className="text-gray-200 text-center whitespace-pre-wrap">
          {tournament.description}
        </p>

        <p className="text-gray-400">
          Date : {new Date(tournament.date).toLocaleDateString("fr-FR")} à{" "}
          {new Date(tournament.date).toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>

        {countdown && (
          <p className="text-yellow-400 font-semibold">
            ⏱️ Commence dans : {countdown}
          </p>
        )}

        <p className="text-gray-400">
          Participants : {participants.length} / {tournament.maxParticipants || "∞"}
        </p>

        {message && <p className="text-red-400">{message}</p>}

        <div className="flex gap-4 mt-4">
          <button
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded"
            onClick={() => setShowConfirm(true)}
          >
            S’inscrire à ce tournoi
          </button>

          <button
            className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded"
            onClick={() => setShowParticipants(true)}
          >
            Voir la liste des participants
          </button>
        </div>

        <button
          onClick={handleShowSecret}
          className="mt-4 bg-yellow-600 hover:bg-yellow-700 text-black font-semibold py-1 px-4 rounded text-sm"
        >
          Voir le code secret
        </button>
        {codeMessage && <p className="mt-2 text-yellow-400">{codeMessage}</p>}
      </div>

      {/* Modal inscription */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-xl shadow-xl w-80 text-center">
            <h2 className="text-xl font-bold text-red-500 mb-4">
              Confirmer l’inscription
            </h2>
            <p className="text-gray-300 mb-4">
              Souhaitez-vous vraiment vous inscrire au tournoi{" "}
              <span className="font-semibold text-red-400">{tournament.name}</span> ?
            </p>

           {/* ✅ Checkbox règles centrée */}
<div className="flex justify-center mb-4">
  <label className="flex items-center text-gray-200 cursor-pointer">
    <input
      type="checkbox"
      checked={acceptRules}
      onChange={(e) => setAcceptRules(e.target.checked)}
      className="mr-2"
    />
    <span>
      J’accepte les{" "}
      <a href="/rules" className="text-red-400 underline">
        règles
      </a>
    </span>
  </label>
</div>


            <div className="flex justify-center gap-4">
              <button
                onClick={handleRegister}
                className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded"
              >
                Oui
              </button>
              <button
                onClick={() => {
                  setShowConfirm(false);
                  setAcceptRules(false);
                }}
                className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded"
              >
                Non
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal participants */}
      {showParticipants && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-xl shadow-xl w-96 max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-red-500 mb-4">
              Liste des participants :
            </h2>
            {participants.length > 0 ? (
              <ul className="space-y-2 text-gray-200">
                {participants.map((p) => (
                  <li key={p._id}>{p.pseudo || "Utilisateur inconnu"}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400">Aucun participant pour le moment.</p>
            )}
            <button
              onClick={() => setShowParticipants(false)}
              className="mt-4 w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
