import connectMongo from "../../../lib/mongodb";
import TournamentModel from "../../../models/Tournament";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Connecte à MongoDB
    await connectMongo();

    // Récupère tous les tournois, triés par date croissante
    const tournaments = await TournamentModel.find({}).sort({ date: 1 }).lean();

    return NextResponse.json(tournaments);
  } catch (err) {
    console.error("Erreur fetch tournois API :", err);
    return NextResponse.json(
      { error: "Impossible de récupérer les tournois" },
      { status: 500 }
    );
  }
}
