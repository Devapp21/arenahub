import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import UserModel from "@/models/User";
import ParticipantModel from "@/models/Participant";
import TournamentModel from "@/models/Tournament";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "changeme";

// Fonction pour récupérer l'ID de l'utilisateur depuis le token
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

export async function GET(req: Request) {
  await connectMongo();

  const authHeader = req.headers.get("Authorization");
  const userId = getUserIdFromToken(authHeader);

  if (!userId) {
    return NextResponse.json({ error: "Utilisateur non authentifié" }, { status: 401 });
  }

  try {
    // Récupère l'utilisateur
    const user = await UserModel.findById(userId).lean();
    if (!user) {
      return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
    }

    // Récupère les tournois auxquels l'utilisateur est inscrit
    const participants = await ParticipantModel.find({ user_id: userId }).lean();
    const tournamentIds = participants.map((p) => p.tournament_id);

    const tournaments = await TournamentModel.find({ _id: { $in: tournamentIds } }).lean();

    return NextResponse.json({
      user: {
        username: user.pseudo, // prend le pseudo
        email: user.email,
      },
      tournaments,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
