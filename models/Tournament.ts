import mongoose, { Schema, model, models } from "mongoose";

const TournamentSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  image: { type: String },
  date: { type: Date, required: true },
  maxParticipants: { type: Number, default: 0 },
  secretCode: { type: String, default: "" }, // champ existant
  podium: {
    first: { type: String, default: null },
    second: { type: String, default: null },
    third: { type: String, default: null },
  },
});

const TournamentModel = models.Tournament || model("Tournament", TournamentSchema);
export default TournamentModel;

