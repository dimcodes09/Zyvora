"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cart.store";
import api from "@/lib/axios";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const loadRazorpayScript = (): Promise<boolean> =>
  new Promise((resolve) => {
    if (document.getElementById("razorpay-script")) return resolve(true);

    const script = document.createElement("script");
    script.id = "razorpay-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";

    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);

    document.body.appendChild(script);
  });

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, fetchCart, clearCart } = useCartStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchCart();
  }, []);

  const handlePayment = async () => {
    setLoading(true);
    setError(null);

    const loaded = await loadRazorpayScript();
    if (!loaded) {
      setError("Failed to load Razorpay SDK.");
      setLoading(false);
      return;
    }

    try {
      const { data } = await api.post("/payments/razorpay/create-order");

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
        amount: data.amount,
        currency: data.currency ?? "INR",
        order_id: data.razorpayOrderId,

        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          try {
            await api.post("/payments/razorpay/verify", response);

            await clearCart();
            setSuccess(true);

            setTimeout(() => router.push("/orders"), 2000);
          } catch {
            setError("Payment verification failed.");
          } finally {
            setLoading(false);
          }
        },

        modal: {
          ondismiss: () => setLoading(false),
        },

        theme: { color: "#000000" },
      };

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", (res: any) => {
        setError(res.error?.description || "Payment failed.");
        setLoading(false);
      });

      rzp.open();
    } catch {
      setError("Could not initiate payment.");
      setLoading(false);
    }
  };

  if (success)
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl font-bold text-green-600 mb-2">
            Payment Successful ✓
          </p>
          <p className="text-sm text-gray-500">
            Redirecting to your orders...
          </p>
        </div>
      </main>
    );

  return (
    <main className="max-w-md mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-8">Checkout</h1>

      {!cart || cart.items.length === 0 ? (
        <p className="text-sm text-gray-500">Your cart is empty.</p>
      ) : (
        <div className="border rounded-lg p-6 space-y-4">
          <div className="divide-y">
            {cart.items.map(({ product, quantity }) => (
              <div key={product._id} className="flex justify-between py-2 text-sm">
                <span className="truncate max-w-[70%]">
                  {product.name} × {quantity}
                </span>
                <span className="font-medium">
                  ₹{(product.price * quantity).toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          <div className="flex justify-between pt-2 border-t">
            <span className="font-semibold">Total</span>
            <span className="text-lg font-bold">
              ₹{cart.total.toLocaleString()}
            </span>
          </div>

          {error && (
            <p className="text-xs text-red-500 bg-red-50 border px-3 py-2 rounded">
              {error}
            </p>
          )}

          <button
            onClick={handlePayment}
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
          >
            {loading
              ? "Processing..."
              : `Pay ₹${cart.total.toLocaleString()}`}
          </button>
        </div>
      )}
    </main>
  );
}