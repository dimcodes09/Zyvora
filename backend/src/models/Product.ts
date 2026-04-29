import { Schema, model } from 'mongoose';
import type { Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  tags?: string[];
  image?: string;
  reelVideo?: string | null;        // ← Cloudinary / S3 / any public mp4 URL
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name must not exceed 100 characters'],
      index: 'text',
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description must not exceed 500 characters'],
      default: '',
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price must be a positive number'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      lowercase: true,
      index: true,
    },
    stock: {
      type: Number,
      required: [true, 'Stock is required'],
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    image: {
      type: String,
      trim: true,
      default: '',
    },
    reelVideo: {
      type: String,
      trim: true,
      default: null,         // null = not a reel product
    },
    tags: [String],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

ProductSchema.index({ category: 1, price: 1 });

export const Product = model<IProduct>('Product', ProductSchema);