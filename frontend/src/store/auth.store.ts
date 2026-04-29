import { create } from "zustand";
import { User } from "@/types";
import * as AuthService from "@/services/auth.service";
import { useCartStore } from "@/store/cart.store";

interface AuthState {
  user: User | null;
  loading: boolean;
  hydrated: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  fetchMe: () => Promise<void>;
}

const getErrorMessage = (err: unknown, fallback: string): string => {
  if (err instanceof Error) return err.message;

  if (
    typeof err === "object" &&
    err !== null &&
    "message" in err &&
    typeof err.message === "string"
  ) {
    return err.message;
  }

  return fallback;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  hydrated: false,
  error: null,

  // ✅ LOGIN
  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const { user } = await AuthService.login(email, password);

      set({ user });

      // 🔥 sync cart immediately after login
      const { fetchCart } = useCartStore.getState();
      await fetchCart();
    } catch (err: unknown) {
      set({ error: getErrorMessage(err, "Login failed") });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  // ✅ REGISTER
  register: async (name, email, password) => {
    set({ loading: true, error: null });
    try {
      const { user } = await AuthService.register(name, email, password);

      set({ user });

      // 🔥 sync cart after register
      const { fetchCart } = useCartStore.getState();
      await fetchCart();
    } catch (err: unknown) {
      set({ error: getErrorMessage(err, "Registration failed") });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  // ✅ LOGOUT — uses resetCart (local-only, no API call)
  logout: () => {
    AuthService.logout();

    set({ user: null, error: null, hydrated: true });

    // 🔥 local reset — avoids 401 from calling DELETE /api/cart after token removal
    const { resetCart } = useCartStore.getState();
    resetCart();
  },

  // ✅ FETCH CURRENT USER (on app load)
  fetchMe: async () => {
    try {
      const user = await AuthService.getMe();
      set({ user });

      const { fetchCart } = useCartStore.getState();
      await fetchCart();

      set({ hydrated: true });
    } catch {
      set({ user: null, hydrated: true });

      const { resetCart } = useCartStore.getState();
      resetCart();
    }
  },
}));