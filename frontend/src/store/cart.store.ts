import { create } from "zustand";
import { Cart } from "@/types";
import * as CartService from "@/services/cart.service";

interface CartState {
  cart: Cart | null;
  loading: boolean;
  error: string | null;

  fetchCart: () => Promise<void>;
  addToCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

export const useCartStore = create<CartState>((set) => ({
  cart: null,
  loading: false,
  error: null,

  fetchCart: async () => {
    set({ loading: true, error: null });
    try {
      const cart = await CartService.fetchCart();
      set({ cart });
    } catch {
      set({ error: "Failed to fetch cart" });
    } finally {
      set({ loading: false });
    }
  },

addToCart: async (productId: string) => {
  set({ loading: true, error: null });
  try {
    await CartService.addToCart(productId);

    // 🔥 ALWAYS REFETCH (IMPORTANT)
    const cart = await CartService.fetchCart();

    set({ cart });
  } catch {
    set({ error: "Failed to add item" });
  } finally {
    set({ loading: false });
  }
},
  updateQuantity: async (productId: string, quantity: number) => {
    try {
      const cart = await CartService.updateQuantity(productId, quantity);
      set({ cart });
    } catch {
      set({ error: "Failed to update quantity" });
    }
  },

  removeFromCart: async (productId: string) => {
    try {
      const cart = await CartService.removeFromCart(productId);
      set({ cart });
    } catch {
      set({ error: "Failed to remove item" });
    }
  },

  clearCart: async () => {
    try {
      await CartService.clearCart();
      set({ cart: null });
    } catch {
      set({ error: "Failed to clear cart" });
    }
  },
}));