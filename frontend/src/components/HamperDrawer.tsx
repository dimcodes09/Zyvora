"use client";

// components/HamperDrawer.tsx
// Enhanced: larger preview hero · qty pulse animation · remove fade-scale ·
//           polished pricing breakdown · item entry stagger
// Logic: unchanged — all state from useHamperContext()

import { useEffect, useRef, useState, useCallback } from "react";
import { useHamperContext } from "@/context/HamperContext";
import HamperPreview from "@/components/HamperPreview";
import type { HamperItem } from "@/hooks/useHamper";

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

// ── Sync pill ─────────────────────────────────────────────────────────────────

function SyncPill({ status }: { status: "idle" | "saving" | "saved" | "error" }) {
  if (status === "idle") return null;
  const map = {
    saving: { label: "Saving…", bg: "rgba(201,123,132,0.15)", color: "#C97B84", pulse: true },
    saved:  { label: "Saved ✓", bg: "rgba(16,185,129,0.12)",  color: "#059669", pulse: false },
    error:  { label: "Error",   bg: "rgba(239,68,68,0.12)",   color: "#dc2626", pulse: false },
  } as const;
  const { label, bg, color, pulse } = map[status];
  return (
    <span
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all duration-300"
      style={{ background: bg, color }}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full shrink-0 ${pulse ? "animate-pulse" : ""}`}
        style={{ background: color }}
      />
      {label}
    </span>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-5 px-8 text-center">
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
        {["top-0 right-0", "bottom-2 left-0"].map((pos, i) => (
          <span key={i} className={`absolute ${pos} text-[10px] opacity-60`}
            style={{ animation: `hamperFloat 2s ease-in-out ${i * 0.5}s infinite alternate` }}>
            ✦
          </span>
        ))}
      </div>
      <div>
        <p className="font-semibold text-[var(--text-dark)] text-base mb-1.5">Your hamper is empty</p>
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

// ── Skeleton ──────────────────────────────────────────────────────────────────

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
  const [removing, setRemoving]   = useState(false);
  // Flash on qty change
  const [qtyFlash, setQtyFlash]   = useState<"up" | "down" | null>(null);
  const isBusy = syncStatus === "saving";

  const handleRemove = useCallback(() => {
    setRemoving(true);
    setTimeout(() => removeItem(item._id), 300);
  }, [item._id, removeItem]);

  const handleQty = (delta: number) => {
    changeQty(item._id, delta);
    setQtyFlash(delta > 0 ? "up" : "down");
    setTimeout(() => setQtyFlash(null), 350);
  };

  return (
    <div
      className="flex gap-3 items-start py-3.5 border-b last:border-b-0"
      style={{
        borderColor: "rgba(201,123,132,0.12)",
        animation: removing
          ? "itemOut 0.3s ease-in forwards"
          : `itemIn 0.4s cubic-bezier(0.34,1.56,0.64,1) ${index * 0.06}s both`,
      }}
    >
      {/* Thumbnail */}
      <div
        className="w-[60px] h-[60px] rounded-xl overflow-hidden shrink-0"
        style={{
          background: "#FAF0F1",
          boxShadow: "0 2px 10px rgba(0,0,0,0.09)",
          transition: "transform 0.2s ease",
        }}
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
        <p className="text-sm font-semibold text-[var(--text-dark)] leading-snug line-clamp-2">
          {item.name}
        </p>
        <p className="text-xs text-[#9B7280] mt-0.5">
          {formatPrice(item.price)} × {item.qty}
        </p>
        <p className="text-sm font-bold mt-0.5" style={{ color: "var(--rose)" }}>
          {formatPrice(item.price * item.qty)}
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col items-end gap-2 shrink-0">
        {/* Qty stepper */}
        <div
          className="flex items-center rounded-full overflow-hidden"
          style={{ border: "1.5px solid rgba(201,123,132,0.25)", background: "rgba(253,240,241,0.8)" }}
        >
          <button
            onClick={() => handleQty(-1)}
            disabled={isBusy}
            aria-label="Decrease"
            className="w-7 h-7 flex items-center justify-center text-[#C97B84] font-bold text-base
                       hover:bg-[rgba(201,123,132,0.15)] active:scale-90 transition-all
                       disabled:opacity-40 disabled:cursor-not-allowed"
          >
            −
          </button>
          <span
            className="w-6 text-center text-sm font-semibold text-[var(--text-dark)]"
            style={{
              transition: "transform 0.2s cubic-bezier(0.34,1.56,0.64,1), color 0.15s",
              transform: qtyFlash === "up"   ? "scale(1.4)"  :
                         qtyFlash === "down" ? "scale(0.85)" : "scale(1)",
              color: qtyFlash ? "var(--rose)" : undefined,
            }}
          >
            {item.qty}
          </span>
          <button
            onClick={() => handleQty(+1)}
            disabled={isBusy}
            aria-label="Increase"
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

// ── Pricing row ───────────────────────────────────────────────────────────────

function PriceRow({ label, value, bold = false, accent = false, muted = false }:
  { label: string; value: string; bold?: boolean; accent?: boolean; muted?: boolean }) {
  return (
    <div className={`flex justify-between items-center ${bold ? "text-[15px]" : "text-sm"}`}>
      <span className={muted ? "text-[#9B7280] text-xs" : bold ? "font-semibold text-[var(--text-dark)]" : "text-[#9B7280]"}>
        {label}
      </span>
      <span
        className={bold ? "font-bold" : muted ? "text-xs text-[#9B7280]" : "font-medium text-[var(--text-dark)]"}
        style={accent ? { color: "var(--rose)", fontSize: "18px" } : undefined}
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

  const isLoading = false; // items come directly from context — no artificial delay needed

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
  const freeDeliveryLeft = 999 - subtotal;

  return (
    <>
      <style>{`
        @keyframes itemIn {
          from { opacity: 0; transform: translateX(18px) scale(0.95); }
          to   { opacity: 1; transform: translateX(0)    scale(1);    }
        }
        @keyframes itemOut {
          from { opacity: 1; transform: translateX(0)    scale(1);    max-height: 120px; padding: 14px 0; }
          to   { opacity: 0; transform: translateX(20px) scale(0.92); max-height: 0;     padding: 0;      }
        }
      `}</style>

      {/* Backdrop */}
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

      {/* Panel */}
      <div
        role="dialog"
        aria-label="Gift Hamper"
        aria-modal="true"
        className="fixed top-0 right-0 h-full z-[9998] flex flex-col"
        style={{
          width: "min(440px, 100vw)",
          background: "white",
          boxShadow: "-4px 0 60px rgba(201,123,132,0.28), -1px 0 0 rgba(201,123,132,0.08)",
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.35s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        {/* ── Header ── */}
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

        {/* ── Hero Preview (larger, more prominent) ── */}
        {!isEmpty && (
          <div
            className="shrink-0 flex flex-col items-center pt-7 pb-5"
            style={{ background: "linear-gradient(180deg,#FDF0F1 0%,rgba(253,240,241,0.4) 100%)" }}
          >
            {/* size=280 makes it noticeably larger than before (was 180) */}
            <HamperPreview items={items} size={280} />
          </div>
        )}

        {/* ── Items / empty / loading ── */}
        {isLoading ? (
          <Skeleton />
        ) : isEmpty ? (
          <EmptyState onClose={closeHamper} />
        ) : (
          <div
            className="flex-1 overflow-y-auto px-5"
            style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(201,123,132,0.3) transparent" }}
          >
            <div className="flex items-center justify-between py-3">
              <p className="text-xs font-bold uppercase tracking-widest text-[#C97B84]">Items</p>
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
            <div className="h-4" />
          </div>
        )}

        {/* ── Pricing + Checkout ── */}
        {!isEmpty && !isLoading && (
          <div
            className="shrink-0 px-5 pt-4 pb-6"
            style={{
              borderTop: "1.5px solid rgba(201,123,132,0.12)",
              background: "white",
              boxShadow: "0 -8px 24px rgba(201,123,132,0.07)",
            }}
          >
            {/* Pricing card */}
            <div
              className="rounded-2xl p-4 mb-3 space-y-2.5"
              style={{ background: "linear-gradient(135deg, #FDF0F1 0%, #FAF5F5 100%)", border: "1px solid rgba(201,123,132,0.15)" }}
            >
              <PriceRow label="Subtotal"        value={formatPrice(subtotal)}  />
              <PriceRow label="Gift packaging"  value={formatPrice(packaging)} muted />

              <div className="h-px" style={{ background: "rgba(201,123,132,0.18)" }} />

              <PriceRow label="Total" value={formatPrice(total)} bold accent />
            </div>

            {/* Free delivery nudge */}
            {freeDeliveryLeft > 0 && (
              <div
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs mb-3"
                style={{ background: "rgba(201,123,132,0.07)", color: "#C97B84" }}
              >
                <span style={{ fontSize: 14 }}>🚚</span>
                <span>
                  Add <strong>{formatPrice(freeDeliveryLeft)}</strong> more for free delivery
                </span>
              </div>
            )}

            {/* CTA */}
            <button
              className="w-full py-3.5 rounded-full text-white text-sm font-semibold
                         active:scale-[0.98] transition-all duration-150
                         disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: "linear-gradient(135deg, #C97B84 0%, #B56870 100%)",
                boxShadow: syncStatus !== "saving" ? "0 6px 20px rgba(201,123,132,0.45)" : "none",
                transition: "box-shadow 0.3s, transform 0.15s",
              }}
              disabled={syncStatus === "saving"}
              onClick={() => { window.location.href = "/checkout?type=hamper"; }}
            >
              {syncStatus === "saving" ? "Saving hamper…" : "Proceed to Checkout →"}
            </button>

            <p className="text-center text-[11px] text-[#9B7280] mt-3">
              🔒 Secure checkout · Handcrafted packaging
            </p>
          </div>
        )}
      </div>
    </>
  );
}