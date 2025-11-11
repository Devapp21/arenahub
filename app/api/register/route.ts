// app/api/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectMongo from "../../../lib/mongodb";
import User from "../../../models/User";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    // 🔹 Connexion à MongoDB
    await connectMongo();

    // 🔹 Récupération des données envoyées
    const { pseudo, email, password } = await req.json();

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

    return NextResponse.json(
      { message: "Utilisateur créé avec succès !" },
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
