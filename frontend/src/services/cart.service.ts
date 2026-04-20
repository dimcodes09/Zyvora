import api from "@/lib/axios";
import { ApiResponse, Cart } from "@/types";

export const fetchCart     = async (): Promise<Cart> =>
  (await api.get<ApiResponse<Cart>>("/cart")).data.data;

export const addToCart     = async (productId: string, quantity = 1): Promise<Cart> =>
  (await api.post<ApiResponse<Cart>>("/cart", { productId, quantity })).data.data;

export const updateQuantity = async (productId: string, quantity: number): Promise<Cart> =>
  (await api.patch<ApiResponse<Cart>>(`/cart/${productId}`, { quantity })).data.data;

export const removeFromCart = async (productId: string): Promise<Cart> =>
  (await api.delete<ApiResponse<Cart>>(`/cart/${productId}`)).data.data;

export const clearCart     = async (): Promise<void> =>
  (await api.delete("/cart")).data;