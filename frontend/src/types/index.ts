export interface User {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin";
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  stock: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Cart {
  _id: string;
  items: CartItem[];
  total: number;
}

export interface Order {
  _id: string;

  items: {
    product: {
      _id: string;
      name: string;
      price: number;
    };
    quantity: number;
  }[];

  totalPrice: number; // ✅ FIXED

  status: "pending" | "paid" | "shipped" | "delivered" | "cancelled"; // ✅ FIXED

  paymentMethod: "stripe" | "razorpay";
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}