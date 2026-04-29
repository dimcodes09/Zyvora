export interface User {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "user";
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  image?: string;   // single URL from backend (optional — may be empty string)
  category: string;
  stock: number;
  createdAt?: string;
updatedAt?: string;
reelVideo?: string | null;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Cart {
  _id?: string;
  items: CartItem[];
  subtotal: number;
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