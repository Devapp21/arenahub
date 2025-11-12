// app/api/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectMongo from "../../../lib/mongodb";
import User from "../../../models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "changeme";

export async function POST(req: NextRequest) {
  try {
    // 🔹 Connexion à MongoDB
    await connectMongo();

    // 🔹 Récupération des données envoyées
    const { pseudo, email, password } = await req.json();
    console.log("📩 Données reçues du front :", { pseudo, email, password });

    // 🔹 Vérification des champs
    if (!pseudo || !email || !password) {
      return NextResponse.json(
        { message: "Tous les champs sont requis" },
        { status: 400 }
      );
    }

    // 🔹 Vérification si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: "Cet email est déjà utilisé" },
        { status: 400 }
      );
    }

    // 🔹 Hash du mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // 🔹 Création de l'utilisateur
    const newUser = new User({
      pseudo,
      email,
      password: hashedPassword,
    });
    await newUser.save();

    // 🔹 Génération du token JWT
    const token = jwt.sign(
      { id: newUser._id, pseudo: newUser.pseudo, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 🔹 Retourne le token et les infos utilisateur
    return NextResponse.json(
      {
        message: "Utilisateur créé et connecté avec succès !",
        token,
        user: { username: newUser.pseudo, email: newUser.email }
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("Erreur lors de l'inscription :", error);
    return NextResponse.json(
      { message: "Erreur serveur lors de l'inscription" },
      { status: 500 }
    );
  }
}
