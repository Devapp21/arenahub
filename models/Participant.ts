// models/Participant.ts
import mongoose, { Schema, Document, model } from "mongoose";

export interface IParticipant extends Document {
  user_id: mongoose.Schema.Types.ObjectId; // référence à User
  tournament_id: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

const ParticipantSchema: Schema = new Schema<IParticipant>(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    tournament_id: { type: String, required: true },
    email: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Participant || model<IParticipant>("Participant", ParticipantSchema);
