import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import User from "@/models/User";
import Tournoi from "@/models/Tournament";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "changeme";

export async function GET(request: Request) {
  await connectMongo();

  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Token manquant" }, { status: 401 });
  }

  const token = authHeader.split(" ")[1];

  let decoded: { email: string };
  try {
    decoded = jwt.verify(token, JWT_SECRET) as { email: string };
  } catch {
    return NextResponse.json({ error: "Token invalide" }, { status: 401 });
  }

  // 🔹 Récupérer l'utilisateur
  const userDoc = await User.findOne({ email: decoded.email }).exec();
  if (!userDoc) {
    return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
  }

  const user: any = userDoc; // cast "any" pour Turbopack

  // 🔹 Récupérer les tournois auxquels il participe
  const tournamentsDocs = await Tournoi.find({ participants: user._id }).exec();

  const tournaments = tournamentsDocs.map((t: any) => ({
    _id: t._id.toString(),
    name: t.name,
    secret: t.secret,
  }));

  return NextResponse.json({
    user: {
      username: user.pseudo, // maintenant TS accepte
      email: user.email,
    },
    tournaments,
  });
}
