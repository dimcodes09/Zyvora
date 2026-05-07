import axios from "axios";
import Cookies from "js-cookie";

const getApiOrigin = () => {
  if (typeof window !== "undefined" && window.location.hostname === "localhost") {
    return "http://localhost:5000";
  }

  return (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(
    /\/api\/?$/,
    ""
  );
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
