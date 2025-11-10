import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import TournamentModel from "@/models/Tournament";

export async function GET() {
  try {
    await connectMongo();
    console.log("✅ Connecté à MongoDB (tous les tournois)");

    const tournaments = await TournamentModel.find({}).sort({ date: 1 }).lean();
    console.log("Tournois récupérés :", tournaments.length);

    return NextResponse.json(tournaments);
  } catch (err: any) {
    console.error("Erreur fetch tournois API :", err);
    return NextResponse.json(
      { error: err.message, name: err.name, stack: err.stack },
      { status: 500 }
    );
  }
}
