import { Schema, model, Types } from "mongoose";
import type { Request } from "express";

// ─── Types ─────────────────────────────────────────

interface HamperItem {
  productId: Types.ObjectId;
  quantity: number;
}

export interface IHamper {
  userId: Types.ObjectId;
  items: HamperItem[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AuthRequest extends Request {
  userId: string;
  role?: string;
}

// ─── Item Schema ───────────────────────────────────

const hamperItemSchema = new Schema<HamperItem>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, "Quantity must be at least 1"],
      default: 1,
    },
  },
  { _id: false }
);

// ─── Main Schema ───────────────────────────────────

const hamperSchema = new Schema<IHamper>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    items: {
      type: [hamperItemSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// ─── Model ─────────────────────────────────────────

export const Hamper = model<IHamper>("Hamper", hamperSchema);