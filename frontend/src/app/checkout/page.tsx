"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCartStore } from "@/store/cart.store";
import { useHamperContext } from "@/context/HamperContext";
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
} from "@/services/payment.service";
import { createCashOnDeliveryOrder } from "@/services/order.service";
import { resolveProductImage } from "@/lib/productImage";

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

type RazorpayHandlerResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayFailedResponse = {
  error?: {
    description?: string;
  };
};

type RazorpayOptions = {
  key?: string;
  amount: number;
  currency: string;
  order_id: string;
  handler: (response: RazorpayHandlerResponse) => Promise<void>;
  modal: { ondismiss: () => void };
  theme: { color: string };
};

type RazorpayInstance = {
  on: (event: "payment.failed", handler: (response: RazorpayFailedResponse) => void) => void;
  open: () => void;
};

const getErrMsg = (e: unknown, fallback = "Something went wrong.") => {
  if (e instanceof Error) return e.message;
  if (
    typeof e === "object" &&
    e !== null &&
    "message" in e &&
    typeof (e as Record<string, unknown>).message === "string"
  ) {
    return (e as Record<string, string>).message;
  }
  return fallback;
};

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

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Jost:wght@300;400;500&display=swap');

  .co-root {
    font-family: 'Jost', sans-serif;
    background: #FAF7F5;
    min-height: 100vh;
  }

  .co-page {
    max-width: 1100px;
    margin: 0 auto;
    padding: 120px 2.5rem 80px;
    display: grid;
    grid-template-columns: 1fr 420px;
    gap: 80px;
    align-items: start;
  }

  @media (max-width: 900px) {
    .co-page { grid-template-columns: 1fr; gap: 40px; padding: 100px 1.5rem 60px; }
  }

  .co-eyebrow {
    font-family: 'Jost', sans-serif;
    font-size: 0.6rem;
    font-weight: 500;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: #C96B7A;
    margin-bottom: 0.75rem;
  }

  .co-title {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: clamp(2rem, 4vw, 2.8rem);
    font-weight: 600;
    color: #2C1810;
    line-height: 1.15;
    margin-bottom: 2.5rem;
  }

  .co-divider {
    width: 40px;
    height: 1px;
    background: linear-gradient(90deg, #C96B7A, transparent);
    margin-bottom: 2.5rem;
  }

  .co-item {
    display: flex;
    align-items: center;
    gap: 1.25rem;
    padding: 1.25rem 0;
    border-bottom: 1px solid rgba(180,120,120,0.1);
    transition: background 0.2s;
  }
  .co-item:first-child { border-top: 1px solid rgba(180,120,120,0.1); }

  .co-img-wrap {
    width: 76px;
    height: 76px;
    border-radius: 12px;
    overflow: hidden;
    background: #F0EAE6;
    flex-shrink: 0;
    border: 1px solid rgba(180,120,120,0.12);
    position: relative;
  }
  .co-img-wrap img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.4s ease;
  }
  .co-item:hover .co-img-wrap img { transform: scale(1.05); }

  .co-img-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #C9A8A8;
    font-size: 1.4rem;
  }

  .co-name {
    font-family: 'Playfair Display', serif;
    font-size: 0.95rem;
    font-weight: 400;
    color: #2C1810;
    margin-bottom: 0.3rem;
    line-height: 1.3;
  }

  .co-qty {
    font-size: 0.68rem;
    font-weight: 400;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #A07878;
  }

  .co-price {
    font-family: 'Jost', sans-serif;
    font-size: 0.9rem;
    font-weight: 500;
    color: #2C1810;
    white-space: nowrap;
  }

  .co-card {
    background: #fff;
    border-radius: 20px;
    border: 1px solid rgba(180,120,120,0.12);
    padding: 2.2rem 2rem;
    box-shadow: 0 8px 40px rgba(80,30,30,0.06);
    position: sticky;
    top: 100px;
  }

  .co-card-title {
    font-family: 'Playfair Display', serif;
    font-size: 1.15rem;
    font-weight: 600;
    color: #2C1810;
    margin-bottom: 1.8rem;
    padding-bottom: 1.2rem;
    border-bottom: 1px solid rgba(180,120,120,0.1);
  }

  .co-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.9rem;
  }

  .co-row-label {
    font-size: 0.78rem;
    font-weight: 400;
    letter-spacing: 0.06em;
    color: #8A6060;
    text-transform: uppercase;
  }

  .co-row-val {
    font-size: 0.85rem;
    font-weight: 500;
    color: #2C1810;
  }

  .co-free { color: #4CAF7D; font-weight: 500; font-size: 0.82rem; }

  .co-total-row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-top: 1.4rem;
    padding-top: 1.4rem;
    border-top: 1px solid rgba(180,120,120,0.12);
  }

  .co-total-label {
    font-family: 'Playfair Display', serif;
    font-size: 1rem;
    color: #2C1810;
  }

  .co-total-val {
    font-family: 'Playfair Display', serif;
    font-size: 1.4rem;
    font-weight: 600;
    color: #7B1728;
  }

  .co-payment-title {
    margin-top: 1.4rem;
    padding-top: 1.4rem;
    border-top: 1px solid rgba(180,120,120,0.12);
    font-size: 0.68rem;
    font-weight: 500;
    letter-spacing: 0.14em;
    color: #8A6060;
    text-transform: uppercase;
  }

  .co-payment-options {
    display: grid;
    gap: 0.65rem;
    margin-top: 0.85rem;
  }

  .co-payment-option {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    border: 1px solid rgba(180,120,120,0.18);
    background: #FFFDFC;
    border-radius: 14px;
    padding: 0.85rem 0.95rem;
    color: #2C1810;
    cursor: pointer;
    transition: border-color 0.18s ease, background 0.18s ease, box-shadow 0.18s ease;
    text-align: left;
  }

  .co-payment-option.is-active {
    border-color: rgba(123,23,40,0.38);
    background: #FFF6F6;
    box-shadow: 0 8px 24px rgba(123,23,40,0.08);
  }

  .co-payment-name {
    display: block;
    font-size: 0.82rem;
    font-weight: 500;
  }

  .co-payment-note {
    display: block;
    margin-top: 0.16rem;
    font-size: 0.68rem;
    color: #A07878;
  }

  .co-payment-dot {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    border: 1px solid rgba(123,23,40,0.45);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .co-payment-option.is-active .co-payment-dot::after {
    content: "";
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #7B1728;
  }

  .co-btn {
    width: 100%;
    margin-top: 1.8rem;
    padding: 1rem;
    border-radius: 999px;
    background: linear-gradient(135deg, #C96B7A 0%, #7B1728 100%);
    color: #fff;
    border: none;
    cursor: pointer;
    font-family: 'Jost', sans-serif;
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    box-shadow: 0 6px 24px rgba(123,23,40,0.28);
    transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.18s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }
  .co-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 12px 32px rgba(123,23,40,0.36);
  }
  .co-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  .co-secure {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    margin-top: 1rem;
    font-size: 0.62rem;
    color: #B09090;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  .co-error {
    margin-top: 1rem;
    font-size: 0.72rem;
    color: #C0392B;
    background: #FDF0EE;
    border: 1px solid rgba(192,57,43,0.15);
    border-radius: 8px;
    padding: 0.75rem 1rem;
    letter-spacing: 0.02em;
  }

  .co-success {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #FAF7F5;
  }
  .co-success-inner { text-align: center; }
  .co-success-icon {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    background: linear-gradient(135deg, #C96B7A, #7B1728);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1.5rem;
    font-size: 1.8rem;
    box-shadow: 0 8px 28px rgba(123,23,40,0.25);
  }
  .co-success-title {
    font-family: 'Playfair Display', serif;
    font-size: 2rem;
    color: #2C1810;
    margin-bottom: 0.6rem;
  }
  .co-success-sub {
    font-size: 0.8rem;
    color: #A07878;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }
`;

// ── Inner component — must be inside Suspense because it uses useSearchParams ──

function CheckoutInner() {
  const router = useRouter();

  // useSearchParams() requires <Suspense> in Next.js App Router
  const searchParams = useSearchParams();
  const isHamper = searchParams.get("type") === "hamper";

  // Regular cart checkout
  const { cart, fetchCart, resetCart } = useCartStore();

  // Hamper checkout — reads from HamperProvider (in root layout)
  const hamper = useHamperContext();

  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"razorpay" | "cod">("razorpay");
  const checkoutSource = isHamper ? "hamper" : "cart";

  useEffect(() => {
    if (!isHamper) fetchCart();
  }, [fetchCart, isHamper]);

  // Unified item list depending on checkout type
  const checkoutItems = isHamper
    ? hamper.items.map((i) => ({
        product: { _id: i._id, name: i.name, price: i.price, image: i.image },
        quantity: i.qty,
      }))
    : (cart?.items ?? []);

  const subtotal = isHamper
    ? hamper.subtotal
    : (cart?.subtotal ?? 0);

  // Unified total
  const total = isHamper
    ? hamper.total          // subtotal + packaging from HamperContext
    : subtotal;

  const handlePayment = async () => {
    setLoading(true);
    setError(null);
    const loaded = await loadRazorpayScript();
    if (!loaded) { setError("Payment gateway failed to load."); setLoading(false); return; }
    try {
      const orderData = await createRazorpayOrder(checkoutSource);
      const options = {
        key:      process.env.NEXT_PUBLIC_RAZORPAY_KEY,
        amount:   orderData.amount,
        currency: orderData.currency ?? "INR",
        order_id: orderData.razorpayOrderId,
        handler: async (response: RazorpayHandlerResponse) => {
          try {
            await verifyRazorpayPayment(response);
            if (isHamper) hamper.clearHamper();
            else resetCart();
            setSuccess(true);
            setTimeout(() => router.push("/orders"), 2500);
          } catch (e: unknown) { setError(getErrMsg(e, "Payment verification failed.")); }
          finally { setLoading(false); }
        },
        modal: { ondismiss: () => setLoading(false) },
        theme: { color: "#7B1728" },
      };
      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (res: RazorpayFailedResponse) => {
        setError(res.error?.description || "Payment failed.");
        setLoading(false);
      });
      rzp.open();
    } catch (e: unknown) { setError(getErrMsg(e, "Could not initiate payment.")); setLoading(false); }
  };

  const handleCashOnDelivery = async () => {
    setLoading(true);
    setError(null);
    try {
      await createCashOnDeliveryOrder(checkoutSource);
      if (isHamper) hamper.clearHamper();
      else resetCart();
      setSuccess(true);
      setTimeout(() => router.push("/orders"), 2500);
    } catch (e: unknown) {
      setError(getErrMsg(e, "Could not place Cash on Delivery order."));
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = () => {
    if (paymentMethod === "cod") {
      void handleCashOnDelivery();
      return;
    }

    void handlePayment();
  };

  if (success) return (
    <>
      <style>{STYLES}</style>
      <div className="co-success">
        <div className="co-success-inner">
          <div className="co-success-icon">✓</div>
          <p className="co-success-title">Order Confirmed</p>
          <p className="co-success-sub">Redirecting to your orders...</p>
        </div>
      </div>
    </>
  );

  // For cart checkout only: show loading while cart fetches.
  // For hamper checkout: never block — hamper state already in context.
  if (!isHamper && !cart) return (
    <>
      <style>{STYLES}</style>
      <div className="co-success">
        <p style={{ fontSize: "0.8rem", color: "#A07878", letterSpacing: "0.1em", textTransform: "uppercase" }}>
          Loading checkout...
        </p>
      </div>
    </>
  );

  return (
    <>
      <style>{STYLES}</style>
      <main className="co-root">
        <div className="co-page">

          {/* ── LEFT: Item list ── */}
          <div>
            <p className="co-eyebrow">Zyvora — Secure Checkout</p>
            <h1 className="co-title">{isHamper ? "Your Hamper" : "Your Order"}</h1>
            <div className="co-divider" />

            {checkoutItems.length === 0 ? (
              <p style={{ color: "#A07878", fontSize: "0.85rem" }}>
                {isHamper ? "Your hamper is empty." : "Your cart is empty."}
              </p>
            ) : (
              <div>
                {checkoutItems.map(({ product, quantity }) => (
                  <div key={product._id} className="co-item">
                    <div className="co-img-wrap">
                      {product.image ? (
                        <img
                          src={resolveProductImage(product.image)}
                          alt={product.name}
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = "/placeholder.png";
                          }}
                        />
                      ) : (
                        <div className="co-img-placeholder">◇</div>
                      )}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p className="co-name">{product.name}</p>
                      <p className="co-qty">Qty — {quantity}</p>
                    </div>

                    <p className="co-price">
                      ₹{(product.price * quantity).toLocaleString("en-IN")}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── RIGHT: Summary card ── */}
          <div className="co-card">
            <p className="co-card-title">Order Summary</p>

            <div className="co-row">
              <span className="co-row-label">Subtotal</span>
              <span className="co-row-val">₹{subtotal.toLocaleString("en-IN")}</span>
            </div>

            {isHamper && (
              <div className="co-row">
                <span className="co-row-label">Gift Packaging</span>
                <span className="co-row-val">₹{hamper.packaging.toLocaleString("en-IN")}</span>
              </div>
            )}

            <div className="co-row">
              <span className="co-row-label">Shipping</span>
              <span className="co-free">Complimentary</span>
            </div>

            <div className="co-row">
              <span className="co-row-label">Tax</span>
              <span className="co-row-val">Included</span>
            </div>

            <div className="co-total-row">
              <span className="co-total-label">Total</span>
              <span className="co-total-val">₹{total.toLocaleString("en-IN")}</span>
            </div>

            <p className="co-payment-title">Payment Method</p>
            <div className="co-payment-options" role="radiogroup" aria-label="Payment method">
              <button
                type="button"
                role="radio"
                aria-checked={paymentMethod === "razorpay"}
                className={`co-payment-option ${paymentMethod === "razorpay" ? "is-active" : ""}`}
                onClick={() => setPaymentMethod("razorpay")}
              >
                <span>
                  <span className="co-payment-name">Razorpay</span>
                  <span className="co-payment-note">UPI, cards, net banking, wallets</span>
                </span>
                <span className="co-payment-dot" />
              </button>

              <button
                type="button"
                role="radio"
                aria-checked={paymentMethod === "cod"}
                className={`co-payment-option ${paymentMethod === "cod" ? "is-active" : ""}`}
                onClick={() => setPaymentMethod("cod")}
              >
                <span>
                  <span className="co-payment-name">Cash on Delivery</span>
                  <span className="co-payment-note">Pay when your order arrives</span>
                </span>
                <span className="co-payment-dot" />
              </button>
            </div>

            {error && <p className="co-error">{error}</p>}

            <button
              className="co-btn"
              onClick={handlePlaceOrder}
              disabled={loading || total === 0}
            >
              {loading
                ? "Processing..."
                : paymentMethod === "cod"
                ? "Place COD Order"
                : `Pay ₹${total.toLocaleString("en-IN")}`}
            </button>

            <p className="co-secure">
              {paymentMethod === "cod" ? "Pay at delivery" : "Secured by Razorpay"}
            </p>
          </div>

        </div>
      </main>
    </>
  );
}

// ── Default export wraps inner component in Suspense (required by Next.js) ──

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#FAF7F5" }}>
          <p style={{ fontSize: "0.8rem", color: "#A07878", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Loading checkout...
          </p>
        </div>
      }
    >
      <CheckoutInner />
    </Suspense>
  );
}
