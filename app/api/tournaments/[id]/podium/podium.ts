// app/api/tournaments/[id]/podium/route.ts
import connectMongo from "@/lib/mongodb";
import Tournament from "@/models/Tournaments";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "replace_me";

export async function PATCH(req: Request, context: { params: { id: string } }) {
  try {
    await connectMongo();

    const tournamentId = context.params.id;
    if (!tournamentId) {
      return NextResponse.json({ error: "Tournoi ID manquant" }, { status: 400 });
    }

    // Vérifier token admin
    const authHeader = req.headers.get("authorization");
    if (!authHeader) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const token = authHeader.split(" ")[1];
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
      if (!decoded || decoded.role !== "admin") {
        return NextResponse.json({ error: "Accès admin requis" }, { status: 403 });
      }
    } catch {
      return NextResponse.json({ error: "Token invalide" }, { status: 401 });
    }

    const body = await req.json();
    const { first, second, third } = body;
    if (!first || !second || !third) {
      return NextResponse.json({ error: "first/second/third requis" }, { status: 400 });
    }

    if (first === second || first === third || second === third) {
      return NextResponse.json({ error: "Les trois gagnants doivent être différents" }, { status: 400 });
    }

    const update = {
      podium: { first, second, third, updatedAt: new Date() },
    };

    const result = await Tournament.findByIdAndUpdate(
      tournamentId,
      update,
      { new: true }
    );

    if (!result) return NextResponse.json({ error: "Tournoi introuvable" }, { status: 404 });

    return NextResponse.json({ message: "Podium mis à jour", podium: result.podium }, { status: 200 });
  } catch (err) {
    console.error("Erreur mise à jour podium :", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
