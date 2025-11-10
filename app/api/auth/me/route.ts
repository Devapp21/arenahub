// app/api/auth/me/route.ts
import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import User from "@/models/User";
import Tournoi from "@/models/Tournoi";
import jwt from "jsonwebtoken";

// Clé secrète pour le JWT
const JWT_SECRET = process.env.JWT_SECRET || "changeme";

// Typage des objets retournés
type UtilisateurType = {
  _id: string;
  username: string;
  email: string;
  emailVerified: boolean;
};

type TournoiType = {
  _id: string;
  name: string;
  secret: string;
};

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
  } catch {
    return NextResponse.json({ error: "Token invalide" }, { status: 401 });
  }

  // Récupérer l'utilisateur correspondant dans MongoDB
  const utilisateur = await User.findOne({ email: decoded.email }).lean<UtilisateurType>();
  if (!utilisateur) {
    return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
  }

  // Récupérer les tournois auxquels l'utilisateur participe
  const tournois = await Tournoi.find({ participants: utilisateur._id }).lean<TournoiType[]>();

  // Retourner les informations
  return NextResponse.json({
    username: utilisateur.username,
    email: utilisateur.email,
    emailVerified: utilisateur.emailVerified,
    tournois: tournois.map((t) => ({
      _id: t._id,
      name: t.name,
      secret: t.secret,
    })),
  });
}
