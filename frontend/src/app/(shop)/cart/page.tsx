"use client";

import { useEffect } from "react";
import { useCartStore } from "@/store/cart.store";
import Link from "next/link";

export default function CartPage() {
  const { cart, loading, error, fetchCart, updateQuantity, removeFromCart, clearCart } = useCartStore();

  useEffect(() => { fetchCart(); }, []);

  if (loading) return <p className="p-6 text-sm text-gray-500">Loading cart...</p>;
  if (error)   return <p className="p-6 text-sm text-red-500">{error}</p>;
  if (!cart || cart.items.length === 0)
    return (
      <main className="p-6 text-center">
        <p className="text-gray-500 mb-4">Your cart is empty.</p>
        <Link href="/products" className="text-sm underline">Browse Products</Link>
      </main>
    );

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Cart</h1>
        <button onClick={clearCart} className="text-xs text-red-500 underline">
          Clear Cart
        </button>
      </div>

      <div className="divide-y border rounded-lg overflow-hidden">
        {cart.items.map(({ product, quantity }) => (
          <div key={product._id} className="flex items-center gap-4 p-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{product.name}</p>
              <p className="text-xs text-gray-500">₹{product.price.toLocaleString()}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => quantity > 1 ? updateQuantity(product._id, quantity - 1) : removeFromCart(product._id)}
                className="w-7 h-7 border rounded text-sm font-medium hover:bg-gray-50"
              >−</button>
              <span className="w-5 text-center text-sm">{quantity}</span>
              <button
                onClick={() => updateQuantity(product._id, quantity + 1)}
                className="w-7 h-7 border rounded text-sm font-medium hover:bg-gray-50"
              >+</button>
            </div>

            <p className="w-20 text-right text-sm font-semibold">
              ₹{(product.price * quantity).toLocaleString()}
            </p>

            <button
              onClick={() => removeFromCart(product._id)}
              className="text-xs text-red-400 hover:text-red-600"
            >✕</button>
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-between items-center">
        <p className="text-sm font-semibold">
          Total: <span className="text-base">₹{cart.total.toLocaleString()}</span>
        </p>
        <Link
          href="/checkout"
          className="bg-black text-white text-sm px-6 py-2.5 rounded-lg hover:bg-gray-800 transition-colors"
        >
          Checkout
        </Link>
      </div>
    </main>
  );
}