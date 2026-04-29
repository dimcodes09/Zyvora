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

const authHeaders = (): Record<string, string> => {
  const token = getToken();

  if (!token) {
    throw new Error("User not authenticated. No token found.");
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

// ─── API ─────────────────────────────────────────

export async function fetchHamper(): Promise<HamperResponse> {
  const res = await fetch(`${BASE}/hamper`, {
    method: "GET",
    headers: authHeaders(),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `GET /api/hamper failed (${res.status})`);
  }

  return res.json();
}

export async function saveHamper(
  items: HamperItemPayload[]
): Promise<HamperResponse> {
  const res = await fetch(`${BASE}/hamper`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ items }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `POST /api/hamper failed (${res.status})`);
  }

  return res.json();
}