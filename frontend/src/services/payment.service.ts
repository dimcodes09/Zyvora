import api from "@/lib/axios";
import type { BuyerInfo } from "@/services/order.service";

export type CheckoutSource = "cart" | "hamper";

export interface RazorpayOrderResponse {
  success: boolean;
  razorpayOrderId: string;
  amount: number;
  currency: string;
  orderId: string;
}

export interface RazorpayVerifyPayload {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface RazorpayVerifyResponse {
  success: boolean;
  message: string;
  orderId: string;
  status: string;
}

// ✅ Create Razorpay order (uses cart or hamper from DB)
export const createRazorpayOrder = async (
  source: CheckoutSource = "cart",
  buyer?: BuyerInfo
): Promise<RazorpayOrderResponse> => {
  const { data } = await api.post<RazorpayOrderResponse>(
    "/payments/razorpay/create-order",
    { source, ...buyer }
  );
  return data;
};

// ✅ Verify Razorpay payment
export const verifyRazorpayPayment = async (
  payload: RazorpayVerifyPayload
): Promise<RazorpayVerifyResponse> => {
  const { data } = await api.post<RazorpayVerifyResponse>(
    "/payments/razorpay/verify",
    payload
  );
  return data;
};
