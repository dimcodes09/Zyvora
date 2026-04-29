// models/Hamper.ts
import { Schema, model, Types } from "mongoose";

// ─── Types ────────────────────────────────────────────────────────────────────

interface HamperItem {
  productId: Types.ObjectId;
  quantity:  number;
}

export interface IHamper {
  userId:    Types.ObjectId;
  items:     HamperItem[];
  createdAt?: Date;
  updatedAt?: Date;
}

// ─── Sub-schema (no _id needed on items) ─────────────────────────────────────

const hamperItemSchema = new Schema<HamperItem>(
  {
    productId: {
      type:     Schema.Types.ObjectId,
      ref:      "Product",
      required: true,
    },
    quantity: {
      type:     Number,
      required: true,
      min:      [1, "Quantity must be at least 1"],
      default:  1,
    },
  },
  { _id: false }   // keeps the items array lean
);

// ─── Main schema ──────────────────────────────────────────────────────────────

const hamperSchema = new Schema<IHamper>(
  {
    userId: {
      type:     Schema.Types.ObjectId,
      ref:      "User",
      required: true,
      unique:   true,   // one hamper per user
      index:    true,
    },
    items: {
      type:    [hamperItemSchema],
      default: [],
    },
  },
  {
    timestamps: true,   // createdAt + updatedAt
    versionKey: false,
  }
);

// ─── Export ───────────────────────────────────────────────────────────────────

export const Hamper = model<IHamper>("Hamper", hamperSchema);