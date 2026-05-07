import { Schema, model, Document, Types } from "mongoose";

// ─── TYPES ───────────────────────────────────────────────

export type OrderStatus =
  | "pending"
  | "paid"
  | "accepted"
  | "packed"
  | "shipped"
  | "delivered"
  | "cancelled";

export type DeliveryType = "self" | "partner";
export type PaymentMethod = "razorpay" | "cod" | "stripe";

// ─── ITEM INTERFACE ──────────────────────────────────────

export interface IOrderItem {
  product: Types.ObjectId;
  quantity: number;
  priceAtPurchase: number;
  name: string; // snapshot
}

// ─── MAIN ORDER INTERFACE ────────────────────────────────

export interface IOrder extends Document {
  user: Types.ObjectId;
  seller?: Types.ObjectId; // seller orders only; legacy/admin products may not have one

  items: IOrderItem[];

  totalPrice: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;

  deliveryType: DeliveryType;
  deliveryAddress?: string;
  notes?: string;

  // Stripe
  stripeSessionId?: string;
  stripePaymentIntentId?: string;

  // Razorpay
  razorpayOrderId?: string;
  razorpayPaymentId?: string;

  createdAt: Date;
  updatedAt: Date;
}

// ─── ITEM SCHEMA ─────────────────────────────────────────

const OrderItemSchema = new Schema<IOrderItem>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, "Quantity must be at least 1"],
    },
    priceAtPurchase: {
      type: Number,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

// ─── MAIN SCHEMA ─────────────────────────────────────────

const OrderSchema = new Schema<IOrder>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // ✅ NEW (SELLER SUPPORT)
    seller: {
      type: Schema.Types.ObjectId,
      ref: "Seller",
    },

    items: {
      type: [OrderItemSchema],
      required: true,
      validate: {
        validator: (v: IOrderItem[]) => v.length > 0,
        message: "Order must contain at least one item",
      },
    },

    totalPrice: {
      type: Number,
      required: true,
      min: [0, "Total price must be positive"],
    },

    status: {
      type: String,
      enum: [
        "pending",
        "paid",
        "accepted",
        "packed",
        "shipped",
        "delivered",
        "cancelled",
      ],
      default: "pending",
    },

    paymentMethod: {
      type: String,
      enum: ["razorpay", "cod", "stripe"],
      default: "razorpay",
    },

    // ✅ DELIVERY SYSTEM
    deliveryType: {
      type: String,
      enum: ["self", "partner"],
      default: "self",
    },

    deliveryAddress: {
      type: String,
      trim: true,
    },

    notes: {
      type: String,
      trim: true,
    },

    // ─── PAYMENTS (KEEP YOUR EXISTING) ─────────────

    stripeSessionId: {
      type: String,
      sparse: true,
      index: true,
    },

    stripePaymentIntentId: {
      type: String,
      sparse: true,
    },

    razorpayOrderId: {
      type: String,
      sparse: true,
      index: true,
    },

    razorpayPaymentId: {
      type: String,
      sparse: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// ─── INDEXES (IMPORTANT FOR PERFORMANCE) ───────────────

OrderSchema.index({ seller: 1, createdAt: -1 });
OrderSchema.index({ user: 1, createdAt: -1 });
OrderSchema.index({ status: 1 });

// ─── EXPORT ───────────────────────────────────────────

export const Order = model<IOrder>("Order", OrderSchema);
