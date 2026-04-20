import api from "@/lib/axios";
import { ApiResponse, Order } from "@/types";

export const getOrders = async (): Promise<Order[]> =>
  (await api.get<ApiResponse<Order[]>>("/orders")).data.data;

export const getOrderById = async (id: string): Promise<Order> =>
  (await api.get<ApiResponse<Order>>(`/orders/${id}`)).data.data;