"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  getDashboard, getOrders, updateOrderStatus, getAnalytics,
  generateDeliveryOTP, verifyDeliveryOTP,
  type DashboardStats, type LowStockItem, type SellerOrder, type AnalyticsData,
} from "@/services/sellerApi";
import { useSeller } from "@/context/SellerContext";
import dynamic from "next/dynamic";

// Dynamic import so recharts doesn't SSR (it uses browser APIs)
const AnalyticsChart = dynamic(
  () => import("@/components/seller/AnalyticsChart"),
  { ssr: false, loading: () => (
    <div className="rounded-2xl h-48 flex items-center justify-center border border-white/10"
      style={{ background: "rgba(255,255,255,0.05)" }}>
      <div className="w-6 h-6 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )}
);

const STATUS_COLORS: Record<string, string> = {
  pending:   "bg-yellow-100 text-yellow-800",
  paid:      "bg-cyan-100 text-cyan-800",
  accepted:  "bg-blue-100 text-blue-800",
  packed:    "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};
const STATUS_LABELS: Record<string, string> = {
  pending: "New", paid: "Paid", accepted: "Accepted", packed: "Packed", delivered: "Delivered", cancelled: "Cancelled",
};
const NEXT_STATUS: Record<string, { label: string; value: string }> = {
  pending:  { label: "Accept Order",   value: "accepted"  },
  paid:     { label: "Accept Order",   value: "accepted"  },
  accepted: { label: "Mark as Packed", value: "packed"    },
  packed:   { label: "Mark Delivered", value: "delivered" },
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function getItemName(item: SellerOrder["items"][number]) {
  return item.name || item.product?.name || "Product";
}

export default function SellerDashboard() {
  const { seller, logout } = useSeller();
  const [stats, setStats]           = useState<DashboardStats | null>(null);
  const [orders, setOrders]         = useState<SellerOrder[]>([]);
  const [lowStock, setLowStock]     = useState<LowStockItem[]>([]);
  const [analytics, setAnalytics]   = useState<AnalyticsData | null>(null);
  const [loading, setLoading]       = useState(true);
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);

  // OTP state: keyed by orderId
  const [otpState, setOtpState] = useState<Record<string, {
    input: string; busy: boolean; msg: string; error: string;
  }>>({});

  const getOtp = (id: string) =>
    otpState[id] ?? { input: "", busy: false, msg: "", error: "" };

  const patchOtp = (id: string, patch: Partial<{ input: string; busy: boolean; msg: string; error: string }>) =>
    setOtpState((prev) => ({ ...prev, [id]: { ...(prev[id] ?? { input: "", busy: false, msg: "", error: "" }), ...patch } }));

  const handleGenerateOTP = async (orderId: string) => {
    patchOtp(orderId, { busy: true, msg: "", error: "" });
    try {
      const res = await generateDeliveryOTP(orderId);
      patchOtp(orderId, { busy: false, msg: res.message });
    } catch (e: unknown) {
      patchOtp(orderId, { busy: false, error: e instanceof Error ? e.message : "Failed to generate OTP" });
    }
  };

  const handleVerifyOTP = async (orderId: string) => {
    const otp = getOtp(orderId).input.trim();
    if (!otp) return;
    patchOtp(orderId, { busy: true, msg: "", error: "" });
    try {
      const res = await verifyDeliveryOTP(orderId, otp);
      patchOtp(orderId, { busy: false, msg: res.message, input: "" });
      setOrders((prev) => prev.map((o) => o._id === orderId ? { ...o, status: "delivered" } : o));
    } catch (e: unknown) {
      patchOtp(orderId, { busy: false, error: e instanceof Error ? e.message : "Incorrect OTP" });
    }
  };

  const loadData = useCallback(async () => {
    try {
      const [dashRes, ordersRes, analyticsRes] = await Promise.all([
        getDashboard(),
        getOrders(undefined, "today"),
        getAnalytics(),
      ]);
      setStats(dashRes.stats);
      setLowStock(dashRes.lowStock || []);
      setOrders(ordersRes.orders || []);
      setAnalytics(analyticsRes.data ?? null);
    } catch {
      setStats(null);
      setLowStock([]);
      setOrders([]);
      setAnalytics(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => { void loadData(); }, 0);
    return () => window.clearTimeout(timeout);
  }, [loadData]);

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    setUpdatingOrder(orderId);
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders((prev) => prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o)));
    } catch {}
    finally { setUpdatingOrder(null); }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#1a0810" }}>
        <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg, #1a0810 0%, #2d1015 100%)" }}>

      {/* ── Header ── */}
      <div className="sticky top-0 z-20 border-b border-rose-900/50 backdrop-blur-md"
        style={{ background: "rgba(26,8,16,0.85)" }}>
        <div className="px-5 py-4 flex items-center justify-between max-w-lg mx-auto">
          <div>
            <p className="text-xs text-rose-400/60">{getGreeting()},</p>
            <h1 className="text-base font-semibold text-rose-50">{seller?.shopName ?? "Your Shop"}</h1>
          </div>
          <div className="flex items-center gap-3">
            {!seller?.isVerified && (
              <span className="text-xs bg-yellow-900/40 text-yellow-300 border border-yellow-700/40 px-2.5 py-1 rounded-full">
                ⏳ Pending
              </span>
            )}
            <button onClick={logout}
              className="text-xs text-rose-400/70 hover:text-rose-200 transition-colors border border-rose-800/50 px-3 py-1.5 rounded-full">
              Log out
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 py-5 max-w-lg mx-auto space-y-5">

        {/* ── Stats Grid ── */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Today's Orders",  value: stats?.todaysOrders ?? 0,        icon: "📦", from: "#4a1020", to: "#6b1c2e" },
            { label: "Today's Revenue", value: `₹${stats?.todayRevenue ?? 0}`,  icon: "💰", from: "#1a2a4a", to: "#1e3a6e" },
            { label: "Total Products",  value: stats?.totalProducts ?? 0,        icon: "🏪", from: "#1a0a3a", to: "#2d1060" },
            { label: "Total Earnings",  value: `₹${stats?.totalEarnings ?? 0}`, icon: "📈", from: "#1a2a1a", to: "#1e4a1e" },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl p-4 border border-white/10"
              style={{ background: `linear-gradient(135deg, ${s.from}, ${s.to})` }}>
              <div className="text-2xl mb-2">{s.icon}</div>
              <div className="text-xl font-bold text-white">{s.value}</div>
              <div className="text-xs text-white/60 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── Quick Actions ── */}
        <div className="grid grid-cols-3 gap-3">
          <Link href="/seller/seller/add-product"
            className="rounded-2xl p-4 text-center border border-rose-700/30 transition-all hover:border-rose-500/60"
            style={{ background: "linear-gradient(135deg, #9f1239, #be123c)" }}>
            <div className="text-2xl mb-1">➕</div>
            <div className="text-xs font-semibold text-white">Add Product</div>
          </Link>
          <Link href="/seller/seller/orders"
            className="rounded-2xl p-4 text-center border border-rose-800/30 hover:border-rose-600/50 transition-all"
            style={{ background: "rgba(255,255,255,0.05)" }}>
            <div className="text-2xl mb-1">📋</div>
            <div className="text-xs font-semibold text-rose-200">All Orders</div>
          </Link>
          <Link href="/seller/seller/products"
            className="rounded-2xl p-4 text-center border border-rose-800/30 hover:border-rose-600/50 transition-all"
            style={{ background: "rgba(255,255,255,0.05)" }}>
            <div className="text-2xl mb-1">🏪</div>
            <div className="text-xs font-semibold text-rose-200">Products</div>
          </Link>
        </div>

        {/* ── Analytics Chart ── */}
        {analytics ? (
          <AnalyticsChart
            data={analytics.graphData}
            totalRevenue={analytics.totalRevenue}
            totalCommission={analytics.totalCommission}
            sellerEarnings={analytics.sellerEarnings}
            totalUsers={analytics.totalUsers}
          />
        ) : (
          <div
            className="rounded-2xl p-6 border border-white/10 text-center"
            style={{ background: "rgba(255,255,255,0.04)" }}
          >
            <p className="text-rose-300/50 text-sm">📊 Analytics unavailable</p>
            <p className="text-rose-400/30 text-xs mt-1">Place orders to see revenue data</p>
          </div>
        )}

        {/* ── Low Stock Alert ── */}
        {lowStock.length > 0 && (
          <div className="rounded-2xl p-4 border border-red-800/40" style={{ background: "rgba(127,29,29,0.25)" }}>
            <h3 className="text-sm font-semibold text-red-300 mb-2">⚠️ Low Stock ({lowStock.length})</h3>
            <div className="space-y-2">
              {lowStock.map((p) => (
                <div key={p.id} className="flex justify-between items-center">
                  <span className="text-sm text-rose-200">{p.name}</span>
                  <span className="text-xs bg-red-900/50 text-red-300 px-2 py-0.5 rounded-full">{p.stock} left</span>
                </div>
              ))}
            </div>
            <Link href="/seller/seller/products" className="mt-3 block text-xs text-red-400 text-center">
              Update stock →
            </Link>
          </div>
        )}

        {/* ── Today's Orders ── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-rose-100">Today&apos;s Orders</h2>
            <Link href="/seller/seller/orders" className="text-xs text-rose-400">View all →</Link>
          </div>

          {orders.length === 0 ? (
            <div className="rounded-2xl p-10 text-center border border-rose-800/30"
              style={{ background: "rgba(255,255,255,0.04)" }}>
              <div className="text-4xl mb-2">📭</div>
              <p className="text-rose-300/70 text-sm">No orders today yet</p>
              <p className="text-rose-400/40 text-xs mt-1">New orders will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => {
                const next = NEXT_STATUS[order.status];
                return (
                  <div key={order._id} className="rounded-2xl p-4 border border-rose-800/30"
                    style={{ background: "rgba(255,255,255,0.05)" }}>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-xs text-rose-400/60">#{order._id.slice(-6).toUpperCase()}</p>
                        <p className="font-bold text-rose-50 text-base">₹{order.totalPrice}</p>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLORS[order.status] ?? ""}`}>
                        {STATUS_LABELS[order.status] ?? order.status}
                      </span>
                    </div>
                    <p className="text-sm text-rose-300/60 mb-3 line-clamp-1">
                      {order.items.map((i) => `${getItemName(i)} ×${i.quantity}`).join(", ")}
                    </p>
                    {next && (
                      <button onClick={() => handleStatusUpdate(order._id, next.value)}
                        disabled={updatingOrder === order._id}
                        className="w-full py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 border border-rose-700/40 text-rose-200 hover:bg-rose-900/30">
                        {updatingOrder === order._id ? "Updating…" : next.label}
                      </button>
                    )}

                    {/* ── Delivery OTP (packed orders only) ── */}
                    {order.status === "packed" && (() => {
                      const s = getOtp(order._id);
                      return (
                        <div className="mt-3 rounded-xl p-3 border border-emerald-800/40 space-y-2"
                          style={{ background: "rgba(6,78,59,0.2)" }}>
                          <p className="text-xs font-semibold text-emerald-300 uppercase tracking-wide">🔐 Delivery OTP</p>

                          <button
                            onClick={() => handleGenerateOTP(order._id)}
                            disabled={s.busy}
                            className="w-full py-2 rounded-lg text-xs font-medium border border-emerald-700/50 text-emerald-200 hover:bg-emerald-900/30 transition-all disabled:opacity-50">
                            {s.busy ? "Generating…" : "Generate OTP"}
                          </button>

                          {s.msg && !s.error && (
                            <p className="text-xs text-emerald-400 text-center">{s.msg}</p>
                          )}

                          <div className="flex gap-2">
                            <input
                              type="text"
                              inputMode="numeric"
                              maxLength={6}
                              value={s.input}
                              onChange={(e) => patchOtp(order._id, { input: e.target.value })}
                              placeholder="Enter 6-digit OTP"
                              className="flex-1 rounded-lg px-3 py-2 text-sm bg-black/30 border border-emerald-800/50 text-emerald-100 placeholder-emerald-700 outline-none focus:border-emerald-500"
                            />
                            <button
                              onClick={() => handleVerifyOTP(order._id)}
                              disabled={s.busy || s.input.length !== 6}
                              className="px-3 rounded-lg text-xs font-semibold text-white transition-all disabled:opacity-40"
                              style={{ background: "linear-gradient(135deg,#047857,#059669)" }}>
                              Verify
                            </button>
                          </div>

                          {s.error && (
                            <p className="text-xs text-red-400 text-center">{s.error}</p>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
