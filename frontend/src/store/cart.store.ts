import { create } from "zustand";
import { Cart } from "@/types";
import * as CartService from "@/services/cart.service";
import { useAuthStore } from "@/store/auth.store";

interface CartState {
  cart: Cart | null;
  loading: boolean;
  error: string | null;

  fetchCart: () => Promise<void>;
  addToCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  resetCart: () => void;
}

let cartFetchRequestId = 0;

export const useCartStore = create<CartState>((set, get) => {
  const requireUser = () => {
    if (useAuthStore.getState().user) return true;

    cartFetchRequestId += 1;
    set({ cart: null, loading: false, error: null });
    return false;
  };

  return {
    cart: null,
    loading: false,
    error: null,

    fetchCart: async () => {
      if (!requireUser()) return;

      const requestId = ++cartFetchRequestId;

      set({ loading: true, error: null });
      try {
        const cart = await CartService.fetchCart();

        if (requestId === cartFetchRequestId && useAuthStore.getState().user) {
          set({ cart });
        }
      } catch {
        if (requestId === cartFetchRequestId) {
          set({ cart: null, error: null });
        }
      } finally {
        if (requestId === cartFetchRequestId) {
          set({ loading: false });
        }
      }
    },

    addToCart: async (productId: string) => {
      if (!requireUser()) return;

      set({ loading: true, error: null });
      try {
        await CartService.addToCart(productId);
        await get().fetchCart();
      } catch {
        set({ error: "Failed to add item" });
      } finally {
        set({ loading: false });
      }
    },

    updateQuantity: async (productId: string, quantity: number) => {
      if (!requireUser()) return;

      set({ error: null });
      try {
        await CartService.updateQuantity(productId, quantity);
        await get().fetchCart();
      } catch {
        set({ error: "Failed to update quantity" });
      }
    },

    removeFromCart: async (productId: string) => {
      if (!requireUser()) return;

      set({ error: null });
      try {
        await CartService.removeFromCart(productId);
        await get().fetchCart();
      } catch {
        set({ error: "Failed to remove item" });
      }
    },

clearCart: async () => {
  if (!requireUser()) return;

  set({ error: null });
  try {
    await CartService.clearCart();

    // ✅ DIRECT RESET instead of refetch
    set({
  cart: {
    items: [],
    subtotal: 0,
  },
});
  } catch {
    set({ error: "Failed to clear cart" });
  }
},
    resetCart: () => {
      cartFetchRequestId += 1;
      set({ cart: null, error: null, loading: false });
    },
  };
});
