// Exemple : app/api/tournaments/[id]/set-podium/route.ts
import connectMongo from "@/lib/mongodb";
import Tournament from "@/models/Tournament";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  context: any
) {
  const { id: tournamentId } = await context.params; // ✅ il faut await
  if (!tournamentId) {
    return NextResponse.json({ error: "Tournoi ID manquant" }, { status: 400 });
  }

  try {
    await connectMongo();

    const body = await req.json();
    const { first, second, third } = body;

    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      return NextResponse.json({ error: "Tournoi introuvable" }, { status: 404 });
    }

    tournament.podium = { first, second, third };
    await tournament.save();

    return NextResponse.json({ message: "Podium enregistré !", podium: tournament.podium }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Impossible d'enregistrer le podium" }, { status: 500 });
  }
}
