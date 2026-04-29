"use client";

import { useState } from "react";
import { createProduct } from "@/services/product.service";
import { useRouter } from "next/navigation";
import AdminGuard from "@/components/admin/AdminGuard";

function NewProductContent() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "",
    image: "",
    reelVideo: "",           // ← new
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await createProduct({
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
        // send null when empty so the backend stores null (not "")
        reelVideo: form.reelVideo.trim() || null,
      });
      router.push("/admin/products");
    } catch (err: any) {
      setError(err?.message || "Failed to create product.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Add Product</h1>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-4 py-2 mb-4">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Name">
          <input name="name" value={form.name} onChange={handleChange} required />
        </Field>

        <Field label="Description">
          <textarea name="description" value={form.description} onChange={handleChange} rows={3} required />
        </Field>

        <Field label="Price (₹)">
          <input name="price" type="number" value={form.price} onChange={handleChange} required />
        </Field>

        <Field label="Category">
          <input name="category" value={form.category} onChange={handleChange} required />
        </Field>

        <Field label="Stock">
          <input name="stock" type="number" value={form.stock} onChange={handleChange} required />
        </Field>

        <Field label="Image URL">
          <input name="image" value={form.image} onChange={handleChange} required />
        </Field>

        {/* ── Reel Video — optional ──────────────────────────────── */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">
            Reel Video URL
            <span className="ml-2 text-xs font-normal text-gray-400">optional — paste a Cloudinary or S3 .mp4 link</span>
          </label>
          <div className="[&>input]:w-full [&>input]:border [&>input]:border-gray-300 [&>input]:rounded [&>input]:px-3 [&>input]:py-2 [&>input]:text-sm [&>input]:outline-none [&>input]:focus:ring-2 [&>input]:focus:ring-black">
            <input
              name="reelVideo"
              value={form.reelVideo}
              onChange={handleChange}
              placeholder="https://res.cloudinary.com/…/video.mp4"
            />
          </div>
          {form.reelVideo && (
            <p className="text-xs text-green-600 mt-1">
              ✓ This product will appear in the Reels feed
            </p>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-black text-white px-5 py-2 rounded hover:bg-gray-800 text-sm disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Product"}
          </button>

          <button
            type="button"
            onClick={() => router.push("/admin/products")}
            className="px-5 py-2 rounded border border-gray-300 text-sm hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default function NewProductPage() {
  return (
    <AdminGuard>
      <NewProductContent />
    </AdminGuard>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div className="[&>input]:w-full [&>input]:border [&>input]:border-gray-300 [&>input]:rounded [&>input]:px-3 [&>input]:py-2 [&>input]:text-sm [&>input]:outline-none [&>input]:focus:ring-2 [&>input]:focus:ring-black [&>textarea]:w-full [&>textarea]:border [&>textarea]:border-gray-300 [&>textarea]:rounded [&>textarea]:px-3 [&>textarea]:py-2 [&>textarea]:text-sm [&>textarea]:outline-none [&>textarea]:focus:ring-2 [&>textarea]:focus:ring-black">
        {children}
      </div>
    </div>
  );
}