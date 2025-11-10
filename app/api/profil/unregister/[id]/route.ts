import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import ParticipantModel from "@/models/Participant";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "changeme";

// Fonction pour extraire l'ID de l'utilisateur depuis le token
const getUserIdFromToken = (authHeader: string | null) => {
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    return decoded.id;
  } catch (err) {
    return null;
  }
};

export async function DELETE(req: Request, { params }: { params: any }) {
  await connectMongo();

  // ⚠️ await params pour récupérer l'ID dynamique
  const { id: tournamentId } = await params;

  if (!tournamentId) {
    return NextResponse.json({ error: "ID du tournoi non fourni" }, { status: 400 });
  }

  // Récupère l'utilisateur depuis le token
  const authHeader = req.headers.get("Authorization");
  const userId = getUserIdFromToken(authHeader);

  if (!userId) {
    return NextResponse.json({ error: "Utilisateur non authentifié" }, { status: 401 });
  }

  try {
    // Cherche le participant
    const participant = await ParticipantModel.findOne({
      user_id: userId,
      tournament_id: tournamentId,
    });

    if (!participant) {
      return NextResponse.json({ error: "Vous n'êtes pas inscrit à ce tournoi" }, { status: 404 });
    }

    // Supprime l'inscription
    await ParticipantModel.deleteOne({ _id: participant._id });

    return NextResponse.json({ message: "Désinscription réussie" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erreur serveur lors de la désinscription" }, { status: 500 });
  }
}
