"use client";

import Link from "next/link";
import Image from "next/image";
import { Product } from "@/types";
import { ShoppingBag } from "lucide-react";

export default function ProductCard({ product }: { product: Product }) {
  const imgSrc =
    product.image && product.image.trim() !== ""
      ? product.image
      : "/placeholder.png";

  return (
    <Link
      href={`/products/${product._id}`}
      className="group block rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-xl transition-all duration-500 border border-rose-100/60"
    >
      {/* ✅ FIXED IMAGE CONTAINER */}
      <div className="relative w-full h-52 bg-[#FAF0F1] overflow-hidden">
        <Image
          src={imgSrc}
          alt={product.name || "Product"}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          unoptimized={imgSrc.startsWith("http")}
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Hover button */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 translate-y-4 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-400">
          <span className="flex items-center gap-1.5 bg-white/95 text-[#3D2A2D] text-xs font-semibold px-3 py-1.5 rounded-full shadow-md whitespace-nowrap">
            <ShoppingBag size={12} stroke="#C97B84" />
            View Product
          </span>
        </div>

        {/* Stock badges */}
        {product.stock === 0 && (
          <div className="absolute top-2 right-2 bg-red-500/90 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
            Sold Out
          </div>
        )}

        {product.stock > 0 && product.stock <= 3 && (
          <div className="absolute top-2 right-2 bg-amber-500/90 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
            Only {product.stock} left
          </div>
        )}
      </div>

      {/* ✅ TEXT SECTION */}
      <div className="px-3.5 py-3">
        <p className="text-xs font-medium text-[#B89BA0] uppercase tracking-wider mb-1 truncate">
          {product.category || "Luxury Gift"}
        </p>

        <h3 className="text-sm font-semibold text-[#3D2A2D] truncate leading-snug">
          {product.name}
        </h3>

        <p className="mt-1.5 text-sm font-bold text-[#C97B84]">
          ₹{(product.price ?? 0).toLocaleString("en-IN")}
        </p>
      </div>
    </Link>
  );
}