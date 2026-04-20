import api from "@/lib/axios";
import { ApiResponse, Product } from "@/types";

export const getProducts = async (): Promise<Product[]> => {
  const { data } = await api.get<ApiResponse<Product[]>>("/products");
  return data.data;
};

export const getProductById = async (id: string): Promise<Product> => {
  const { data } = await api.get<ApiResponse<Product>>(`/products/${id}`);
  return data.data;
};