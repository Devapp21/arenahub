// app/api/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  try {
    await connectMongo();

    const { pseudo, email, password } = await req.json();

    if (!pseudo || !email || !password) {
      return NextResponse.json({ message: "Tous les champs sont requis" }, { status: 400 });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ message: "Cet email est déjà utilisé" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString("hex");

    const newUser = new User({
      pseudo,
      email,
      password: hashedPassword,
      isVerified: false,
      verificationToken,
    });

    await newUser.save();

    // --- Envoi email de vérification ---
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/verify-email?token=${verificationToken}`;

    await transporter.sendMail({
      from: `"TonSite" <${process.env.SMTP_USER}>`,
      to: newUser.email,
      subject: "Confirme ton adresse email",
      html: `<p>Salut ${newUser.pseudo},</p>
             <p>Merci de t'être inscrit ! Clique sur le lien ci-dessous pour valider ton adresse email :</p>
             <a href="${verificationUrl}">Valider mon email</a>`,
    });

    return NextResponse.json(
      { message: "Utilisateur créé avec succès ! Vérifie ton email pour valider ton compte." },
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
