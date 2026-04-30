"use client";

// components/HamperDrawer.tsx  (enhanced)
// ─── LOGIC: unchanged — all state comes from useHamperContext()
// ─── UX:    HamperPreview header · item entry animations · live pricing

import { useEffect, useRef, useState, useCallback } from "react";
import { useHamperContext } from "@/context/HamperContext";
import HamperPreview from "@/components/HamperPreview";
import type { HamperItem } from "@/hooks/useHamper";

// ── Helpers ───────────────────────────────────────────────────────────────────

const _apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";
const BACKEND_URL = _apiUrl.replace(/\/api\/?$/, "");

function resolveImage(src?: string) {
  if (!src || src.trim() === "") return "/placeholder.png";
  return src.startsWith("http") ? src : `${BACKEND_URL}${src}`;
}

function formatPrice(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency", currency: "INR", maximumFractionDigits: 0,
  }).format(n);
}

// ── Sync indicator ────────────────────────────────────────────────────────────

function SyncPill({ status }: { status: "idle" | "saving" | "saved" | "error" }) {
  if (status === "idle") return null;

  const map = {
    saving: { label: "Saving…",   bg: "rgba(201,123,132,0.15)", color: "#C97B84",   dot: "bg-[#C97B84] animate-pulse" },
    saved:  { label: "Saved ✓",   bg: "rgba(16,185,129,0.12)",  color: "#059669",   dot: "bg-emerald-500" },
    error:  { label: "Error",     bg: "rgba(239,68,68,0.12)",   color: "#dc2626",   dot: "bg-red-400" },
  } as const;

  const { label, bg, color, dot } = map[status];

  return (
    <span
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all duration-300"
      style={{ background: bg, color }}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dot}`} />
      {label}
    </span>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-5 px-8 text-center">
      {/* Illustrated empty box */}
      <div className="relative">
        <div
          className="w-24 h-24 rounded-2xl flex items-center justify-center text-4xl"
          style={{
            background: "linear-gradient(145deg,#FDF0F1,#FAE8EB)",
            border: "2px dashed rgba(201,123,132,0.35)",
            boxShadow: "0 8px 24px rgba(201,123,132,0.12)",
          }}
        >
          🎁
        </div>
        {/* Floating sparkles */}
        {["top-0 right-0", "bottom-2 left-0"].map((pos, i) => (
          <span key={i} className={`absolute ${pos} text-[10px] opacity-60`}
            style={{ animation: `hamperFloat 2s ease-in-out ${i * 0.5}s infinite alternate` }}>
            ✦
          </span>
        ))}
      </div>

      <div>
        <p className="font-semibold text-[var(--text-dark)] text-base mb-1.5">
          Your hamper is empty
        </p>
        <p className="text-sm text-[#9B7280] leading-relaxed max-w-[200px]">
          Browse our collection and curate the perfect gift set.
        </p>
      </div>

      <button
        onClick={onClose}
        className="px-6 py-2.5 rounded-full text-sm font-semibold text-white
                   hover:opacity-90 active:scale-95 transition-all duration-150
                   shadow-[0_4px_16px_rgba(201,123,132,0.4)]"
        style={{ background: "var(--rose)" }}
      >
        Browse Products
      </button>

      <style>{`
        @keyframes hamperFloat {
          from { transform: translateY(0) scale(1); }
          to   { transform: translateY(-4px) scale(1.2); }
        }
      `}</style>
    </div>
  );
}

// ── Skeleton loader ───────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="flex flex-col gap-3.5 px-5 py-5">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex gap-3 items-center animate-pulse">
          <div className="w-16 h-16 rounded-xl shrink-0" style={{ background: "#F5E8EA" }} />
          <div className="flex-1 flex flex-col gap-2">
            <div className="h-2.5 w-2/3 rounded-full" style={{ background: "#F5E8EA" }} />
            <div className="h-2.5 w-1/3 rounded-full" style={{ background: "#F5E8EA" }} />
            <div className="h-2.5 w-1/4 rounded-full" style={{ background: "#F5E8EA" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Item row ──────────────────────────────────────────────────────────────────

interface ItemRowProps { item: HamperItem; index: number; }

function ItemRow({ item, index }: ItemRowProps) {
  const { changeQty, removeItem, syncStatus } = useHamperContext();
  const [removing, setRemoving] = useState(false);
  const isBusy = syncStatus === "saving";

  const handleRemove = useCallback(() => {
    setRemoving(true);
    // Wait for exit animation then remove
    setTimeout(() => removeItem(item._id), 280);
  }, [item._id, removeItem]);

  return (
    <div
      className="flex gap-3 items-start py-4 border-b last:border-b-0"
      style={{
        borderColor: "rgba(201,123,132,0.1)",
        /* Entry animation — staggered by index */
        animation: `hamperItemIn 0.4s cubic-bezier(0.34,1.56,0.64,1) ${index * 0.07}s both`,
        /* Exit animation */
        ...(removing ? {
          animation: "hamperItemOut 0.28s ease-in forwards",
        } : {}),
      }}
    >
      {/* Image */}
      <div
        className="w-16 h-16 rounded-xl overflow-hidden shrink-0 transition-transform duration-200 hover:scale-105"
        style={{ background: "#FAF0F1", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}
      >
        <img
          src={resolveImage(item.image)}
          alt={item.name}
          className="w-full h-full object-cover"
          onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/placeholder.png"; }}
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-[9px] font-bold tracking-widest uppercase text-[#C97B84] mb-0.5">
          {item.category}
        </p>
        <p className="text-sm font-semibold text-[var(--text-dark)] leading-snug line-clamp-2 mb-1">
          {item.name}
        </p>

        {/* Unit price */}
        <p className="text-xs text-[#9B7280]">
          {formatPrice(item.price)} × {item.qty}
        </p>

        {/* Line total */}
        <p className="text-sm font-bold mt-0.5" style={{ color: "var(--rose)" }}>
          {formatPrice(item.price * item.qty)}
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col items-end gap-2.5 shrink-0">
        {/* Stepper */}
        <div
          className="flex items-center rounded-full overflow-hidden"
          style={{
            border: "1.5px solid rgba(201,123,132,0.25)",
            background: "var(--rose-blush)",
          }}
        >
          <button
            onClick={() => changeQty(item._id, -1)}
            disabled={isBusy}
            aria-label="Decrease quantity"
            className="w-7 h-7 flex items-center justify-center text-[#C97B84] font-bold text-base
                       hover:bg-[rgba(201,123,132,0.15)] active:scale-90 transition-all
                       disabled:opacity-40 disabled:cursor-not-allowed"
          >
            −
          </button>
          <span className="w-6 text-center text-sm font-semibold text-[var(--text-dark)]">
            {item.qty}
          </span>
          <button
            onClick={() => changeQty(item._id, +1)}
            disabled={isBusy}
            aria-label="Increase quantity"
            className="w-7 h-7 flex items-center justify-center text-[#C97B84] font-bold text-base
                       hover:bg-[rgba(201,123,132,0.15)] active:scale-90 transition-all
                       disabled:opacity-40 disabled:cursor-not-allowed"
          >
            +
          </button>
        </div>

        {/* Remove */}
        <button
          onClick={handleRemove}
          disabled={isBusy || removing}
          aria-label={`Remove ${item.name}`}
          className="text-[11px] text-[#C97B84]/50 hover:text-red-400 transition-colors
                     underline underline-offset-2 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Remove
        </button>
      </div>
    </div>
  );
}

// ── Price row helper ──────────────────────────────────────────────────────────

function PriceRow({
  label, value, bold = false, accent = false,
}: { label: string; value: string; bold?: boolean; accent?: boolean }) {
  return (
    <div className={`flex justify-between items-center ${bold ? "text-base" : "text-sm"}`}>
      <span className={bold ? "font-semibold text-[var(--text-dark)]" : "text-[#9B7280]"}>
        {label}
      </span>
      <span
        className={bold ? "font-bold" : "font-medium text-[var(--text-dark)]"}
        style={accent ? { color: "var(--rose)" } : undefined}
      >
        {value}
      </span>
    </div>
  );
}

// ── Main Drawer ───────────────────────────────────────────────────────────────

export default function HamperDrawer() {
  const {
    isOpen, closeHamper,
    items, syncStatus,
    subtotal, packaging, total, itemCount,
    clearHamper,
  } = useHamperContext();

  const [isLoading, setIsLoading] = useState(true);

  // Simulate initial load settling (matches useHamper's async fetch)
  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  // Body scroll lock
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // Escape key
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") closeHamper(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [closeHamper]);

  const isEmpty = items.length === 0;

  return (
    <>
      {/* ── Global keyframes ── */}
      <style>{`
        @keyframes hamperItemIn {
          from { opacity: 0; transform: translateX(20px) scale(0.95); }
          to   { opacity: 1; transform: translateX(0)    scale(1);    }
        }
        @keyframes hamperItemOut {
          from { opacity: 1; transform: translateX(0)    scale(1)    max-height: 100px; }
          to   { opacity: 0; transform: translateX(24px) scale(0.9); max-height: 0; }
        }
        @keyframes drawerIn {
          from { opacity: 0; transform: translateX(100%); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>

      {/* ── Backdrop ── */}
      <div
        onClick={closeHamper}
        aria-hidden="true"
        className="fixed inset-0 z-[9997] transition-opacity duration-300"
        style={{
          background: "rgba(30,10,12,0.45)",
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
        }}
      />

      {/* ── Drawer panel ── */}
      <div
        role="dialog"
        aria-label="Gift Hamper"
        aria-modal="true"
        className="fixed top-0 right-0 h-full z-[9998] bg-white flex flex-col"
        style={{
          width: "min(440px, 100vw)",
          boxShadow: "-4px 0 60px rgba(201,123,132,0.25), -1px 0 0 rgba(201,123,132,0.08)",
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.35s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        {/* ──── HEADER ──── */}
        <div
          className="shrink-0 px-5 py-4 flex items-center justify-between"
          style={{
            background: "linear-gradient(135deg, #C97B84 0%, #B56870 100%)",
            boxShadow: "0 2px 16px rgba(201,123,132,0.35)",
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-xl">
              🎁
            </div>
            <div>
              <p className="text-white font-semibold text-sm leading-tight">My Hamper</p>
              <p className="text-white/70 text-xs">
                {itemCount === 0 ? "No items yet" : `${itemCount} item${itemCount !== 1 ? "s" : ""} curated`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <SyncPill status={syncStatus} />
            <button
              onClick={closeHamper}
              aria-label="Close hamper"
              className="w-8 h-8 rounded-full flex items-center justify-center
                         bg-white/20 hover:bg-white/35 text-white text-sm
                         transition-colors active:scale-95"
            >
              ✕
            </button>
          </div>
        </div>

        {/* ──── HAMPER PREVIEW ──── */}
        {!isEmpty && (
          <div
            className="shrink-0 py-6 px-5"
            style={{ background: "linear-gradient(180deg,#FDF0F1 0%,white 100%)" }}
          >
            <HamperPreview items={items} size={180} />
          </div>
        )}

        {/* ──── ITEMS / EMPTY / LOADING ──── */}
        {isLoading ? (
          <Skeleton />
        ) : isEmpty ? (
          <EmptyState onClose={closeHamper} />
        ) : (
          <div
            className="flex-1 overflow-y-auto px-5"
            style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(201,123,132,0.3) transparent" }}
          >
            {/* Section label */}
            <div className="flex items-center justify-between py-3">
              <p className="text-xs font-bold uppercase tracking-widest text-[#C97B84]">
                Items
              </p>
              <button
                onClick={clearHamper}
                disabled={syncStatus === "saving"}
                className="text-[11px] text-[#C97B84]/50 hover:text-red-400 transition-colors
                           underline underline-offset-2 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Clear all
              </button>
            </div>

            {items.map((item, i) => (
              <ItemRow key={item._id} item={item} index={i} />
            ))}

            {/* Breathing room above sticky footer */}
            <div className="h-4" />
          </div>
        )}

        {/* ──── PRICING + CHECKOUT ──── */}
        {!isEmpty && !isLoading && (
          <div
            className="shrink-0 px-5 pt-4 pb-6 space-y-4"
            style={{
              borderTop: "1.5px solid rgba(201,123,132,0.12)",
              background: "white",
              boxShadow: "0 -8px 24px rgba(201,123,132,0.07)",
            }}
          >
            {/* Pricing breakdown */}
            <div className="space-y-2">
              <PriceRow label="Subtotal"       value={formatPrice(subtotal)}  />
              <PriceRow label="Gift packaging" value={formatPrice(packaging)} />

              {/* Divider */}
              <div className="h-px" style={{ background: "rgba(201,123,132,0.12)" }} />

              <PriceRow label="Total" value={formatPrice(total)} bold accent />
            </div>

            {/* Free delivery nudge */}
            {subtotal < 999 && (
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs"
                style={{ background: "rgba(201,123,132,0.08)", color: "#C97B84" }}
              >
                <span>🚚</span>
                <span>
                  Add <strong>{formatPrice(999 - subtotal)}</strong> more for free delivery
                </span>
              </div>
            )}

            {/* Checkout CTA */}
            <button
              className="w-full py-3.5 rounded-full text-white text-sm font-semibold
                         active:scale-[0.98] transition-all duration-150
                         disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: "linear-gradient(135deg, #C97B84 0%, #B56870 100%)",
                boxShadow: syncStatus !== "saving"
                  ? "0 6px 20px rgba(201,123,132,0.45)"
                  : "none",
                transition: "box-shadow 0.3s, transform 0.15s",
              }}
              disabled={syncStatus === "saving"}
              onClick={() => { window.location.href = "/checkout?type=hamper"; }}
            >
              {syncStatus === "saving" ? "Saving hamper…" : "Proceed to Checkout →"}
            </button>

            <p className="text-center text-[11px] text-[#9B7280]">
              🔒 Secure checkout · Handcrafted packaging
            </p>
          </div>
        )}
      </div>
    </>
  );
}