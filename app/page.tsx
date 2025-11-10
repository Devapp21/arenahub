"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, PanInfo } from "framer-motion";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Tournament = {
  _id: string;
  title: string;
  image: string;
};

export default function HomePage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const res = await fetch("/api/tournaments");
        if (!res.ok) throw new Error("Erreur fetch tournois");
        const data = await res.json();
        setTournaments(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchTournaments();
  }, []);

  if (!tournaments.length)
    return <p className="text-center mt-20 text-white">Chargement...</p>;

  // Carrousel infini
  const prev = () =>
    setCurrent((prev) => (prev - 1 + tournaments.length) % tournaments.length);
  const next = () => setCurrent((prev) => (prev + 1) % tournaments.length);

  // Swipe tactile
  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x < -50) next();
    if (info.offset.x > 50) prev();
  };

  return (
   <div className="flex flex-col items-center justify-center min-h-screen bg-black p-8">
      {/* Nouveau titre principal */}
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="text-5xl font-bold text-red-500 text-center drop-shadow-lg mb-8"
      >
        Les Tournois 
      </motion.h1>

      {/* Desktop */}
      <div className="hidden md:flex relative w-[900px] h-[400px] gap-4 overflow-hidden">
        {tournaments.map((t, index) => (
          <Link key={t._id} href={`/tournaments/${t._id}`}>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="relative w-[280px] h-[350px] flex-shrink-0 rounded-xl overflow-hidden shadow-lg"
            >
              <Image src={t.image} alt={t.title} fill className="object-cover z-0" />
              {/* Retiré overlay du nom */}
            </motion.div>
          </Link>
        ))}
      </div>
      {/* Mobile */}
      <div className="md:hidden relative w-full max-w-md overflow-hidden">
        <motion.div
          className="flex"
          drag="x"
          dragElastic={0.2}
          onDragEnd={handleDragEnd}
          animate={{ x: `-${current * 100}%` }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {tournaments.map((t, index) => (
            <Link
              key={t._id}
              href={`/tournaments/${t._id}`}
              className="relative w-full flex-shrink-0 h-[350px] rounded-xl overflow-hidden shadow-lg"
            >
              <motion.div
                animate={{ scale: index === current ? 1.05 : 0.95 }}
                className="w-full h-full"
              >
                <Image src={t.image} alt={t.title} fill className="object-cover z-0" />
              </motion.div>
            </Link>
          ))}
        </motion.div>

        {/* Flèches */}
        <button
          onClick={prev}
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full z-20"
        >
          <ChevronLeft size={28} />
        </button>
        <button
          onClick={next}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full z-20"
        >
          <ChevronRight size={28} />
        </button>
      </div>
    </div>
  );
}
