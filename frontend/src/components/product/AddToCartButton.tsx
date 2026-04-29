"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cart.store";
import { useAuthStore } from "@/store/auth.store";
import { ShoppingBag, Check, Loader2 } from "lucide-react";

export default function AddToCartButton({
  productId,
  disabled,
}: {
  productId: string;
  disabled: boolean;
}) {
  const addToCart = useCartStore((s) => s.addToCart);
  const user = useAuthStore((s) => s.user);
  const router = useRouter();

  const [added, setAdded] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!user) {
      router.push("/login");
      return;
    }

    try {
      setLoading(true);
      await addToCart(productId);
      setAdded(true);
      setTimeout(() => setAdded(false), 2500);
    } catch {
      // silent — cart store sets error
    } finally {
      setLoading(false);
    }
  };

  if (disabled) {
    return (
      <button
        disabled
        className="mt-6 w-full py-3.5 rounded-xl text-sm font-semibold bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
      >
        Out of Stock
      </button>
    );
  }

  return (
    <button
      id="add-to-cart-btn"
      onClick={handleAdd}
      disabled={loading || added}
      className={`
        mt-6 w-full py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2.5
        transition-all duration-300
        ${added
          ? "bg-green-500 text-white shadow-lg shadow-green-200"
          : "bg-[#C97B84] hover:bg-[#9B5C63] text-white shadow-lg shadow-rose-200 hover:shadow-rose-300 active:scale-[0.98]"
        }
        disabled:cursor-not-allowed
      `}
    >
      {loading && <Loader2 size={16} className="animate-spin" />}
      {added && <Check size={16} />}
      {!loading && !added && <ShoppingBag size={16} />}
      {loading ? "Adding to Cart…" : added ? "Added to Cart!" : "Add to Cart"}
    </button>
  );
}