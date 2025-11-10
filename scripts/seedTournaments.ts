// scripts/seedTournaments.ts
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import TournamentModel from "../models/Tournament.js"; // .js car Node ESM compile TS en JS

dotenv.config();

// Pour __dirname en ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MONGO_URI = process.env.MONGODB_URI;

if (!MONGO_URI) {
  throw new Error("MONGODB_URI non défini dans .env");
}

const seedTournaments = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connecté à MongoDB.");

    // Supprime les anciens tournois
    await TournamentModel.deleteMany({});

    // Tournois à créer
    const tournaments = [
      {
        name: "Tournoi d'été",
        description: "Tournoi d'été avec des matchs passionnants.",
        image: "/images/tournoi1.jpg",
        date: new Date("2025-06-20"),
      },
      {
        name: "Tournoi d'automne",
        description: "Tournoi d'automne pour les compétiteurs aguerris.",
        image: "/images/tournoi2.jpg",
        date: new Date("2025-09-15"),
      },
      {
        name: "Tournoi d'hiver",
        description: "Tournoi d'hiver, préparez-vous au grand défi !",
        image: "/images/tournoi3.jpg",
        date: new Date("2025-12-10"),
      },
    ];

    await TournamentModel.insertMany(tournaments);

    console.log("Tournois insérés avec succès !");
    process.exit(0);
  } catch (err) {
    console.error("Erreur lors de l'insertion :", err);
    process.exit(1);
  }
};

seedTournaments();
