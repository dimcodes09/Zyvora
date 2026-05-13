import mongoose, { Document, Schema } from "mongoose";

export interface IGiftMessage extends Document {
  senderId?: string;
  type: "text" | "audio";
  content: string;
  createdAt: Date;
}

const GiftMessageSchema = new Schema<IGiftMessage>(
  {
    senderId: { type: String },
    type: { type: String, enum: ["text", "audio"], required: true },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IGiftMessage>("GiftMessage", GiftMessageSchema);