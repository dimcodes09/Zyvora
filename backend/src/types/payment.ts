import { Types } from 'mongoose';

// ─── Cart item shape after population ─────────────────────────

export interface PopulatedPaymentItem {
  product: {
    _id: Types.ObjectId;
    name: string;
    price: number;
    stock: number;
  };
  quantity: number;
}

// ─── Stripe ───────────────────────────────────────────────────

export interface CheckoutSessionMetadata {
  orderId: string;
  userId: string;
}

export interface CreateCheckoutResponse {
  success: boolean;
  sessionUrl: string;
  orderId: string;
}

export interface PaymentSuccessResponse {
  success: boolean;
  message: string;
  orderId: string;
  status: string;
}

// ─── Razorpay ─────────────────────────────────────────────────

export interface RazorpayCreateOrderResponse {
  success: boolean;
  razorpayOrderId: string;
  amount: number;
  currency: string;
  orderId: string;
}

export interface RazorpayVerifyBody {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}