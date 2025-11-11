// models/User.ts
import mongoose, { Schema, Document, model } from "mongoose";

export interface IUser extends Document {
  pseudo: string;
  email: string;
  password: string;
  role: string;               // admin ou user
  isVerified: boolean;        // pour savoir si l'email est validé
  verificationToken?: string; // token unique pour la validation email
}

const UserSchema: Schema = new Schema<IUser>({
  pseudo: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  isVerified: { type: Boolean, default: false },   // utilisateur non vérifié par défaut
  verificationToken: { type: String },            // token temporaire pour la vérification
});

export default mongoose.models.User || model<IUser>("User", UserSchema);
