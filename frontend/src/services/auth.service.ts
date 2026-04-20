import api from "@/lib/axios";
import Cookies from "js-cookie";
import { ApiResponse, User } from "@/types";

interface AuthResponse {
  user: User;
  token: string;
}

// ✅ LOGIN
export const login = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  const { data } = await api.post<ApiResponse<AuthResponse>>(
    "/auth/login",
    { email, password }
  );

  if (typeof window !== "undefined") {
    Cookies.set("token", data.data.token, {
      expires: 7,
      sameSite: "strict",
    });
  }

  return data.data;
};

// ✅ REGISTER
export const register = async (
  name: string,
  email: string,
  password: string
): Promise<AuthResponse> => {
  const { data } = await api.post<ApiResponse<AuthResponse>>(
    "/auth/register",
    { name, email, password }
  );

  if (typeof window !== "undefined") {
    Cookies.set("token", data.data.token, {
      expires: 7,
      sameSite: "strict",
    });
  }

  return data.data;
};

// ✅ LOGOUT
export const logout = (): void => {
  if (typeof window !== "undefined") {
    Cookies.remove("token");
  }
};

// ✅ GET CURRENT USER
export const getMe = async (): Promise<User> => {
  const { data } = await api.get<ApiResponse<User>>("/auth/me");
  return data.data;
};