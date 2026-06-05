// 📁 frontend/src/services/sellerApi.ts
// All seller API calls. Automatically attaches Bearer token.

const getBaseUrl = () => {
  if (typeof window !== "undefined" && window.location.hostname === "localhost") {
    return "http://localhost:5000";
  }

  return (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(
    /\/api\/?$/,
    ""
  );
};

// ─── Token helpers ────────────────────────────────────────────────────────────
export const getSellerToken = (): string | null =>
  typeof window !== "undefined" ? localStorage.getItem("sellerToken") : null;

export const setSellerToken = (token: string): void =>
  localStorage.setItem("sellerToken", token);

export const clearSellerToken = (): void =>
  localStorage.removeItem("sellerToken");

// ─── Base fetch (auto-attaches JWT) ──────────────────────────────────────────
const sellerFetch = async <T = Record<string, unknown>>(
  path: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = getSellerToken();

  const res = await fetch(`${getBaseUrl()}/api/seller${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(options.headers as Record<string, string>),
    },
    ...options,
  });

  const data = (await res.json()) as T;
  if (!res.ok) {
    const msg =
      typeof data === "object" && data !== null && "message" in data
        ? String((data as Record<string, unknown>).message)
        : "Something went wrong";
    throw new Error(msg);
  }
  return data;
};

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface SellerAuthResponse {
  token: string;
  seller: {
    id: string;
    name: string;
    shopName: string;
    isVerified: boolean;
  };
  needsRegistration?: boolean;
}

/** Step 1 — send OTP to phone number */
export const sendOTP = (phone: string) =>
  sellerFetch<{ message: string }>("/send-otp", {
    method: "POST",
    body: JSON.stringify({ phone }),
  });

/** Step 2a — verify OTP to log in existing seller */
export const verifyOTP = (phone: string, otp: string) =>
  sellerFetch<SellerAuthResponse>("/verify-otp", {
    method: "POST",
    body: JSON.stringify({ phone, otp }),
  });

/** Step 2b — verify OTP + register new seller */
export const registerSeller = (data: {
  phone: string;
  otp: string;
  name: string;
  shopName: string;
  location: string;
  gst?: string;
  upiId?: string;
}) =>
  sellerFetch<SellerAuthResponse>("/register", {
    method: "POST",
    body: JSON.stringify(data),
  });

// ─── Profile ─────────────────────────────────────────────────────────────────

export interface SellerProfile {
  id: string;
  name: string;
  shopName: string;
  phone: string;
  location?: string;
  gst?: string;
  upiId?: string;
  isVerified: boolean;
}

export const getProfile = () => sellerFetch<{ seller: SellerProfile }>("/profile");

export const updateProfile = (data: Record<string, unknown>) =>
  sellerFetch<{ seller: SellerProfile }>("/profile", {
    method: "PATCH",
    body: JSON.stringify(data),
  });

// ─── Dashboard ───────────────────────────────────────────────────────────────

export interface DashboardStats {
  todaysOrders: number;
  todayRevenue: number;
  totalProducts: number;
  totalEarnings: number;
  lowStockProducts: number;
  outOfStockProducts: number;
}

export interface LowStockItem {
  id: string;
  name: string;
  stock: number;
}

export interface DashboardResponse {
  stats: DashboardStats;
  lowStock: LowStockItem[];
}

export const getDashboard = () => sellerFetch<DashboardResponse>("/dashboard");

// ─── Products ────────────────────────────────────────────────────────────────

export interface SellerProduct {
  _id: string;
  name: string;
  price: number;
  stock: number;
  category?: string;
  image?: string;
  isActive: boolean;
}

export interface ProductsResponse {
  products: SellerProduct[];
  total?: number;
}

export const getProducts = (page = 1, limit = 20) =>
  sellerFetch<ProductsResponse>(`/products?page=${page}&limit=${limit}`);

/** Supports both JSON (no image) and FormData (with image) */
export const addProduct = async (
  data: FormData | Record<string, unknown>
): Promise<{ product: SellerProduct }> => {
  if (data instanceof FormData) {
    const token = getSellerToken();
    // Do NOT set Content-Type for FormData — browser adds boundary automatically
    const r = await fetch(`${getBaseUrl()}/api/seller/products`, {
      method: "POST",
      headers: { ...(token && { Authorization: `Bearer ${token}` }) },
      body: data,
    });
    const json = (await r.json()) as { product: SellerProduct; message?: string };
    if (!r.ok) {
      throw new Error(json.message ?? "Failed to add product");
    }
    return json;
  }
  return sellerFetch<{ product: SellerProduct }>("/products", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const updateProduct = (id: string, data: Record<string, unknown>) =>
  sellerFetch<{ product: SellerProduct }>(`/products/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

// ─── Orders ──────────────────────────────────────────────────────────────────

export interface OrderItem {
  name?: string;
  quantity: number;
  priceAtPurchase: number;
  product?: {
    name?: string;
    image?: string;
  };
}

export interface SellerOrder {
  _id: string;
  status: string;
  totalPrice: number;
  items: OrderItem[];
  user?: { name?: string; email?: string; phone?: string };
  deliveryAddress?: string;
  notes?: string;
  createdAt: string;
}

export interface OrdersResponse {
  orders: SellerOrder[];
  total?: number;
}

export const getOrders = (status?: string, date?: string) => {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (date) params.set("date", date);
  return sellerFetch<OrdersResponse>(`/orders?${params.toString()}`);
};

export const updateOrderStatus = (orderId: string, status: string) =>
  sellerFetch<{ order: SellerOrder }>(`/orders/${orderId}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });

// ─── Analytics ───────────────────────────────────────────────────────────────

export interface GraphPoint {
  date: string;
  seller: number;
  platform: number;
}

export interface AnalyticsData {
  totalRevenue: number;
  totalCommission: number;
  sellerEarnings: number;
  totalUsers: number;
  graphData: GraphPoint[];
}

export const getAnalytics = () =>
  sellerFetch<{ success: boolean; data: AnalyticsData }>("/analytics");

// ─── Delivery OTP ─────────────────────────────────────────────────────────────

/** Ask backend to generate a delivery OTP (printed to server terminal) */
export const generateDeliveryOTP = (orderId: string) =>
  sellerFetch<{ success: boolean; message: string }>(
    `/orders/${orderId}/generate-otp`,
    { method: "POST" }
  );

/** Submit OTP entered by customer; marks order as delivered on success */
export const verifyDeliveryOTP = (orderId: string, otp: string) =>
  sellerFetch<{ success: boolean; message: string }>(
    `/orders/${orderId}/verify-otp`,
    { method: "POST", body: JSON.stringify({ otp }) }
  );
