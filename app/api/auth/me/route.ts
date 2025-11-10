import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectMongo from "@/lib/mongodb";
import User from "@/models/User";
import Tournament from "@/models/Tournament";

export async function GET(req: Request) {
  await connectMongo();

  // 🔹 Récupération du token (depuis les cookies)
  const token = req.headers.get("authorization")?.replace("Bearer ", "");

  if (!token) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const user = await User.findById(decoded.id).lean();

    if (!user) {
      return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
    }

    // Optionnel : récupérer les tournois auxquels il est inscrit
    const tournaments = await Tournament.find({ participants: user._id }).lean();

    return NextResponse.json({
      username: user.username,
      email: user.email,
      tournaments,
    });
  } catch (err) {
    return NextResponse.json({ error: "Token invalide" }, { status: 401 });
  }
}
