import mongoose, { Document, Schema } from "mongoose";

export interface ISeller extends Document {
  name: string;
  phone: string;
  shopName: string;
  location: string;
  gst?: string;
  upiId?: string;
  bankDetails?: {
    accountNumber: string;
    ifsc: string;
    holderName: string;
  };
  isVerified: boolean;
  isActive: boolean;
  role: "seller";
  createdAt: Date;
  updatedAt: Date;
}

const SellerSchema = new Schema<ISeller>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Phone is required"],
      unique: true,
      match: [/^[6-9]\d{9}$/, "Please enter a valid Indian phone number"],
    },
    shopName: {
      type: String,
      required: [true, "Shop name is required"],
      trim: true,
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    gst: {
      type: String,
      trim: true,
      uppercase: true,
    },
    upiId: {
      type: String,
      trim: true,
    },
    bankDetails: {
      accountNumber: String,
      ifsc: String,
      holderName: String,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    role: {
      type: String,
      default: "seller",
      immutable: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ISeller>("Seller", SellerSchema);