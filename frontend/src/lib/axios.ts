import axios from "axios";
import Cookies from "js-cookie";

// 🔥 normalize base URL
const raw = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000")
  .replace(/\/api\/?$/, "");

const api = axios.create({
  baseURL: `${raw}/api`, // ✅ ALWAYS ensures /api is present
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// ✅ Attach token safely
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = Cookies.get("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// ✅ Response handler
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (typeof window !== "undefined") {
      if (error?.response?.status === 401) {
        Cookies.remove("token");
      }
    }

    return Promise.reject(
      error?.response?.data || { message: "Something went wrong" }
    );
  }
);

export default api;