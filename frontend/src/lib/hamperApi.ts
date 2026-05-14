import api from "./axios";
import Cookies from "js-cookie";

// ─── Types ─────────────────────────────────────────

export interface HamperItemPayload {
  productId: string;
  quantity: number;
}

export interface HamperResponse {
  success: boolean;
  message?: string;
  data: {
    userId: string;
    items: Array<{
      productId:
        | {
            _id: string;
            name: string;
            price: number;
            image: string;
            category: string;
          }
        | string;
      quantity: number;
    }>;
    updatedAt: string | null;
  };
}

// ─── API ─────────────────────────────────────────

/**
 * Fetch the current user's hamper.
 * Returns null silently when the user is not authenticated.
 */
export async function fetchHamper(): Promise<HamperResponse | null> {
  const token =
    Cookies.get("token") ||
    (typeof window !== "undefined" ? localStorage.getItem("token") : null);

  if (!token) return null; // guest — no error, just empty

  try {
    const res = await api.get("/hamper");
    return res.data;
  } catch (err: any) {
    throw new Error(err?.message || `GET /api/hamper failed`);
  }
}

/**
 * Persist hamper items to the backend.
 * Returns null silently when the user is not authenticated.
 */
export async function saveHamper(
  items: HamperItemPayload[]
): Promise<HamperResponse | null> {
  const token =
    Cookies.get("token") ||
    (typeof window !== "undefined" ? localStorage.getItem("token") : null);

  if (!token) return null; // guest — nothing to save

  try {
    const res = await api.post("/hamper", { items });
    return res.data;
  } catch (err: any) {
    throw new Error(err?.message || `POST /api/hamper failed`);
  }
}