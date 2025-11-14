"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

type Tournament = {
  _id: string;
  name: string;
  description: string;
  image: string;
  date: string;
  podium?: {
    first?: string | null;
    second?: string | null;
    third?: string | null;
  };
};

export default function ChampionsPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const res = await fetch("/api/tournaments");
        const data = await res.json();
        setTournaments(data);
        console.log("Tournois récupérés :", data);
      } catch (err) {
        console.error("Erreur fetch tournois :", err);
      }
    };

    fetchTournaments();
  }, []);

  return (
    <div className="p-6 text-white">
      <h1 className="text-3xl font-bold mb-6 uppercase">Champions</h1>

      <div className="space-y-4">
        {tournaments.map((t) => (
          <div
            key={t._id}
            onClick={() => setSelectedTournament(t)}
            className="cursor-pointer bg-gray-900 p-4 rounded-lg border border-gray-700 hover:border-red-500 hover:bg-gray-800 transition flex justify-between items-center"
          >
            <span className="text-lg font-semibold">{t.name}</span>
            <span className="text-red-400 text-sm">Voir le podium →</span>
          </div>
        ))}
      </div>

      {/* Modal */}
      {selectedTournament && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-lg w-96 relative border border-red-500 shadow-xl">

            {/* Close button */}
            <button
              className="absolute top-3 right-3 text-gray-300 hover:text-white"
              onClick={() => setSelectedTournament(null)}
            >
              <X size={24} />
            </button>

            <h2 className="text-2xl font-bold text-center mb-4">
              {selectedTournament.name}
            </h2>

            <div className="space-y-3">
              {["first", "second", "third"].map((pos, idx) => {
                const name = selectedTournament.podium?.[pos as keyof typeof selectedTournament.podium];
                if (!name) return null;
                const medal = idx === 0 ? "🥇" : idx === 1 ? "🥈" : "🥉";
                return (
                  <div
                    key={pos}
                    className="bg-gray-800 rounded p-3 flex justify-between items-center border border-gray-700"
                  >
                    <span>{medal} <strong>{name}</strong></span>
                    <span className="text-gray-400">#{idx + 1}</span>
                  </div>
                );
              })}
              {!selectedTournament.podium?.first &&
                !selectedTournament.podium?.second &&
                !selectedTournament.podium?.third && (
                  <p className="text-gray-400 text-center">Aucun podium défini pour ce tournoi.</p>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
