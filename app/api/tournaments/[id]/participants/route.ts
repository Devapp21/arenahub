// app/api/tournaments/[id]/participants/route.ts
import connectMongo from "@/lib/mongodb";
import Participant from "@/models/Participant";
import User from "@/models/User"; // pour récupérer le pseudo
import { NextResponse } from "next/server";

export async function GET(req: Request, context: { params: any }) {
  try {
    await connectMongo();

    // ✅ Déballer params qui est un Promise
    const params = await context.params;
    const tournamentId = params.id;

    if (!tournamentId) {
      return NextResponse.json({ error: "Tournoi ID manquant" }, { status: 400 });
    }

    // Récupérer tous les participants pour ce tournoi
    const participants = await Participant.find({ tournament_id: tournamentId });

    // Ajouter le pseudo depuis la collection User
    const participantsWithPseudo = await Promise.all(
      participants.map(async (p) => {
        const user = await User.findById(p.user_id).select("pseudo");
        return {
          _id: p._id,
          pseudo: user?.pseudo || "Inconnu",
        };
      })
    );

    console.log("Participants trouvés :", participantsWithPseudo);

    return NextResponse.json(participantsWithPseudo, { status: 200 });
  } catch (err) {
    console.error("Erreur fetch participants :", err);
    return NextResponse.json({ error: "Impossible de récupérer les participants" }, { status: 500 });
  }
}
