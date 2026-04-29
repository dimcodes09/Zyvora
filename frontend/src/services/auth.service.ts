import api from "@/lib/axios";
import Cookies from "js-cookie";
import { ApiResponse, User } from "@/types";

interface AuthResponse {
  user: User;
  token: string;
}

// ── helper: backend returns `id`, frontend needs `_id` ──
interface RawAuthUser {
  id: string;
  name: string;
  email: string;
  role?: "user" | "admin";
}

const normalizeUser = (raw: RawAuthUser): User => ({
  _id: raw.id,
  name: raw.name,
  email: raw.email,
  role: raw.role ?? "user",
});

const setAuthToken = (token: string): void => {
  if (typeof window === "undefined") return;

  Cookies.set("token", token, {
    expires: 7,
    sameSite: "strict",
  });

  api.defaults.headers.common.Authorization = `Bearer ${token}`;
};

const clearAuthToken = (): void => {
  if (typeof window === "undefined") return;

  Cookies.remove("token");
  delete api.defaults.headers.common.Authorization;
};

// ✅ LOGIN
export const login = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  const { data } = await api.post<
    ApiResponse<{ token: string; user: RawAuthUser }>
  >("/auth/login", { email, password });

  setAuthToken(data.data.token);

  return {
    token: data.data.token,
    user: normalizeUser(data.data.user),
  };
};

// ✅ REGISTER
export const register = async (
  name: string,
  email: string,
  password: string
): Promise<AuthResponse> => {
  const { data } = await api.post<
    ApiResponse<{ token: string; user: RawAuthUser }>
  >("/auth/register", { name, email, password });

  setAuthToken(data.data.token);

  return {
    token: data.data.token,
    user: normalizeUser(data.data.user),
  };
};

// ✅ LOGOUT
export const logout = (): void => {
  clearAuthToken();
};

// ✅ GET CURRENT USER
// /auth/me returns raw mongo doc with `_id` already — no mapping needed
export const getMe = async (): Promise<User> => {
  const { data } = await api.get<ApiResponse<User>>("/auth/me");
  return data.data;
};
