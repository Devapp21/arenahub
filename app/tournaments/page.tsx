"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

type Tournament = {
  _id: string;
  name: string;
  description: string;
  image: string;
  date: string;
};

export default function TournamentsPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const res = await fetch("/api/tournaments");
        const data = await res.json();
        setTournaments(data);
      } catch (err) {
        console.error("Erreur fetch tournois :", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTournaments();
  }, []);

  if (loading) return <p className="text-center mt-20">Chargement...</p>;
  if (tournaments.length === 0) return <p className="text-center mt-20">Aucun tournoi disponible.</p>;

  return (
    <div className="min-h-screen p-8 bg-black text-gray-100 flex flex-col items-center">
      <h1 className="text-3xl font-bold text-red-500 mb-8">Tournois disponibles</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl">
        {tournaments.map((t) => (
          <Link
            key={t._id}
            href={`/tournaments/${t._id}`}
            className="bg-gray-900 rounded-xl shadow-lg overflow-hidden hover:scale-105 transform transition flex flex-col h-full"
          >
            {t.image && (
              <div className="relative w-full h-56">
                <Image
                  src={t.image.startsWith("/") ? t.image : `/${t.image}`}
                  alt={t.name}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="p-4 flex flex-col flex-1">
              <h2 className="text-xl font-bold text-gray-200">{t.name}</h2>
              {/* Description avec hauteur fixe et tronquée */}
              <p className="text-gray-400 text-sm flex-1 overflow-hidden line-clamp-3">
                {t.description || "Aucune description disponible."}
              </p>
              <p className="text-gray-400 text-sm mt-2">
                Date : {new Date(t.date).toLocaleDateString()}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
