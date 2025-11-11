// app/api/verify-email/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import User from "@/models/User";

export async function GET(req: NextRequest) {
  try {
    await connectMongo();

    const url = new URL(req.url);
    const token = url.searchParams.get("token");

    if (!token) {
      return NextResponse.json({ message: "Token manquant" }, { status: 400 });
    }

    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      return NextResponse.json({ message: "Token invalide ou expiré" }, { status: 400 });
    }

    user.isVerified = true;
    user.verificationToken = undefined; // supprime le token après validation
    await user.save();

    // Redirection vers une page confirmation ou login
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/login?verified=1`);

  } catch (error) {
    console.error("Erreur lors de la vérification :", error);
    return NextResponse.json(
      { message: "Erreur serveur lors de la vérification" },
      { status: 500 }
    );
  }
}
