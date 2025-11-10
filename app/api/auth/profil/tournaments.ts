import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import ParticipantModel from "@/models/Participant";
import TournamentModel from "@/models/Tournament";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "changeme";

export async function GET(req: Request) {
  try {
    await connectMongo();
    const authHeader = req.headers.get("authorization");
    if (!authHeader) return NextResponse.json({ tournaments: [] });

    const token = authHeader.split(" ")[1];
    if (!token) return NextResponse.json({ tournaments: [] });

    const decoded: any = jwt.verify(token, JWT_SECRET);

    // Récupère les tournois auxquels l'utilisateur est inscrit
    const participantEntries = await ParticipantModel.find({ user_id: decoded.id });
    const tournamentIds = participantEntries.map((p) => p.tournament_id);
    const tournaments = await TournamentModel.find({ _id: { $in: tournamentIds } });

    return NextResponse.json({ tournaments });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ tournaments: [] });
  }
}
