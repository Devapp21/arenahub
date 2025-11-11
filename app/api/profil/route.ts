import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import User from "@/models/User";
import TournamentModel from "@/models/Tournament";
import ParticipantModel from "@/models/Participant";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "changeme";

export async function GET(request: Request) {
  await connectMongo();

  // 🔹 Vérifier le token dans l'en-tête Authorization
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Token manquant" }, { status: 401 });
  }

  const token = authHeader.split(" ")[1];

  let decoded: { id: string; pseudo: string; role: string };
  try {
    // 🔹 Décoder le token
    decoded = jwt.verify(token, JWT_SECRET) as { id: string; pseudo: string; role: string };
  } catch {
    return NextResponse.json({ error: "Token invalide" }, { status: 401 });
  }

  // 🔹 Récupérer l'utilisateur via l'ID du token
  const userDoc = await User.findById(decoded.id).exec();
  if (!userDoc) {
    return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
  }

  const user: any = userDoc; // cast pour Turbopack

  // 🔹 Récupérer les tournois auxquels l'utilisateur est inscrit via Participant
  const participantDocs = await ParticipantModel.find({ user_id: user._id }).lean();

  const tournamentIds = participantDocs.map((p: any) => p.tournament_id);

  const tournamentsDocs = await TournamentModel.find({ _id: { $in: tournamentIds } }).lean();

  const tournaments = tournamentsDocs.map((t: any) => ({
    _id: t._id.toString(),
    name: t.name,
    description: t.description,
    date: t.date,
    secret: t.secretCode,
  }));

  // 🔹 Retourner le profil et les tournois
  return NextResponse.json({
    user: {
      username: user.pseudo,
      email: user.email,
    },
    tournaments,
  });
}
