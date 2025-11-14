// app/api/tournaments/route.ts
import connectMongo from "@/lib/mongodb";
import Tournament from "@/models/Tournaments";
import Participant from "@/models/Participant";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectMongo();

    const tournaments = await Tournament.find().sort({ date: 1 });

    return NextResponse.json(tournaments, { status: 200 });
  } catch (err) {
    console.error("Erreur fetch tournois :", err);
    return NextResponse.json({ error: "Impossible de récupérer les tournois" }, { status: 500 });
  }
}
