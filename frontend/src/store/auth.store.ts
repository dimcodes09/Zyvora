import { create } from "zustand";
import { User } from "@/types";
import * as AuthService from "@/services/auth.service";

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  fetchMe: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  error: null,

  // ✅ LOGIN
  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const { user } = await AuthService.login(email, password);
      set({ user });
    } catch (err: any) {
      set({ error: err?.message ?? "Login failed" });
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
    } catch (err: any) {
      set({ error: err?.message ?? "Registration failed" });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  // ✅ LOGOUT
  logout: () => {
    AuthService.logout();
    set({ user: null, error: null });
  },

  // ✅ FIXED FETCH ME (NO LOADING LOOP)
  fetchMe: async () => {
    try {
      const user = await AuthService.getMe();
      set({ user });
    } catch {
      set({ user: null });
    }
  },
}));