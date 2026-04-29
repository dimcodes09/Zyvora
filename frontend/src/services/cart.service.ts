import api from "@/lib/axios";
import { ApiResponse, Cart } from "@/types";

const mapCart = (data: any): Cart => ({
  items: data.items ?? [],
  subtotal: data.subtotal ?? 0, // ✅ CRITICAL FIX
});

export const fetchCart = async (): Promise<Cart> => {
  const res = await api.get<ApiResponse<any>>("/cart");
  return mapCart(res.data.data);
};

export const addToCart = async (
  productId: string,
  quantity = 1
): Promise<Cart> => {
  const res = await api.post<ApiResponse<any>>("/cart", {
    productId,
    quantity,
  });
  return mapCart(res.data.data);
};

export const updateQuantity = async (
  productId: string,
  quantity: number
): Promise<Cart> => {
  const res = await api.patch<ApiResponse<any>>(
    `/cart/${productId}`,
    { quantity }
  );
  return mapCart(res.data.data);
};

export const removeFromCart = async (
  productId: string
): Promise<Cart> => {
  const res = await api.delete<ApiResponse<any>>(
    `/cart/${productId}`
  );
  return mapCart(res.data.data);
};

export const clearCart = async (): Promise<Cart> => {
  const res = await api.delete<ApiResponse<any>>("/cart");
  return mapCart(res.data.data);
};