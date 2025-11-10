import mongoose, { Schema, model, models } from "mongoose";

const TournamentSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  image: { type: String },
  date: { type: Date, required: true },
  maxParticipants: { type: Number, default: 0 },
  secretCode: { type: String, default: "" } // <- nouveau champ
});

const TournamentModel = models.Tournament || model("Tournament", TournamentSchema);
export default TournamentModel;
