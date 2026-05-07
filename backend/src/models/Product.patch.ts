// ─────────────────────────────────────────────────────────────
// PRODUCT MODEL UPDATE PATCH
// Add these fields to your existing Product model/schema.
// This is a diff-style reference — merge into your existing file.
// ─────────────────────────────────────────────────────────────

// 1. Import addition (add alongside existing imports):
import mongoose from "mongoose";

// 2. Add to your existing IProduct interface:
interface IProductAdditions {
  sellerId: mongoose.Types.ObjectId;   // required — links product to seller
  stock: number;                        // track inventory
  isActive: boolean;                   // soft-delete / visibility toggle
}

// 3. Add to your existing Schema definition:
const productSchemaAdditions = {
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Seller",
    required: [true, "Seller is required"],
    index: true,
  },
  stock: {
    type: Number,
    required: true,
    default: 0,
    min: [0, "Stock cannot be negative"],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
};

// 4. Migration script for existing products (run once):
// db.products.updateMany(
//   { sellerId: { $exists: false } },
//   { $set: { sellerId: null, stock: 0, isActive: true } }
// )

export type { IProductAdditions };
export { productSchemaAdditions };