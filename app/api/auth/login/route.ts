import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import UserModel from "@/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "changeme";

// POST : endpoint réel pour le login
export async function POST(req: Request) {
  try {
    await connectMongo();
    const { identifier, password } = await req.json();

    const user = await UserModel.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });

    if (!user) {
      return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return NextResponse.json({ error: "Mot de passe incorrect" }, { status: 401 });
    }

    const token = jwt.sign(
  { id: user._id, role: user.role, pseudo: user.pseudo, email: user.email },
  JWT_SECRET,
  { expiresIn: "7d" }
);


    return NextResponse.json({
      token,
      user: { username: user.username, email: user.email },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// GET : uniquement pour test dans le navigateur
export async function GET(req: Request) {
  return NextResponse.json({ message: "La route /api/auth/login fonctionne ! ✅" });
}
