// /pages/api/tournaments/[id]/podium.ts
import type { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "replace_me";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (!id || typeof id !== "string") return res.status(400).json({ error: "Missing tournament id" });

  if (req.method !== "PATCH") return res.status(405).json({ error: "Method not allowed" });

  // Vérifier token admin (Header Authorization: Bearer <token>)
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Non autorisé" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    if (!decoded || decoded.role !== "admin") {
      return res.status(403).json({ error: "Accès admin requis" });
    }
  } catch (err) {
    return res.status(401).json({ error: "Token invalide" });
  }

  const { first, second, third } = req.body;
  if (!first || !second || !third) {
    return res.status(400).json({ error: "first/second/third requis" });
  }

  if (first === second || first === third || second === third) {
    return res.status(400).json({ error: "Les trois gagnants doivent être différents" });
  }

  try {
    const client = await clientPromise;
    const db = client.db();

    const update = {
      $set: {
        podium: {
          first,
          second,
          third,
          updatedAt: new Date(),
        },
      },
    };

    const result = await db.collection("tournaments").updateOne(
      { _id: new ObjectId(id) },
      update
    );

    if (result.matchedCount === 0) return res.status(404).json({ error: "Tournoi introuvable" });

    return res.status(200).json({ message: "Podium mis à jour", podium: update.$set.podium });
  } catch (err) {
    console.error("Error updating podium:", err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
}
