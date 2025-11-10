// lib/mongodb.ts
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://okitodevapp_db_user:<Warzonehub94>@arenahub.m6cyjpn.mongodb.net/?appName=arenahub";

if (!MONGODB_URI) {
  throw new Error("⚠️ MONGODB_URI n'est pas défini dans les variables d'environnement !");
}

let isConnected = false;

const connectMongo = async () => {
  if (isConnected) return;

  try {
    await mongoose.connect(MONGODB_URI);
    isConnected = true;
    console.log("✅ Connecté à MongoDB");
  } catch (error) {
    console.error("❌ Erreur de connexion MongoDB :", error);
  }
};

export default connectMongo;

