// src/lib/hamperApi.ts

const _raw = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/api\/?$/, "");

const BASE = `${_raw}/api`;

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

// ─── Auth ─────────────────────────────────────────

const getToken = (): string => {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("token") || "";
};

/** Returns auth headers or null when no token (guest user). Never throws. */
const authHeaders = (): Record<string, string> | null => {
  const token = getToken();
  if (!token) return null;
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

// ─── API ─────────────────────────────────────────

/**
 * Fetch the current user's hamper.
 * Returns null silently when the user is not authenticated.
 */
export async function fetchHamper(): Promise<HamperResponse | null> {
  const headers = authHeaders();
  if (!headers) return null; // guest — no error, just empty

  const res = await fetch(`${BASE}/hamper`, { method: "GET", headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `GET /api/hamper failed (${res.status})`);
  }

  return res.json();
}

/**
 * Persist hamper items to the backend.
 * Returns null silently when the user is not authenticated.
 */
export async function saveHamper(
  items: HamperItemPayload[]
): Promise<HamperResponse | null> {
  const headers = authHeaders();
  if (!headers) return null; // guest — nothing to save

  const res = await fetch(`${BASE}/hamper`, {
    method: "POST",
    headers,
    body: JSON.stringify({ items }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `POST /api/hamper failed (${res.status})`);
  }

  return res.json();
}