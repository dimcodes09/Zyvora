"use client";

import { useState } from "react";
import { useCartStore } from "@/store/cart.store";

export default function AddToCartButton({
  productId,
  disabled,
}: {
  productId: string;
  disabled: boolean;
}) {
  const addToCart = useCartStore((s) => s.addToCart);

  const [added, setAdded] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    try {
      setLoading(true);
      await addToCart(productId);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch {
      // optional: show toast later
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleAdd}
      disabled={disabled || loading}
      className="mt-4 w-full bg-black text-white py-2.5 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors"
    >
      {loading ? "Adding..." : added ? "Added ✓" : "Add to Cart"}
    </button>
  );
}