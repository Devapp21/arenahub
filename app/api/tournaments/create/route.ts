import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import TournamentModel from "@/models/Tournament";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "changeme";

export async function POST(req: Request) {
  try {
    await connectMongo();

    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: string };
    } catch {
      return NextResponse.json({ error: "Token invalide" }, { status: 401 });
    }

    if (decoded.role !== "admin") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const { name, description, image, date, maxParticipants } = await req.json();

    // Création du tournoi avec maxParticipants
    const tournament = await TournamentModel.create({
      name,
      description,
      image,
      date: new Date(date),
      maxParticipants: maxParticipants || 0, // <-- sauvegarde dans la base
      createdAt: new Date(),
    });

    return NextResponse.json({ message: "Tournoi créé avec succès !", tournament });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
