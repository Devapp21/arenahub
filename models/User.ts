// models/User.ts
import mongoose, { Schema, Document, model } from "mongoose";

export interface IUser extends Document {
  pseudo: string;
  email: string;
  password: string;
  role: string; // <-- ajout ici
}

const UserSchema: Schema = new Schema<IUser>({
  pseudo: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["user", "admin"], default: "user" }, // <-- ajout ici
});

export default mongoose.models.User || model<IUser>("User", UserSchema);
