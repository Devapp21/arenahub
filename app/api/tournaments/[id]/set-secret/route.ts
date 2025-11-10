import { NextResponse } from "next/server";
import TournamentModel from "@models/Tournament";
import connectMongo from "@lib/mongodb";

import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "changeme";

export async function PATCH(request: Request, { params }: { params: any }) {
  await connectMongo();

  const { id } = await params;
  if (!id) return NextResponse.json({ error: "ID non fourni" }, { status: 400 });

  const authHeader = request.headers.get("authorization");
  if (!authHeader) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const token = authHeader.replace("Bearer ", "");
  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: string };
  } catch {
    return NextResponse.json({ error: "Token invalide" }, { status: 401 });
  }

  // Vérifier que c’est un admin
  if (decoded.role !== "admin") {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const body = await request.json();
  const { secretCode } = body;
  if (!secretCode) return NextResponse.json({ error: "Code secret manquant" }, { status: 400 });

  const tournament = await TournamentModel.findByIdAndUpdate(
    id,
    { secretCode },
    { new: true }
  );

  if (!tournament) return NextResponse.json({ error: "Tournoi introuvable" }, { status: 404 });

  return NextResponse.json({ message: "Code secret mis à jour !", secretCode: tournament.secretCode });
}
