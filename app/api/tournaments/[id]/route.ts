import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import TournamentModel from "@/models/Tournament";
import ParticipantModel from "@/models/Participant";
import UserModel from "@/models/User";
import { ObjectId } from "mongodb";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "changeme";

// --- GET : tournoi et participants ---
export async function GET(req: Request, { params }: { params: any }) {
  try {
    await connectMongo();
    console.log("✅ Connecté à MongoDB (tournoi spécifique)");

    const { id } = await params;
    if (!id) return NextResponse.json({ error: "ID non fourni" }, { status: 400 });

    let objectId: ObjectId;
    try { objectId = new ObjectId(id); }
    catch { return NextResponse.json({ error: "ID invalide" }, { status: 400 }); }

    const tournament = await TournamentModel.findById(objectId).lean();
    if (!tournament) return NextResponse.json({ error: "Tournoi introuvable" }, { status: 404 });

    const participantsRaw = await ParticipantModel.find({ tournament_id: id })
      .populate("user_id", "pseudo email")
      .lean();

    const participants = participantsRaw.map((p: any) => ({
      _id: p._id,
      pseudo: p.user_id ? p.user_id.pseudo : "Utilisateur inconnu",
      email: p.user_id ? p.user_id.email : "",
      tournament_id: p.tournament_id,
      user_id: p.user_id?._id.toString(),
    }));

    return NextResponse.json({
      tournament: { ...tournament, participantsCount: participants.length },
      participants,
    });

  } catch (err: any) {
    console.error("Erreur GET tournoi :", err);
    return NextResponse.json({ error: err.message, name: err.name, stack: err.stack }, { status: 500 });
  }
}

// --- POST : inscription participant ---
export async function POST(req: Request, { params }: { params: any }) {
  try {
    await connectMongo();

    const { id } = await params;
    if (!id) return NextResponse.json({ error: "ID non fourni" }, { status: 400 });

    const authHeader = req.headers.get("authorization");
    if (!authHeader) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const token = authHeader.replace("Bearer ", "");
    let decoded;
    try { decoded = jwt.verify(token, JWT_SECRET) as { id: string }; }
    catch { return NextResponse.json({ error: "Token invalide" }, { status: 401 }); }

    const user = await UserModel.findById(decoded.id);
    if (!user) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });

    const tournament = await TournamentModel.findById(id);
    if (!tournament) return NextResponse.json({ error: "Tournoi introuvable" }, { status: 404 });

    if (new Date(tournament.date) < new Date())
      return NextResponse.json({ error: "Les inscriptions sont closes, tournoi déjà passé" }, { status: 400 });

    const participantsCount = await ParticipantModel.countDocuments({ tournament_id: id });
    if (tournament.maxParticipants && participantsCount >= tournament.maxParticipants)
      return NextResponse.json({ error: "Le tournoi est complet" }, { status: 400 });

    const alreadyRegistered = await ParticipantModel.findOne({ tournament_id: id, user_id: decoded.id });
    if (alreadyRegistered) return NextResponse.json({ error: "Vous êtes déjà inscrit à ce tournoi" }, { status: 400 });

    const participant = await ParticipantModel.create({
      tournament_id: id,
      user_id: decoded.id,
      email: user.email,
      createdAt: new Date(),
    });

    return NextResponse.json({
      message: "Inscription réussie !",
      participant: { _id: participant._id, pseudo: user.pseudo, email: user.email, tournament_id: participant.tournament_id },
    });

  } catch (err: any) {
    console.error("Erreur POST tournoi :", err);
    return NextResponse.json({ error: err.message, name: err.name, stack: err.stack }, { status: 500 });
  }
}
