"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { getOrders, updateOrderStatus, type SellerOrder } from "@/services/sellerApi";

const FILTERS = [
  { label: "All", value: "" }, { label: "New", value: "pending" },
  { label: "Accepted", value: "accepted" }, { label: "Packed", value: "packed" },
  { label: "Delivered", value: "delivered" }, { label: "Cancelled", value: "cancelled" },
];
const STATUS_LABELS: Record<string, string> = {
  pending: "New Order", accepted: "Accepted", packed: "Packed", delivered: "Delivered", cancelled: "Cancelled",
};
const STATUS_COLORS: Record<string, string> = {
  pending:   "bg-yellow-900/50 text-yellow-300 border-yellow-700/40",
  accepted:  "bg-blue-900/50 text-blue-300 border-blue-700/40",
  packed:    "bg-purple-900/50 text-purple-300 border-purple-700/40",
  delivered: "bg-green-900/50 text-green-300 border-green-700/40",
  cancelled: "bg-red-900/50 text-red-300 border-red-700/40",
};
const NEXT_STATUS: Record<string, { label: string; value: string }> = {
  pending:  { label: "✓ Accept Order",    value: "accepted"  },
  accepted: { label: "📦 Mark as Packed", value: "packed"    },
  packed:   { label: "🚀 Mark Delivered", value: "delivered" },
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const mins = Math.floor((Date.now() - d.getTime()) / 60000);
  if (mins < 1)  return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export default function SellerOrdersPage() {
  const [orders, setOrders]     = useState<SellerOrder[]>([]);
  const [filter, setFilter]     = useState("");
  const [loading, setLoading]   = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = useCallback(async (status?: string) => {
    setLoading(true);
    try { const res = await getOrders(status || undefined); setOrders(res.orders || []); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(filter); }, [filter, load]);

  const handleUpdate = async (orderId: string, status: string) => {
    setUpdating(orderId);
    try {
      await updateOrderStatus(orderId, status);
      setOrders((prev) => prev.map((o) => (o._id === orderId ? { ...o, status } : o)));
    } catch (e) { console.error(e); }
    finally { setUpdating(null); }
  };

  const handleCancel = async (orderId: string) => {
    if (!confirm("Cancel this order?")) return;
    await handleUpdate(orderId, "cancelled");
  };

  const counts = orders.reduce<Record<string, number>>((acc, o) => {
    acc[o.status] = (acc[o.status] ?? 0) + 1; return acc;
  }, {});

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg, #1a0810 0%, #2d1015 100%)" }}>

      {/* Header */}
      <div className="sticky top-0 z-20 border-b border-rose-900/50 backdrop-blur-md"
        style={{ background: "rgba(26,8,16,0.85)" }}>
        <div className="px-4 py-4 flex items-center gap-3 max-w-lg mx-auto">
          <Link href="/seller/seller/dashboard" className="text-rose-400/70 hover:text-rose-200 text-lg transition-colors">←</Link>
          <h1 className="text-base font-semibold text-rose-50">Orders</h1>
          {!loading && <span className="ml-auto text-xs text-rose-400/60">{orders.length} total</span>}
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto scrollbar-hide max-w-lg mx-auto">
          {FILTERS.map((f) => (
            <button key={f.value} onClick={() => setFilter(f.value)}
              className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${
                filter === f.value
                  ? "border-rose-600 text-white"
                  : "border-rose-800/40 text-rose-400/70 hover:border-rose-600/50"}`}
              style={filter === f.value ? { background: "linear-gradient(135deg,#9f1239,#be123c)" } : {}}>
              {f.label}
              {f.value !== "" && (counts[f.value] ?? 0) > 0 && (
                <span className="ml-1 opacity-70">({counts[f.value]})</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-4 max-w-lg mx-auto">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-3">📭</div>
            <p className="text-rose-200 font-semibold">No orders found</p>
            <p className="text-rose-400/50 text-sm mt-1">
              {filter ? `No ${STATUS_LABELS[filter]?.toLowerCase()} orders` : "Orders will appear here"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => {
              const isExpanded = expanded === order._id;
              const next = NEXT_STATUS[order.status];
              const canCancel = ["pending", "accepted"].includes(order.status);
              return (
                <div key={order._id} className="rounded-2xl border border-rose-800/30 overflow-hidden"
                  style={{ background: "rgba(255,255,255,0.04)" }}>

                  {/* Collapsed row */}
                  <div onClick={() => setExpanded(isExpanded ? null : order._id)}
                    className="p-4 cursor-pointer select-none">
                    <div className="flex items-start justify-between mb-1.5">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-rose-400/60 font-mono">#{order._id.slice(-6).toUpperCase()}</span>
                          <span className="text-xs text-rose-400/40">· {formatDate(order.createdAt)}</span>
                        </div>
                        <p className="font-bold text-rose-50 text-base mt-0.5">₹{order.totalPrice}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${STATUS_COLORS[order.status] ?? ""}`}>
                          {STATUS_LABELS[order.status]}
                        </span>
                        <span className="text-rose-600 text-sm">{isExpanded ? "▲" : "▼"}</span>
                      </div>
                    </div>
                    <p className="text-sm text-rose-300/50 line-clamp-1">
                      {order.items.map((i) => `${i.name} ×${i.quantity}`).join(", ")}
                    </p>
                  </div>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div className="border-t border-rose-800/30 px-4 pb-4 pt-3 space-y-4">
                      <div>
                        <p className="text-xs font-semibold text-rose-400/60 uppercase tracking-wide mb-2">Items</p>
                        <div className="space-y-1.5">
                          {order.items.map((item, i) => (
                            <div key={i} className="flex justify-between text-sm">
                              <span className="text-rose-200">{item.name} <span className="text-rose-400/50">×{item.quantity}</span></span>
                              <span className="text-rose-100 font-medium">₹{item.priceAtPurchase * item.quantity}</span>
                            </div>
                          ))}
                          <div className="flex justify-between text-sm font-bold pt-2 border-t border-rose-800/30">
                            <span className="text-rose-100">Total</span>
                            <span className="text-rose-50">₹{order.totalPrice}</span>
                          </div>
                        </div>
                      </div>

                      {order.user && (
                        <div className="rounded-xl p-3 border border-rose-800/30" style={{ background: "rgba(255,255,255,0.03)" }}>
                          <p className="text-xs font-semibold text-rose-400/60 uppercase tracking-wide mb-1.5">Customer</p>
                          <p className="text-sm font-medium text-rose-100">{order.user.name}</p>
                          <a href={`tel:${order.user.phone}`} className="text-rose-400 text-sm mt-0.5 flex items-center gap-1">
                            📞 {order.user.phone}
                          </a>
                        </div>
                      )}

                      {order.deliveryAddress && (
                        <div className="rounded-xl p-3 border border-rose-800/30" style={{ background: "rgba(255,255,255,0.03)" }}>
                          <p className="text-xs font-semibold text-rose-400/60 uppercase tracking-wide mb-1">Delivery Address</p>
                          <p className="text-sm text-rose-200">{order.deliveryAddress}</p>
                        </div>
                      )}

                      {order.notes && (
                        <div className="rounded-xl p-3 border border-rose-700/30" style={{ background: "rgba(159,18,57,0.15)" }}>
                          <p className="text-xs font-semibold text-rose-400 mb-1">Note from customer</p>
                          <p className="text-sm text-rose-200">{order.notes}</p>
                        </div>
                      )}

                      {(next || canCancel) && (
                        <div className="flex gap-2 pt-1">
                          {next && (
                            <button onClick={() => handleUpdate(order._id, next.value)}
                              disabled={updating === order._id}
                              className="flex-1 text-white text-sm font-semibold py-3 rounded-xl transition-all disabled:opacity-50"
                              style={{ background: "linear-gradient(135deg,#9f1239,#be123c)" }}>
                              {updating === order._id ? "Updating…" : next.label}
                            </button>
                          )}
                          {canCancel && (
                            <button onClick={() => handleCancel(order._id)}
                              disabled={updating === order._id}
                              className="px-4 bg-red-900/30 hover:bg-red-900/50 text-red-300 text-sm font-medium py-3 rounded-xl border border-red-800/40 transition-all disabled:opacity-50">
                              Cancel
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}