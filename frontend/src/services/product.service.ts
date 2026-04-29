import api from "@/lib/axios";
import { ApiResponse, Product } from "@/types";

/* ─────────── TYPES ─────────── */

interface PaginatedResponse<T> {
  success: boolean;
  count: number;
  total: number;
  page: number;
  totalPages: number;
  data: T;
}

interface AISearchResponse {
  success: boolean;
  filters: {
    category: string | null;
    minPrice: number | null;
    maxPrice: number | null;
    keywords: string[];
  };
  products: Product[];
}

/* ─────────── GET ALL PRODUCTS ─────────── */
export const getProducts = async (): Promise<Product[]> => {
  const { data } = await api.get<PaginatedResponse<Product[]>>("/products", { params: { limit: 100 } });
  return data.data;
};

/* ─────────── AI SEARCH ─────────── */
export const aiSearch = async (query: string): Promise<Product[]> => {
  const { data } = await api.post<AISearchResponse>("/ai/search", { query });
  if (!data.success) throw new Error("AI search failed");
  return data.products;
};

/* ─────────── GET SINGLE PRODUCT ─────────── */
export const getProductById = async (id: string): Promise<Product> => {
  const { data } = await api.get<ApiResponse<Product>>(`/products/${id}`);
  return data.data;
};

/* ─────────── CREATE PRODUCT (ADMIN) ─────────── */
export const createProduct = async (
  payload: Partial<Product>
): Promise<Product> => {
  const { data } = await api.post<ApiResponse<Product>>("/products", payload);
  return data.data;
};

/* ─────────── UPDATE PRODUCT (ADMIN) ─────────── */
export const updateProduct = async (
  id: string,
  payload: Partial<Product>
): Promise<Product> => {
  const { data } = await api.put<ApiResponse<Product>>(
    `/products/${id}`,
    payload
  );
  return data.data;
};

/* ─────────── DELETE PRODUCT (ADMIN) ─────────── */
export const deleteProduct = async (id: string): Promise<void> => {
  await api.delete(`/products/${id}`);
};

/* ─────────── GET SIMILAR PRODUCTS ─────────── */
export const getSimilarProducts = async (id: string): Promise<Product[]> => {
  const { data } = await api.get<ApiResponse<Product[]>>(
    `/products/${id}/similar`
  );
  return data.data;
};