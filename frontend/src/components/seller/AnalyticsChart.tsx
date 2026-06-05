"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { GraphPoint } from "@/services/sellerApi";

interface Props {
  data: GraphPoint[];
  totalRevenue: number;
  totalCommission: number;
  sellerEarnings: number;
  totalUsers: number;
}

const fmt = (v: number) =>
  v >= 1000 ? `₹${(v / 1000).toFixed(1)}k` : `₹${v}`;

// Custom tooltip
const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { color: string; name: string; value: number }[];
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-xl px-4 py-3 shadow-xl border border-white/10 text-xs space-y-1"
      style={{ background: "rgba(30,8,20,0.95)" }}
    >
      <p className="text-rose-300 font-semibold mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: <span className="font-bold">₹{p.value.toLocaleString()}</span>
        </p>
      ))}
    </div>
  );
};

export default function AnalyticsChart({
  data,
  totalRevenue,
  totalCommission,
  sellerEarnings,
  totalUsers,
}: Props) {
  const summaryCards = [
    { label: "Total Revenue",   value: fmt(totalRevenue),    color: "#f43f5e", icon: "💹" },
    { label: "Your Earnings",   value: fmt(sellerEarnings),  color: "#22d3ee", icon: "💰" },
    { label: "Platform Fee",    value: fmt(totalCommission), color: "#a78bfa", icon: "🏛️" },
    { label: "Unique Viewers",  value: String(totalUsers),   color: "#34d399", icon: "👥" },
  ];

  return (
    <div className="space-y-4">

      {/* ── Summary KPI row ── */}
      <div className="grid grid-cols-2 gap-3">
        {summaryCards.map((c) => (
          <div
            key={c.label}
            className="rounded-2xl p-4 border border-white/10"
            style={{ background: "rgba(255,255,255,0.05)" }}
          >
            <div className="text-xl mb-1">{c.icon}</div>
            <div className="text-lg font-bold" style={{ color: c.color }}>
              {c.value}
            </div>
            <div className="text-xs text-rose-300/50 mt-0.5">{c.label}</div>
          </div>
        ))}
      </div>

      {/* ── Area Chart ── */}
      <div
        className="rounded-2xl p-4 border border-white/10"
        style={{ background: "rgba(255,255,255,0.05)" }}
      >
        <h3 className="text-sm font-semibold text-rose-100 mb-4">
          📊 Weekly Revenue Breakdown
        </h3>

        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
            <defs>
              <linearGradient id="sellerGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#f43f5e" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}    />
              </linearGradient>
              <linearGradient id="platformGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#a78bfa" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#a78bfa" stopOpacity={0}   />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />

            <XAxis
              dataKey="date"
              tick={{ fill: "#fda4af", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(v: number) => fmt(v)}
              tick={{ fill: "#fda4af", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />

            <Tooltip content={<CustomTooltip />} />

            <Legend
              wrapperStyle={{ fontSize: 11, color: "#fda4af", paddingTop: 12 }}
              formatter={(value) =>
                value === "seller" ? "Your Earnings" : "Platform Fee"
              }
            />

            <Area
              type="monotone"
              dataKey="seller"
              name="seller"
              stroke="#f43f5e"
              strokeWidth={2}
              fill="url(#sellerGrad)"
              dot={{ fill: "#f43f5e", r: 3, strokeWidth: 0 }}
              activeDot={{ r: 5 }}
            />
            <Area
              type="monotone"
              dataKey="platform"
              name="platform"
              stroke="#a78bfa"
              strokeWidth={2}
              fill="url(#platformGrad)"
              dot={{ fill: "#a78bfa", r: 3, strokeWidth: 0 }}
              activeDot={{ r: 5 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
