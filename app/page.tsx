"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

type Tournament = {
  id: string; // UUID depuis Supabase
  title: string;
  image: string;
};

export default function HomePage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [current, setCurrent] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Récupérer les tournois depuis Supabase
  useEffect(() => {
    const fetchTournaments = async () => {
      const { data, error } = await supabase.from("tournaments").select("*");
      if (error) {
        console.error("Erreur fetch tournois:", error);
      } else {
        // On map pour ne garder que l'id, title et image
        const mapped = data.map((t: any) => ({
          id: t.id,
          title: t.title,
          image: t.image,
        }));
        setTournaments(mapped);
      }
    };
    fetchTournaments();
  }, []);

  const handlePrev = () => {
    if (!tournaments.length) return;
    const newIndex = current === 0 ? tournaments.length - 1 : current - 1;
    setCurrent(newIndex);
    scrollToCurrent(newIndex);
  };

  const handleNext = () => {
    if (!tournaments.length) return;
    const newIndex = (current + 1) % tournaments.length;
    setCurrent(newIndex);
    scrollToCurrent(newIndex);
  };

  const scrollToCurrent = (index: number) => {
    if (containerRef.current) {
      const child = containerRef.current.children[index] as HTMLElement;
      if (child) {
        containerRef.current.scrollTo({
          left: child.offsetLeft - 20,
          behavior: "smooth",
        });
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black p-8">
      <h2 className="text-4xl font-bold mb-8 text-red-500 text-center">
        Bienvenue sur ArenaHub
      </h2>

      {/* --- Desktop : Carrousel horizontal draggable --- */}
      <div className="hidden md:block relative w-[900px] h-[400px] overflow-hidden">
        <motion.div className="flex gap-4 cursor-grab" drag="x" dragConstraints={{ left: -500, right: 0 }}>
          {tournaments.map((t) => (
            <Link
              key={t.id}
              href={`/tournaments/${t.id}`}
              className="relative w-[280px] h-[350px] rounded-xl overflow-hidden shadow-lg flex-shrink-0 group"
            >
              <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.3 }} className="w-full h-full">
                <Image src={t.image} alt={t.title} fill className="object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                  <p className="text-white text-lg font-semibold">{t.title}</p>
                </div>
              </motion.div>
            </Link>
          ))}
        </motion.div>
      </div>

      {/* --- Mobile : Scroll horizontal avec image active mise en avant --- */}
      <div className="md:hidden relative w-full max-w-md overflow-hidden">
        <div ref={containerRef} className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth">
          {tournaments.map((t, index) => (
            <Link
              key={t.id}
              href={`/tournaments/${t.id}`}
              className="relative w-[280px] h-[350px] flex-shrink-0 rounded-xl overflow-hidden shadow-lg"
            >
              <motion.div
                animate={{ scale: index === current ? 1.1 : 0.9 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full"
              >
                <Image src={t.image} alt={t.title} fill className="object-cover" />
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-4 text-center">
                  <p className="text-white text-lg font-semibold">{t.title}</p>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>

        {/* Boutons de navigation */}
        <button
          onClick={handlePrev}
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full"
        >
          <ChevronLeft size={28} />
        </button>
        <button
          onClick={handleNext}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full"
        >
          <ChevronRight size={28} />
        </button>
      </div>
    </div>
  );
}
