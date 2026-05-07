"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { getProducts, updateProduct, type SellerProduct } from "@/services/sellerApi";
import { resolveProductImage } from "@/lib/productImage";

export default function SellerProductsPage() {
  const [products, setProducts]   = useState<SellerProduct[]>([]);
  const [loading, setLoading]     = useState(true);
  const [editStock, setEditStock] = useState<{ id: string; value: string } | null>(null);
  const [saving, setSaving]       = useState<string | null>(null);
  const [search, setSearch]       = useState("");

  const load = useCallback(async () => {
    try { const res = await getProducts(); setProducts(res.products || []); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleToggleActive = async (id: string, current: boolean) => {
    setSaving(id);
    try {
      await updateProduct(id, { isActive: !current });
      setProducts((prev) => prev.map((p) => (p._id === id ? { ...p, isActive: !current } : p)));
    } catch (e) { console.error(e); }
    finally { setSaving(null); }
  };

  const handleSaveStock = async (id: string, value: string) => {
    if (!value || isNaN(Number(value))) return;
    setSaving(id);
    try {
      await updateProduct(id, { stock: Number(value) });
      setProducts((prev) => prev.map((p) => (p._id === id ? { ...p, stock: Number(value) } : p)));
      setEditStock(null);
    } catch (e) { console.error(e); }
    finally { setSaving(null); }
  };

  const filtered = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
  const activeCount   = products.filter((p) => p.isActive).length;
  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= 5).length;
  const outOfStock    = products.filter((p) => p.stock === 0).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#1a0810" }}>
        <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg, #1a0810 0%, #2d1015 100%)" }}>

      {/* Header */}
      <div className="sticky top-0 z-20 border-b border-rose-900/50 backdrop-blur-md"
        style={{ background: "rgba(26,8,16,0.85)" }}>
        <div className="px-4 py-4 flex items-center justify-between max-w-lg mx-auto">
          <div className="flex items-center gap-3">
            <Link href="/seller/seller/dashboard" className="text-rose-400/70 hover:text-rose-200 text-lg transition-colors">←</Link>
            <h1 className="text-base font-semibold text-rose-50">
              My Products <span className="text-rose-400/50 font-normal text-sm">({products.length})</span>
            </h1>
          </div>
          <Link href="/seller/seller/add-product"
            className="text-white text-sm px-4 py-1.5 rounded-xl font-medium transition-all"
            style={{ background: "linear-gradient(135deg,#9f1239,#be123c)" }}>
            + Add
          </Link>
        </div>
        <div className="px-4 pb-3 max-w-lg mx-auto">
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products…"
            className="w-full border border-rose-800/40 rounded-xl px-4 py-2 text-sm outline-none bg-white/5 text-rose-50 focus:border-rose-500 transition-colors placeholder-rose-800" />
        </div>
      </div>

      <div className="px-4 py-4 max-w-lg mx-auto">

        {/* Badges */}
        {products.length > 0 && (
          <div className="flex gap-2 mb-4 flex-wrap">
            <span className="text-xs bg-green-900/40 text-green-300 border border-green-800/40 px-2.5 py-1 rounded-full">
              {activeCount} active
            </span>
            {lowStockCount > 0 && (
              <span className="text-xs bg-orange-900/40 text-orange-300 border border-orange-800/40 px-2.5 py-1 rounded-full">
                ⚠️ {lowStockCount} low stock
              </span>
            )}
            {outOfStock > 0 && (
              <span className="text-xs bg-red-900/40 text-red-300 border border-red-800/40 px-2.5 py-1 rounded-full">
                ❌ {outOfStock} out of stock
              </span>
            )}
          </div>
        )}

        {/* Empty state */}
        {products.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-3">🏪</div>
            <p className="text-rose-100 font-semibold">No products yet</p>
            <p className="text-rose-400/50 text-sm mt-1">Add your first product to get started</p>
            <Link href="/seller/seller/add-product"
              className="mt-5 inline-block text-white px-6 py-3 rounded-2xl font-medium transition-all"
              style={{ background: "linear-gradient(135deg,#9f1239,#be123c)" }}>
              Add First Product
            </Link>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-rose-400/50 text-sm">
            No products match &quot;{search}&quot;
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((p) => (
              <div key={p._id}
                className={`rounded-2xl p-4 border border-rose-800/30 transition-opacity ${!p.isActive ? "opacity-50" : ""}`}
                style={{ background: "rgba(255,255,255,0.04)" }}>

                <div className="flex gap-3">
                  <div className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden border border-rose-800/30"
                    style={{ background: "rgba(255,255,255,0.06)" }}>
                    {p.image
                      ? <img src={resolveProductImage(p.image)} alt={p.name} className="w-full h-full object-cover" />
                      : <span className="text-2xl">📦</span>}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-rose-50 text-sm leading-tight truncate">{p.name}</h3>
                      <span className="text-base font-bold text-rose-100 flex-shrink-0">₹{p.price}</span>
                    </div>

                    {p.category && (
                      <span className="text-xs text-rose-300 border border-rose-800/40 px-2 py-0.5 rounded-full mt-1 inline-block"
                        style={{ background: "rgba(159,18,57,0.2)" }}>
                        {p.category}
                      </span>
                    )}

                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-rose-400/50">Stock:</span>
                      {editStock?.id === p._id ? (
                        <div className="flex items-center gap-1">
                          <input type="number" value={editStock.value}
                            onChange={(e) => setEditStock({ id: p._id, value: e.target.value })}
                            className="w-16 border border-rose-600 rounded-lg px-2 py-0.5 text-sm text-center outline-none bg-white/10 text-rose-50"
                            inputMode="numeric" autoFocus min="0" />
                          <button onClick={() => handleSaveStock(p._id, editStock.value)} disabled={saving === p._id}
                            className="text-xs text-white px-2 py-0.5 rounded-lg disabled:opacity-50"
                            style={{ background: "linear-gradient(135deg,#9f1239,#be123c)" }}>
                            Save
                          </button>
                          <button onClick={() => setEditStock(null)} className="text-xs text-rose-400/50 px-1">✕</button>
                        </div>
                      ) : (
                        <button onClick={() => setEditStock({ id: p._id, value: String(p.stock) })}
                          className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
                            p.stock === 0 ? "bg-red-900/40 text-red-300 border-red-800/40"
                            : p.stock <= 5 ? "bg-orange-900/40 text-orange-300 border-orange-800/40"
                            : "bg-green-900/40 text-green-300 border-green-800/40"}`}>
                          {p.stock === 0 ? "Out of stock" : `${p.stock} in stock`} ✏️
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-rose-800/20">
                  <button onClick={() => handleToggleActive(p._id, p.isActive)} disabled={saving === p._id}
                    className={`w-full text-xs py-2 rounded-xl font-medium transition-all disabled:opacity-50 border ${
                      p.isActive
                        ? "border-rose-800/30 text-rose-400/60 hover:bg-white/5"
                        : "border-green-800/40 text-green-300 hover:bg-green-900/20"}`}>
                    {saving === p._id ? "Saving…" : p.isActive ? "Deactivate listing" : "Activate listing"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
