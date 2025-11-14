// app/api/tournaments/[id]/participants/route.ts
import connectMongo from "@/lib/mongodb";
import Participant from "@/models/Participant";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await connectMongo();

    // ✅ await pour "déballer" le params Promise
    const { id: tournamentId } = await context.params;

    if (!tournamentId) {
      return NextResponse.json({ error: "Tournoi ID manquant" }, { status: 400 });
    }

    const participants = await Participant.find({ tournament_id: tournamentId });

    const participantsWithPseudo = await Promise.all(
      participants.map(async (p) => {
        const user = await User.findById(p.user_id).select("pseudo");
        return {
          _id: p._id,
          pseudo: user?.pseudo || "Inconnu",
        };
      })
    );

    return NextResponse.json(participantsWithPseudo, { status: 200 });
  } catch (err) {
    console.error("Erreur fetch participants :", err);
    return NextResponse.json({ error: "Impossible de récupérer les participants" }, { status: 500 });
  }
}
