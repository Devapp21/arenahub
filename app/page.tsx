"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-black text-white flex flex-col items-center justify-center px-6 md:px-12">
      
      {/* Image de fond responsive */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/images/warzone7.jpg" // <-- remplace par ton image
          alt="Fond Warzone Arena"
          fill
          className="object-cover object-center opacity-40"
        />
      </div>

      {/* Texte principal */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="text-center max-w-4xl"
      >
        <h1 className="text-4xl md:text-6xl font-bold text-red-500 mb-6 drop-shadow-lg">
          Bienvenue sur Warzone Arena
        </h1>

        <p className="text-lg md:text-2xl text-gray-200 mb-4">
          Le site spécialisé dans les tournois Warzone et Black Ops 7.
          Participez à nos tournois multijoueurs et tentez de remporter de nombreux cadeaux et lots exclusifs !
        </p>

        <p className="text-lg md:text-2xl text-gray-200 mb-8">
          Le prochain tournoi pour le titre de champion W-ARENA de la semaine aura lieu le <strong>28 novembre à 20h00</strong>.
          N'attendez plus et inscrivez-vous dès maintenant pour tenter votre chance ! Et de remporter 100€ de carte cadeau !
        </p>

        {/* Bouton / Image cliquable */}
        <Link href="/tournaments" className="inline-block mt-4">
          <Image
            src="/images/warzone7.jpg" // <-- image CTA
            alt="Inscrivez-vous au tournoi"
            width={400} // plus grande sur desktop
            height={150}
            className="cursor-pointer hover:scale-105 transition-transform rounded-lg shadow-lg"
          />
        </Link>
      </motion.div>
    </div>
  );
}

