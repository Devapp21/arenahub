// app/api/auth/me/route.ts
import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import User from "@/models/User";
import Tournament from "@/models/Tournament";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "changeme";

export async function GET(request: Request) {
  await connectMongo();

  // Récupérer le token JWT depuis l'en-tête Authorization
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Token manquant" }, { status: 401 });
  }

  const token = authHeader.split(" ")[1];

  let decoded: { email: string };
  try {
    decoded = jwt.verify(token, JWT_SECRET) as { email: string };
  } catch (err) {
    return NextResponse.json({ error: "Token invalide" }, { status: 401 });
  }

  // Récupérer l'utilisateur correspondant dans MongoDB
  const user = await User.findOne({ email: decoded.email }).lean();
  if (!user) {
    return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
  }

  // Récupérer les tournois auxquels l'utilisateur participe
  const tournaments = await Tournament.find({ participants: user._id }).lean();

  // Retourner les informations
  return NextResponse.json({
    username: user.username,
    email: user.email,
    emailVerified: user.emailVerified,
    tournaments: tournaments.map((t) => ({
      _id: t._id,
      name: t.name,
      secret: t.secret,
    })),
  });
}
