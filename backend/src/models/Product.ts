import mongoose from "mongoose";

export interface IProduct {
  name: string;
  price: number;
  category?: string;
  description?: string;
  stock?: number;
  image?: string;
}

const productSchema = new mongoose.Schema<IProduct>(
  {
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    category: String,
    description: String,
    stock: {
      type: Number,
      default: 0,
    },
    image: String,
  },
  { timestamps: true }
);

const Product = mongoose.model<IProduct>("Product", productSchema);

export default Product;