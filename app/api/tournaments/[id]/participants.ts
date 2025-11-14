// /pages/api/tournaments/[id]/participants.ts
import type { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (!id || typeof id !== "string") return res.status(400).json({ error: "Missing tournament id" });

  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  try {
    const client = await clientPromise;
    const db = client.db();
    // participants documents have user_id and tournamentId (adapt if noms diffèrent)
    const participants = await db
      .collection("participants")
      .find({ tournamentId: id })
      .toArray();

    // Fetch user infos for each participant (user_id is assumed to be Mongo ObjectId string)
    const userIds = participants.map((p) => {
      try { return new ObjectId(p.user_id); } catch { return null; }
    }).filter(Boolean);

    const users = userIds.length
      ? await db
          .collection("users")
          .find({ _id: { $in: userIds } })
          .project({ username: 1, email: 1 })
          .toArray()
      : [];

    // Map participants with user info
    const results = participants.map((p) => {
      const uid = (() => {
        try { return p.user_id.toString(); } catch { return p.user_id; }
      })();
      const user = users.find((u) => u._id.toString() === uid);
      return {
        participantId: p._id,
        user_id: p.user_id,
        username: user?.username || user?.pseudo || "Utilisateur inconnu",
        email: user?.email || null,
      };
    });

    return res.status(200).json(results);
  } catch (err) {
    console.error("Error fetching participants:", err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
}
