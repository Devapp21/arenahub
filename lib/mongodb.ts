// lib/mongodb.ts
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("⚠️ La variable d'environnement MONGODB_URI est manquante.");
}

// Cache global pour éviter les multiples connexions en dev
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function connectMongo() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI!, { // <-- ajouter le "!" pour dire à TS que ce n'est jamais undefined
        dbName: "arenahub",
      })
      .then((mongoose) => {
        console.log("✅ Connecté à MongoDB");
        return mongoose;
      })
      .catch((err) => {
        console.error("❌ Erreur de connexion MongoDB :", err);
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default connectMongo;
