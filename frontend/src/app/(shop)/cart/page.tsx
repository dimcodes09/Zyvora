"use client";

import { useEffect } from "react";
import { useCartStore } from "@/store/cart.store";
import Link from "next/link";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Jost:wght@300;400;500;600&display=swap');

  .cart-root {
    font-family: 'Jost', sans-serif;
    background: #FAF7F5;
    min-height: 100vh;
  }

  .cart-page {
    max-width: 1100px;
    margin: 0 auto;
    padding: 120px 2.5rem 80px;
    display: grid;
    grid-template-columns: 1fr 380px;
    gap: 80px;
    align-items: start;
  }

  @media (max-width: 900px) {
    .cart-page { grid-template-columns: 1fr; gap: 40px; padding: 100px 1.5rem 60px; }
  }

  .cart-eyebrow {
    font-size: 0.6rem;
    font-weight: 500;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: #C96B7A;
    margin-bottom: 0.75rem;
  }

  .cart-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(2rem, 4vw, 2.8rem);
    font-weight: 600;
    color: #2C1810;
    line-height: 1.15;
    margin-bottom: 0.5rem;
  }

  .cart-count {
    font-size: 0.72rem;
    color: #A07878;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin-bottom: 2.5rem;
  }

  .cart-divider {
    width: 40px;
    height: 1px;
    background: linear-gradient(90deg, #C96B7A, transparent);
    margin-bottom: 2.5rem;
  }

  /* ── Item ── */
  .cart-item {
    display: flex;
    align-items: center;
    gap: 1.25rem;
    padding: 1.5rem 0;
    border-bottom: 1px solid rgba(180,120,120,0.1);
  }
  .cart-item:first-child { border-top: 1px solid rgba(180,120,120,0.1); }

  .cart-img-wrap {
    width: 88px;
    height: 88px;
    border-radius: 14px;
    overflow: hidden;
    background: #F0EAE6;
    flex-shrink: 0;
    border: 1px solid rgba(180,120,120,0.12);
  }
  .cart-img-wrap img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.4s ease;
  }
  .cart-item:hover .cart-img-wrap img { transform: scale(1.06); }

  .cart-img-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #C9A8A8;
    font-size: 1.5rem;
  }

  .cart-info { flex: 1; min-width: 0; }

  .cart-name {
    font-family: 'Playfair Display', serif;
    font-size: 0.95rem;
    color: #2C1810;
    margin-bottom: 0.3rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .cart-unit-price {
    font-size: 0.7rem;
    color: #A07878;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  /* ── Qty Controls ── */
  .cart-qty {
    display: flex;
    align-items: center;
    gap: 0;
    border: 1px solid rgba(180,120,120,0.2);
    border-radius: 999px;
    overflow: hidden;
    background: #fff;
  }

  .cart-qty-btn {
    width: 32px;
    height: 32px;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1rem;
    color: #7B1728;
    transition: background 0.18s;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .cart-qty-btn:hover { background: rgba(123,23,40,0.06); }

  .cart-qty-val {
    min-width: 28px;
    text-align: center;
    font-size: 0.82rem;
    font-weight: 500;
    color: #2C1810;
  }

  .cart-line-price {
    font-size: 0.9rem;
    font-weight: 500;
    color: #2C1810;
    white-space: nowrap;
    min-width: 72px;
    text-align: right;
  }

  .cart-remove {
    background: none;
    border: none;
    cursor: pointer;
    color: #C9A8A8;
    font-size: 0.9rem;
    padding: 4px;
    border-radius: 50%;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color 0.18s, background 0.18s;
    flex-shrink: 0;
  }
  .cart-remove:hover { color: #7B1728; background: rgba(123,23,40,0.06); }

  /* ── Clear ── */
  .cart-clear {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 0.62rem;
    font-family: 'Jost', sans-serif;
    font-weight: 500;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: #C9A8A8;
    transition: color 0.18s;
    padding: 0;
  }
  .cart-clear:hover { color: #7B1728; }

  /* ── Summary Card ── */
  .cart-card {
    background: #fff;
    border-radius: 20px;
    border: 1px solid rgba(180,120,120,0.12);
    padding: 2.2rem 2rem;
    box-shadow: 0 8px 40px rgba(80,30,30,0.06);
    position: sticky;
    top: 100px;
  }

  .cart-card-title {
    font-family: 'Playfair Display', serif;
    font-size: 1.15rem;
    font-weight: 600;
    color: #2C1810;
    margin-bottom: 1.8rem;
    padding-bottom: 1.2rem;
    border-bottom: 1px solid rgba(180,120,120,0.1);
  }

  .cart-summary-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.9rem;
  }

  .cart-summary-label {
    font-size: 0.75rem;
    font-weight: 400;
    letter-spacing: 0.08em;
    color: #8A6060;
    text-transform: uppercase;
  }

  .cart-summary-val {
    font-size: 0.85rem;
    font-weight: 500;
    color: #2C1810;
  }

  .cart-free { color: #4CAF7D; font-size: 0.82rem; font-weight: 500; }

  .cart-total-row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-top: 1.4rem;
    padding-top: 1.4rem;
    border-top: 1px solid rgba(180,120,120,0.12);
  }

  .cart-total-label {
    font-family: 'Playfair Display', serif;
    font-size: 1rem;
    color: #2C1810;
  }

  .cart-total-val {
    font-family: 'Playfair Display', serif;
    font-size: 1.4rem;
    font-weight: 600;
    color: #7B1728;
  }

  /* ── Checkout Button ── */
  .cart-checkout-btn {
    width: 100%;
    margin-top: 1.8rem;
    padding: 1rem;
    border-radius: 999px;
    background: linear-gradient(135deg, #C96B7A 0%, #7B1728 100%);
    color: #fff;
    font-family: 'Jost', sans-serif;
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    text-align: center;
    display: block;
    text-decoration: none;
    box-shadow: 0 6px 24px rgba(123,23,40,0.28);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  .cart-checkout-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 32px rgba(123,23,40,0.36);
  }

  .cart-continue {
    display: block;
    text-align: center;
    margin-top: 1rem;
    font-size: 0.68rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #A07878;
    text-decoration: none;
    transition: color 0.18s;
  }
  .cart-continue:hover { color: #7B1728; }

  /* ── Empty State ── */
  .cart-empty {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #FAF7F5;
    flex-direction: column;
    gap: 1.2rem;
    text-align: center;
    padding: 2rem;
  }

  .cart-empty-icon {
    font-size: 2.5rem;
    opacity: 0.3;
    margin-bottom: 0.5rem;
  }

  .cart-empty-title {
    font-family: 'Playfair Display', serif;
    font-size: 1.6rem;
    color: #2C1810;
  }

  .cart-empty-sub {
    font-size: 0.75rem;
    color: #A07878;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  .cart-empty-link {
    margin-top: 0.5rem;
    display: inline-block;
    font-size: 0.68rem;
    font-weight: 600;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: #7B1728;
    text-decoration: none;
    border-bottom: 1px solid rgba(123,23,40,0.3);
    padding-bottom: 2px;
    transition: border-color 0.18s;
  }
  .cart-empty-link:hover { border-color: #7B1728; }
`;

export default function CartPage() {
  const { cart, loading, error, fetchCart, updateQuantity, removeFromCart, clearCart } = useCartStore();

  useEffect(() => { fetchCart(); }, [fetchCart]);

  if (loading) return (
    <>
      <style>{STYLES}</style>
      <div className="cart-empty">
        <p style={{ fontSize: "0.75rem", color: "#A07878", letterSpacing: "0.1em", textTransform: "uppercase" }}>
          Loading your cart...
        </p>
      </div>
    </>
  );

  if (error) return (
    <>
      <style>{STYLES}</style>
      <div className="cart-empty">
        <p style={{ fontSize: "0.8rem", color: "#C0392B" }}>{error}</p>
      </div>
    </>
  );

  if (!cart || cart.items.length === 0) return (
    <>
      <style>{STYLES}</style>
      <div className="cart-empty">
        <div className="cart-empty-icon">◇</div>
        <p className="cart-empty-title">Your cart is empty</p>
        <p className="cart-empty-sub">Looks like you haven't added anything yet</p>
        <Link href="/products" className="cart-empty-link">Explore Collection</Link>
      </div>
    </>
  );

  const subtotal = cart.subtotal ?? 0;
  const itemCount = cart.items.reduce((s: number, i: any) => s + i.quantity, 0);

  return (
    <>
      <style>{STYLES}</style>
      <main className="cart-root">
        <div className="cart-page">

          {/* ── LEFT ── */}
          <div>
            <p className="cart-eyebrow">Zyvora — Shopping Bag</p>
            <h1 className="cart-title">Your Cart</h1>
            <p className="cart-count">{itemCount} {itemCount === 1 ? "item" : "items"}</p>
            <div className="cart-divider" />

            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "0.5rem" }}>
              <button className="cart-clear" onClick={() => clearCart()}>
                Clear All
              </button>
            </div>

            <div>
              {cart.items.map(({ product, quantity }: any) => (
                <div key={product._id} className="cart-item">

                  {/* Image */}
                  <div className="cart-img-wrap">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = "/placeholder.png";
                        }}
                      />
                    ) : (
                      <div className="cart-img-placeholder">◇</div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="cart-info">
                    <p className="cart-name">{product.name}</p>
                    <p className="cart-unit-price">₹{product.price.toLocaleString()} each</p>
                  </div>

                  {/* Qty */}
                  <div className="cart-qty">
                    <button
                      className="cart-qty-btn"
                      onClick={() =>
                        quantity > 1
                          ? updateQuantity(product._id, quantity - 1)
                          : removeFromCart(product._id)
                      }
                    >
                      −
                    </button>
                    <span className="cart-qty-val">{quantity}</span>
                    <button
                      className="cart-qty-btn"
                      onClick={() => updateQuantity(product._id, quantity + 1)}
                    >
                      +
                    </button>
                  </div>

                  {/* Line price */}
                  <p className="cart-line-price">
                    ₹{(product.price * quantity).toLocaleString()}
                  </p>

                  {/* Remove */}
                  <button className="cart-remove" onClick={() => removeFromCart(product._id)}>
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT ── */}
          <div className="cart-card">
            <p className="cart-card-title">Order Summary</p>

            <div className="cart-summary-row">
              <span className="cart-summary-label">Subtotal</span>
              <span className="cart-summary-val">₹{subtotal.toLocaleString()}</span>
            </div>

            <div className="cart-summary-row">
              <span className="cart-summary-label">Shipping</span>
              <span className="cart-free">Complimentary</span>
            </div>

            <div className="cart-summary-row">
              <span className="cart-summary-label">Tax</span>
              <span className="cart-summary-val">Included</span>
            </div>

            <div className="cart-total-row">
              <span className="cart-total-label">Total</span>
              <span className="cart-total-val">₹{subtotal.toLocaleString()}</span>
            </div>

            <Link href="/checkout" className="cart-checkout-btn">
              Proceed to Checkout
            </Link>

            <Link href="/products" className="cart-continue">
              ← Continue Shopping
            </Link>
          </div>

        </div>
      </main>
    </>
  );
}