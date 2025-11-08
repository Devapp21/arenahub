"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "../../lib/supabaseClient";

type Tournament = {
  id: string;
  name: string;
  description: string;
  image: string;
  date: string;
};

type TournamentWithCount = Tournament & {
  participantsCount: number;
};

export default function TournamentsPage() {
  const [tournaments, setTournaments] = useState<TournamentWithCount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTournaments = async () => {
      // 1️⃣ Récupère tous les tournois
      const { data: tournamentsData, error } = await supabase
        .from("tournaments")
        .select("*")
        .order("date", { ascending: true });

      if (error || !tournamentsData) {
        console.error(error);
        setLoading(false);
        return;
      }

      // 2️⃣ Pour chaque tournoi, récupère le nombre de participants
      const tournamentsWithCount: TournamentWithCount[] = await Promise.all(
        tournamentsData.map(async (tournament: Tournament) => {
          const { count } = await supabase
            .from("participants")
            .select("*", { count: "exact", head: true })
            .eq("tournament_id", tournament.id);

          return { ...tournament, participantsCount: count || 0 };
        })
      );

      setTournaments(tournamentsWithCount);
      setLoading(false);
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
            key={t.id}
            href={`/tournaments/${t.id}`}
            className="bg-gray-900 rounded-xl shadow-lg overflow-hidden hover:scale-105 transform transition"
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
            <div className="p-4">
              <h2 className="text-xl font-bold text-gray-200">{t.name}</h2>
              <p className="text-gray-400 text-sm">{t.description}</p>
              <p className="text-gray-400 text-sm mt-2">
                Date : {new Date(t.date).toLocaleDateString()}
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Participants : {t.participantsCount}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
