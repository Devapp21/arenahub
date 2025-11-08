"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { supabase } from "../../../lib/supabaseClient";

type Tournament = {
  id: string;
  name: string;
  description: string;
  image: string;
  date: string;
};

type Participant = {
  user_id: string;
  email: string;
};

export default function TournamentPage() {
  const { id } = useParams();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [message, setMessage] = useState("");

  // 🔹 Récupère les participants depuis la table participants
  const fetchParticipants = async () => {
    const { data, error } = await supabase
      .from("participants")
      .select("user_id, email")
      .eq("tournament_id", id)
      .order("created_at", { ascending: true });

    if (error) console.error(error);
    else setParticipants(data || []);
  };

  // 🔹 Charger le tournoi et les participants
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      // Récupère le tournoi
      const { data: tournamentData, error: tournamentError } = await supabase
        .from("tournaments")
        .select("*")
        .eq("id", id)
        .single();

      if (tournamentError || !tournamentData) {
        console.error(tournamentError);
        setTournament(null);
        setLoading(false);
        return;
      }
      setTournament(tournamentData);

      // Récupère les participants
      await fetchParticipants();

      setLoading(false);
    };

    fetchData();
  }, [id]);

  // 🔹 Inscription au tournoi
  const handleRegister = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !tournament) return;

    // Vérifie si déjà inscrit
    const existing = participants.find(p => p.user_id === user.id);
    if (existing) {
      setMessage("Vous êtes déjà inscrit !");
      setShowConfirm(false);
      return;
    }

    // Ajoute le participant avec email directement
    const { error } = await supabase.from("participants").insert([
      {
        user_id: user.id,
        tournament_id: tournament.id,
        email: user.email
      }
    ]);

    if (error) {
      console.error(error);
      setMessage("Erreur lors de l'inscription.");
    } else {
      setParticipants([...participants, { user_id: user.id, email: user.email || "" }]);
      setMessage("Inscription réussie !");
    }

    setShowConfirm(false);
  };

  if (loading) return <p className="text-center mt-20">Chargement...</p>;
  if (!tournament) return <p className="text-center mt-20">Tournoi introuvable.</p>;

  return (
    <div className="min-h-screen p-8 bg-black text-gray-100 flex flex-col items-center">
      <div className="max-w-3xl w-full flex flex-col items-center gap-6">
        {/* IMAGE */}
        {tournament.image && (
          <div className="relative w-full h-80 rounded-xl overflow-hidden shadow-lg">
            <Image
              src={tournament.image.startsWith("/") ? tournament.image : `/${tournament.image}`}
              alt={tournament.name}
              fill
              className="object-cover"
            />
          </div>
        )}

        {/* INFOS TOURNOI */}
        <h1 className="text-3xl font-bold text-red-500">{tournament.name}</h1>
        <p className="text-gray-200 text-center">{tournament.description}</p>
        <p className="text-gray-400">
          Date : {new Date(tournament.date).toLocaleDateString()}
        </p>
        <p className="text-gray-400">
          Participants : {participants.length}
        </p>

        {message && <p className="text-red-400">{message}</p>}

        {/* BOUTONS */}
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
      </div>

      {/* MODAL CONFIRMATION */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-xl shadow-xl w-80 text-center">
            <h2 className="text-xl font-bold text-red-500 mb-4">Confirmer l’inscription</h2>
            <p className="text-gray-300 mb-6">
              Souhaitez-vous vraiment vous inscrire au tournoi{" "}
              <span className="font-semibold text-red-400">{tournament.name}</span> ?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleRegister}
                className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded"
              >
                Oui
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded"
              >
                Non
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL LISTE PARTICIPANTS */}
      {showParticipants && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-xl shadow-xl w-96 max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-red-500 mb-4">Liste des participants</h2>
            {participants.length > 0 ? (
              <ul className="space-y-2 text-gray-200">
                {participants.map((p) => (
                  <li key={p.user_id} className="border-b border-gray-700 pb-2">
                    {p.email}
                  </li>
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
