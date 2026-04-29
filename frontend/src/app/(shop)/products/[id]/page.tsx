"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getProductById, getSimilarProducts } from "@/services/product.service";
import { useCartStore } from "@/store/cart.store";
import { Product } from "@/types";
import {
  ShoppingBag,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Package,
  Star,
  Truck,
  RotateCcw,
  Shield,
} from "lucide-react";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

const resolveImage = (src?: string) => {
  if (!src || src.trim() === "") return "/placeholder.png";
  return src.startsWith("http") ? src : `${BACKEND_URL}${src}`;
};

// ── Skeleton ──────────────────────────────────────────────────────────────────
function DetailSkeleton() {
  return (
    <div className="min-h-screen bg-[#FDF8F5] pt-10 px-4 sm:px-8 lg:px-16">
      <div className="max-w-6xl mx-auto animate-pulse">
        <div className="h-4 w-32 bg-rose-100 rounded mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="aspect-square bg-[#FAF0F1] rounded-3xl" />
          <div className="space-y-4 pt-4">
            <div className="h-3 w-24 bg-rose-100 rounded" />
            <div className="h-8 w-3/4 bg-gray-200 rounded" />
            <div className="h-6 w-1/4 bg-rose-200 rounded" />
            <div className="h-4 w-full bg-gray-100 rounded mt-6" />
            <div className="h-4 w-5/6 bg-gray-100 rounded" />
            <div className="h-12 w-full bg-rose-100 rounded-xl mt-8" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Similar Product Mini Card ─────────────────────────────────────────────────
function SimilarCard({ product }: { product: Product }) {
  const imgSrc = resolveImage(product.image);
  return (
    <Link
      href={`/products/${product._id}`}
      className="group bg-white border border-rose-100 rounded-2xl overflow-hidden hover:shadow-lg hover:shadow-rose-100 hover:-translate-y-0.5 transition-all duration-200"
    >
      <div className="relative aspect-square w-full bg-[#FAF0F1] overflow-hidden">
        <Image
          src={imgSrc}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 640px) 50vw, 25vw"
          unoptimized={imgSrc.startsWith("http")}
        />
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <span className="text-[10px] font-bold text-white bg-black/50 px-2 py-0.5 rounded-full">
              Sold Out
            </span>
          </div>
        )}
      </div>
      <div className="p-3">
        <p className="text-[10px] font-semibold tracking-widest uppercase text-[#C97B84] mb-0.5">
          {product.category || "Luxury Gift"}
        </p>
        <p className="text-sm font-semibold text-[#3D2A2D] truncate" style={{ fontFamily: "'Playfair Display', serif" }}>
          {product.name}
        </p>
        <p className="text-sm font-bold text-[#C97B84] mt-1">
          ₹{product.price.toLocaleString("en-IN")}
        </p>
      </div>
    </Link>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [product, setProduct]           = useState<Product | null>(null);
  const [similar, setSimilar]           = useState<Product[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState<string | null>(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart]   = useState(false);
  const [cartError, setCartError]       = useState<string | null>(null);

  const { addToCart } = useCartStore();

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    setAddedToCart(false);
    setCartError(null);

    getProductById(id)
      .then((p) => {
        setProduct(p);
        // Fetch similar non-blocking
        getSimilarProducts(id)
          .then(setSimilar)
          .catch(() => setSimilar([]));
      })
      .catch(() => setError("Product not found."))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = async () => {
    if (!product) return;
    setAddingToCart(true);
    setCartError(null);
    try {
      await addToCart(product._id);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 3000);
    } catch {
      setCartError("Failed to add to cart. Please log in.");
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) return <DetailSkeleton />;

  if (error || !product) {
    return (
      <div className="min-h-screen bg-[#FDF8F5] flex flex-col items-center justify-center gap-4">
        <AlertCircle size={36} className="text-[#C97B84]" />
        <p className="text-[#3D2A2D] font-semibold text-lg">{error ?? "Product not found"}</p>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-[#C97B84] underline"
        >
          <ArrowLeft size={14} /> Go back
        </button>
      </div>
    );
  }

  const imgSrc  = resolveImage(product.image);
  const inStock = product.stock > 0;

  return (
    <main className="min-h-screen bg-[#FDF8F5]">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 lg:px-16 pt-10 pb-20">

        {/* ── Breadcrumb ── */}
        <nav className="flex items-center gap-2 text-xs text-[#B89BA0] mb-8">
          <Link href="/" className="hover:text-[#C97B84] transition-colors">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-[#C97B84] transition-colors">Products</Link>
          <span>/</span>
          <span className="text-[#3D2A2D] font-medium truncate max-w-[160px]">{product.name}</span>
        </nav>

        {/* ── Back Button ── */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-[#7A5C60] hover:text-[#C97B84] transition-colors mb-6"
        >
          <ArrowLeft size={15} />
          Back to products
        </button>

        {/* ── Product Detail ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">

          {/* Left: Image */}
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-[#FAF0F1] shadow-md">
            <Image
              src={imgSrc}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              unoptimized={imgSrc.startsWith("http")}
              priority
            />
            {!inStock && (
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <span className="text-sm font-bold text-white bg-black/60 px-4 py-1.5 rounded-full tracking-wide">
                  Sold Out
                </span>
              </div>
            )}
            {inStock && product.stock <= 5 && (
              <div className="absolute top-4 left-4">
                <span className="text-xs font-bold text-white bg-orange-400 px-3 py-1 rounded-full">
                  Only {product.stock} left
                </span>
              </div>
            )}
          </div>

          {/* Right: Info */}
          <div className="flex flex-col pt-2">

            {/* Category */}
            <p className="text-xs font-semibold tracking-[0.25em] uppercase text-[#C97B84] mb-3">
              {product.category || "Luxury Gift"}
            </p>

            {/* Name */}
            <h1
              className="text-3xl sm:text-4xl font-bold text-[#3D2A2D] leading-tight mb-4"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {product.name}
            </h1>

            {/* Rating placeholder */}
            <div className="flex items-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={14} className="text-amber-400 fill-amber-400" />
              ))}
              <span className="text-xs text-[#B89BA0] ml-2">Premium Quality</span>
            </div>

            {/* Price */}
            <p className="text-3xl font-bold text-[#C97B84] mb-6">
              ₹{product.price.toLocaleString("en-IN")}
            </p>

            {/* Description */}
            {product.description && (
              <p className="text-sm text-[#7A5C60] leading-relaxed mb-6 border-t border-rose-100 pt-6">
                {product.description}
              </p>
            )}

            {/* Stock Status */}
            <div className="flex items-center gap-2 mb-6">
              {inStock ? (
                <>
                  <CheckCircle size={15} className="text-emerald-500" />
                  <span className="text-sm font-medium text-emerald-600">
                    In Stock{product.stock <= 5 ? ` — Only ${product.stock} left` : ""}
                  </span>
                </>
              ) : (
                <>
                  <Package size={15} className="text-red-400" />
                  <span className="text-sm font-medium text-red-500">Out of Stock</span>
                </>
              )}
            </div>

            {/* Cart Error / Success */}
            {cartError && (
              <div className="flex items-center gap-2 mb-4 px-4 py-2.5 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                <AlertCircle size={14} />
                {cartError}
              </div>
            )}
            {addedToCart && (
              <div className="flex items-center gap-2 mb-4 px-4 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm">
                <CheckCircle size={14} />
                Added to cart!
              </div>
            )}

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={!inStock || addingToCart}
              className={`flex items-center justify-center gap-2.5 w-full py-3.5 rounded-2xl text-sm font-bold tracking-wide transition-all duration-200
                ${!inStock
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : addingToCart
                  ? "bg-[#C97B84]/70 text-white cursor-wait"
                  : "bg-[#3D2A2D] hover:bg-[#C97B84] text-white hover:-translate-y-0.5 hover:shadow-lg hover:shadow-rose-200"
                }`}
            >
              <ShoppingBag size={16} />
              {addingToCart ? "Adding…" : !inStock ? "Out of Stock" : "Add to Cart"}
            </button>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-3 mt-8 pt-6 border-t border-rose-100">
              <div className="flex flex-col items-center gap-1.5 text-center">
                <Truck size={18} className="text-[#C97B84]" />
                <span className="text-[10px] text-[#7A5C60] font-medium leading-tight">Free Shipping<br/>above ₹599</span>
              </div>
              <div className="flex flex-col items-center gap-1.5 text-center">
                <RotateCcw size={18} className="text-[#C97B84]" />
                <span className="text-[10px] text-[#7A5C60] font-medium leading-tight">Easy Returns<br/>& Exchange</span>
              </div>
              <div className="flex flex-col items-center gap-1.5 text-center">
                <Shield size={18} className="text-[#C97B84]" />
                <span className="text-[10px] text-[#7A5C60] font-medium leading-tight">Secure<br/>Payment</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Similar Products ── */}
        {similar.length > 0 && (
          <section className="mt-20">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px flex-1 bg-rose-100" />
              <p className="text-xs font-semibold tracking-[0.25em] uppercase text-[#C97B84]">
                You may also like
              </p>
              <div className="h-px flex-1 bg-rose-100" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {similar.slice(0, 4).map((p) => (
                <SimilarCard key={p._id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}