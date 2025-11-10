import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import User from "@/models/User";
import Tournoi from "@/models/Tournament";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "changeme";

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

  const utilisateurDoc = await User.findOne({ email: decoded.email });
  if (!utilisateurDoc) {
    return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
  }

  const utilisateur: UtilisateurType = {
    _id: utilisateurDoc._id.toString(),
    username: utilisateurDoc.username,
    email: utilisateurDoc.email,
    emailVerified: utilisateurDoc.emailVerified,
  };

  const tournoisDocs = await Tournoi.find({
    participants: utilisateurDoc._id,
  });

  const tournois: TournoiType[] = tournoisDocs.map(t => ({
    _id: t._id.toString(),
    name: t.name,
    secret: t.secret,
  }));

  return NextResponse.json({
    username: utilisateur.username,
    email: utilisateur.email,
    emailVerified: utilisateur.emailVerified,
    tournois,
  });
}
