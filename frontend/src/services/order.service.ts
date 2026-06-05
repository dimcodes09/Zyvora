import api from "@/lib/axios";
import { ApiResponse, Order } from "@/types";
import type { CheckoutSource } from "@/services/payment.service";

export interface BuyerInfo {
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export const getOrders = async (): Promise<Order[]> =>
  (await api.get<ApiResponse<Order[]>>("/orders")).data.data;

export const createCashOnDeliveryOrder = async (
  source: CheckoutSource = "cart",
  buyer?: BuyerInfo
): Promise<Order> =>
  (await api.post<ApiResponse<Order>>("/orders", { source, ...buyer })).data.data;

export const getOrderById = async (id: string): Promise<Order> =>
  (await api.get<ApiResponse<Order>>(`/orders/${id}`)).data.data;
