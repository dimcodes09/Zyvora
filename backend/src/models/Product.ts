import { Schema, model, Document, Types } from "mongoose";

// ─── INTERFACE ─────────────────────────────────────────

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  category: string;

  stock: number;
  isActive: boolean;

  tags?: string[];
  image?: string;
  reelVideo?: string | null;

  sellerId?: Types.ObjectId; // ✅ NEW (optional for old products)

  // ─── ANALYTICS: unique user tracking ─────────────
  uniqueViewers: Types.ObjectId[];

  createdAt: Date;
  updatedAt: Date;
}

// ─── SCHEMA ────────────────────────────────────────────

const ProductSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name must not exceed 100 characters"],
      index: "text",
    },

    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description must not exceed 500 characters"],
      default: "",
    },

    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price must be a positive number"],
    },

    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
      lowercase: true,
      index: true,
    },

    // ✅ UPDATED STOCK (clean + default)
    stock: {
      type: Number,
      required: true,
      min: [0, "Stock cannot be negative"],
      default: 0,
    },

    // ✅ NEW (seller system)
    sellerId: {
      type: Schema.Types.ObjectId,
      ref: "Seller",
      required: false, // backward compatibility
    },

    // ✅ NEW (soft delete / availability)
    isActive: {
      type: Boolean,
      default: true,
    },

    image: {
      type: String,
      trim: true,
      default: "",
    },

    reelVideo: {
      type: String,
      trim: true,
      default: null,
    },

    tags: [String],

    // ─── ANALYTICS: unique user tracking ─────────────
    uniqueViewers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// ─── INDEXES (PERFORMANCE) ─────────────────────────────

ProductSchema.index({ category: 1, price: 1 });
ProductSchema.index({ sellerId: 1 });
ProductSchema.index({ isActive: 1 });

// ─── EXPORT ────────────────────────────────────────────

export const Product = model<IProduct>("Product", ProductSchema);
