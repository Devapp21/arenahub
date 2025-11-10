// scripts/testMongoConnection.ts
import mongoose from "mongoose";
import TournamentModel from "../models/Tournament";
import dotenv from "dotenv";
dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) throw new Error("MONGO_URI non défini !");

(async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connecté à MongoDB");

    const tournaments = await TournamentModel.find({});
    console.log("Tournois :", tournaments);

    process.exit(0);
  } catch (err) {
    console.error("Erreur :", err);
    process.exit(1);
  }
})();
