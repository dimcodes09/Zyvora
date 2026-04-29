import api from "@/lib/axios";

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

// ✅ Create Razorpay order (uses cart from DB)
export const createRazorpayOrder =
  async (): Promise<RazorpayOrderResponse> => {
    const { data } = await api.post<RazorpayOrderResponse>(
      "/payments/razorpay/create-order"
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
