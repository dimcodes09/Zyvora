import axios from "axios";
import Cookies from "js-cookie";

const getApiOrigin = () => {
  // Always prefer the explicit env variable (set in Vercel dashboard / .env.local)
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/?$/, "");
  }
  // Fallback for local development only
  return "http://localhost:5000";
};

const api = axios.create({
  baseURL: `${getApiOrigin()}/api`,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  config.baseURL = `${getApiOrigin()}/api`;

  if (typeof window !== "undefined") {
    const token = Cookies.get("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (typeof window !== "undefined" && error?.response?.status === 401) {
      Cookies.remove("token");
    }

    return Promise.reject(
      error?.response?.data || { message: "Something went wrong" }
    );
  }
);

export default api;
