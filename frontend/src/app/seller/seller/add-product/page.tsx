"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { addProduct } from "@/services/sellerApi";
import { resolveProductImage } from "@/lib/productImage";

const getErrMsg = (e: unknown, fallback = "Something went wrong"): string => {
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

export default function AddProductPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
    image: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    setError("");

    const name = form.name.trim();
    const price = form.price.trim();
    const stock = form.stock.trim();
    const category = form.category.trim();
    const image = form.image.trim();

    if (!name || !price || stock === "") {
      setError("Name, price, and stock are required.");
      return;
    }
    if (Number(price) <= 0) {
      setError("Price must be greater than 0.");
      return;
    }
    if (Number(stock) < 0) {
      setError("Stock cannot be negative.");
      return;
    }
    if (!category) {
      setError("Category is required.");
      return;
    }
    if (image && !/^https?:\/\/.+/i.test(image)) {
      setError("Image must be a full URL, for example a Cloudinary link.");
      return;
    }

    setLoading(true);
    try {
      await addProduct({
        name,
        description: form.description.trim(),
        price: Number(price),
        stock: Number(stock),
        category,
        image,
      });
      setSuccess(true);
      setTimeout(() => router.push("/seller/seller/products"), 1500);
    } catch (e: unknown) {
      setError(getErrMsg(e));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(180deg,#1a0810,#2d1015)" }}>
        <div className="text-center">
          <div className="text-6xl mb-4">Done</div>
          <h2 className="text-xl font-bold text-rose-50">Product added!</h2>
          <p className="text-rose-400/60 text-sm mt-1">Redirecting to your products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg, #1a0810 0%, #2d1015 100%)" }}>
      <div
        className="sticky top-0 z-20 border-b border-rose-900/50 backdrop-blur-md"
        style={{ background: "rgba(26,8,16,0.85)" }}
      >
        <div className="px-4 py-4 flex items-center gap-3 max-w-lg mx-auto">
          <Link href="/seller/seller/dashboard" className="text-rose-400/70 hover:text-rose-200 text-lg transition-colors">
            Back
          </Link>
          <h1 className="text-base font-semibold text-rose-50">Add New Product</h1>
        </div>
      </div>

      <div className="px-4 py-5 max-w-lg mx-auto space-y-4">
        <div
          className="rounded-2xl border border-rose-800/30 p-4"
          style={{ background: "rgba(255,255,255,0.03)" }}
        >
          {form.image.trim() ? (
            <img
              src={resolveProductImage(form.image)}
              alt="Product preview"
              className="h-40 w-full object-cover rounded-xl shadow-lg bg-rose-950/30"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = "/placeholder.png";
              }}
            />
          ) : (
            <div className="h-40 rounded-xl border border-dashed border-rose-800/40 flex items-center justify-center text-center px-5">
              <div>
                <p className="text-sm font-medium text-rose-300">Paste an image URL below</p>
                <p className="text-xs text-rose-400/50 mt-1">Cloudinary, S3, or any public HTTPS image link</p>
              </div>
            </div>
          )}
        </div>

        <div
          className="rounded-2xl p-5 space-y-4 border border-rose-800/30"
          style={{ background: "rgba(255,255,255,0.04)" }}
        >
          <div>
            <label className="text-xs font-medium text-rose-300/70 mb-1 block">Product Name *</label>
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Gucci Bag"
              className="w-full border border-rose-800/40 rounded-xl px-4 py-2.5 text-sm outline-none bg-white/5 text-rose-50 focus:border-rose-500 transition-colors placeholder-rose-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-rose-300/70 mb-1 block">Price (INR) *</label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                placeholder="0"
                min="0"
                inputMode="decimal"
                className="w-full border border-rose-800/40 rounded-xl px-4 py-2.5 text-sm outline-none bg-white/5 text-rose-50 focus:border-rose-500 transition-colors placeholder-rose-800"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-rose-300/70 mb-1 block">Stock (qty) *</label>
              <input
                type="number"
                value={form.stock}
                onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
                placeholder="0"
                min="0"
                inputMode="numeric"
                className="w-full border border-rose-800/40 rounded-xl px-4 py-2.5 text-sm outline-none bg-white/5 text-rose-50 focus:border-rose-500 transition-colors placeholder-rose-800"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-rose-300/70 mb-1 block">Category *</label>
            <input
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              placeholder="e.g. Bags, Handmade, Luxury"
              className="w-full border border-rose-800/40 rounded-xl px-4 py-2.5 text-sm outline-none bg-white/5 text-rose-50 focus:border-rose-500 transition-colors placeholder-rose-800"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-rose-300/70 mb-1 block">
              Image URL <span className="text-rose-400/40 font-normal">(Cloudinary recommended)</span>
            </label>
            <input
              value={form.image}
              onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
              placeholder="https://res.cloudinary.com/.../product.jpg"
              className="w-full border border-rose-800/40 rounded-xl px-4 py-2.5 text-sm outline-none bg-white/5 text-rose-50 focus:border-rose-500 transition-colors placeholder-rose-800"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-rose-300/70 mb-1 block">
              Description <span className="text-rose-400/40 font-normal">(optional)</span>
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Add a short description..."
              rows={3}
              className="w-full border border-rose-800/40 rounded-xl px-4 py-2.5 text-sm outline-none bg-white/5 text-rose-50 focus:border-rose-500 transition-colors resize-none placeholder-rose-800"
            />
          </div>
        </div>

        {error && (
          <div className="rounded-xl p-3 border border-red-800/40" style={{ background: "rgba(127,29,29,0.2)" }}>
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-4 rounded-2xl font-bold text-base transition-all disabled:opacity-50 text-white shadow-lg"
          style={{ background: "linear-gradient(135deg, #9f1239, #be123c)" }}
        >
          {loading ? "Adding product..." : "Add Product"}
        </button>
      </div>
    </div>
  );
}
