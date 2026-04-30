"use client";

// components/HamperPreview.tsx
// Renders selected items as a visual gift-box collage.
// Handles 0–4+ items with distinct layouts and smooth entry animations.

import type { HamperItem } from "@/hooks/useHamper";

// ── Helpers ───────────────────────────────────────────────────────────────────

const _apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";
const BACKEND_URL = _apiUrl.replace(/\/api\/?$/, "");

function resolveImage(src?: string) {
  if (!src || src.trim() === "") return "/placeholder.png";
  return src.startsWith("http") ? src : `${BACKEND_URL}${src}`;
}

// ── Per-count item positions ──────────────────────────────────────────────────
// Each entry is an absolute-positioned style + rotation for that slot.

type SlotStyle = { top?: string; bottom?: string; left?: string; right?: string; width: string; height: string; rotate: string; zIndex: number };

const SLOTS: Record<number, SlotStyle[]> = {
  1: [
    { top: "50%", left: "50%", width: "56%", height: "56%", rotate: "-4deg",  zIndex: 2 },
  ],
  2: [
    { top: "50%",  left:  "14%", width: "44%", height: "44%", rotate: "-7deg", zIndex: 2 },
    { top: "50%",  right: "14%", width: "44%", height: "44%", rotate:  "5deg", zIndex: 1 },
  ],
  3: [
    { top:    "10%", left: "50%",  width: "42%", height: "42%", rotate: "-5deg", zIndex: 3 },
    { bottom: "10%", left: "10%",  width: "40%", height: "40%", rotate:  "5deg", zIndex: 2 },
    { bottom: "10%", right: "10%", width: "40%", height: "40%", rotate: "-4deg", zIndex: 1 },
  ],
  4: [
    { top:    "8%",  left:  "8%",  width: "44%", height: "44%", rotate: "-7deg", zIndex: 4 },
    { top:    "8%",  right: "8%",  width: "44%", height: "44%", rotate:  "5deg", zIndex: 3 },
    { bottom: "8%",  left:  "8%",  width: "44%", height: "44%", rotate:  "4deg", zIndex: 2 },
    { bottom: "8%",  right: "8%",  width: "44%", height: "44%", rotate: "-5deg", zIndex: 1 },
  ],
};

function slotStyle(s: SlotStyle, center = false): React.CSSProperties {
  const base: React.CSSProperties = {
    position: "absolute",
    width:  s.width,
    height: s.height,
    zIndex: s.zIndex,
    transform: `${center ? "translate(-50%,-50%) " : ""}rotate(${s.rotate})`,
    transition: "all 0.35s cubic-bezier(0.34,1.56,0.64,1)",
  };
  if (s.top)    base.top    = s.top;
  if (s.bottom) base.bottom = s.bottom;
  if (s.left)   base.left   = s.left;
  if (s.right)  base.right  = s.right;
  return base;
}

// ── Sub-components ────────────────────────────────────────────────────────────

/** Decorative CSS bow sitting at top-center of the gift box */
function Bow() {
  return (
    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/3 z-10 flex items-center gap-0">
      {/* Left loop */}
      <div
        className="w-5 h-4 rounded-tl-full rounded-bl-full rounded-tr-none rounded-br-none"
        style={{
          background: "var(--rose)",
          transform: "rotate(-15deg) translateX(2px)",
          opacity: 0.9,
          boxShadow: "inset 0 0 4px rgba(0,0,0,0.15)",
        }}
      />
      {/* Knot */}
      <div
        className="w-3 h-3 rounded-full z-10 shrink-0"
        style={{ background: "var(--rose)", boxShadow: "0 1px 4px rgba(201,123,132,0.6)" }}
      />
      {/* Right loop */}
      <div
        className="w-5 h-4 rounded-tr-full rounded-br-full rounded-tl-none rounded-bl-none"
        style={{
          background: "var(--rose)",
          transform: "rotate(15deg) translateX(-2px)",
          opacity: 0.9,
          boxShadow: "inset 0 0 4px rgba(0,0,0,0.15)",
        }}
      />
    </div>
  );
}

/** Empty preview — ghost box encouraging user to add items */
function EmptyPreview() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 py-6">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl
                   shadow-inner"
        style={{ background: "rgba(201,123,132,0.1)" }}
      >
        🎁
      </div>
      <p className="text-xs text-[#C97B84] font-medium tracking-wide">
        Add items to see your hamper
      </p>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

interface HamperPreviewProps {
  items: HamperItem[];
  /** Rendered width/height of the square preview box. Default 220px. */
  size?: number;
}

export default function HamperPreview({ items, size = 220 }: HamperPreviewProps) {
  const capped    = items.slice(0, 4);           // max 4 shown
  const overflow  = items.length - 4;            // how many hidden
  const count     = Math.min(capped.length, 4);  // 0–4
  const slots     = SLOTS[count] ?? [];

  return (
    <>
      {/* Keyframes injected once */}
      <style>{`
        @keyframes previewItemIn {
          from { opacity: 0; transform: scale(0.7) rotate(var(--r, 0deg)); }
          to   { opacity: 1; transform: scale(1)   rotate(var(--r, 0deg)); }
        }
      `}</style>

      {/* Outer gift-box wrapper */}
      <div
        className="relative mx-auto rounded-3xl overflow-visible shrink-0"
        style={{
          width:  size,
          height: size,
          background: "linear-gradient(145deg, #FDF0F1 0%, #FAE8EB 100%)",
          border: "2px solid rgba(201,123,132,0.25)",
          boxShadow: "0 12px 40px rgba(201,123,132,0.18), inset 0 1px 0 rgba(255,255,255,0.8)",
        }}
      >
        {/* Ribbon — horizontal */}
        <div
          className="absolute top-1/2 left-0 right-0 -translate-y-1/2 pointer-events-none"
          style={{ height: 6, background: "linear-gradient(90deg, rgba(201,123,132,0.4), rgba(201,123,132,0.7), rgba(201,123,132,0.4))" }}
        />
        {/* Ribbon — vertical */}
        <div
          className="absolute left-1/2 top-0 bottom-0 -translate-x-1/2 pointer-events-none"
          style={{ width: 6, background: "linear-gradient(180deg, rgba(201,123,132,0.4), rgba(201,123,132,0.7), rgba(201,123,132,0.4))" }}
        />

        {/* Bow */}
        <Bow />

        {/* Items collage */}
        <div className="absolute inset-3">
          {count === 0 ? (
            <EmptyPreview />
          ) : (
            capped.map((item, i) => {
              const s     = slots[i];
              const isLast = i === 3 && overflow > 0;
              const center = s.top === "50%" || s.left === "50%";

              return (
                <div
                  key={item._id}
                  style={{
                    ...slotStyle(s, center),
                    /* animation */
                    animation: `previewItemIn 0.4s cubic-bezier(0.34,1.56,0.64,1) ${i * 0.06}s both`,
                    "--r": s.rotate,
                  } as React.CSSProperties}
                >
                  <div
                    className="w-full h-full rounded-xl overflow-hidden"
                    style={{
                      boxShadow: "0 4px 16px rgba(0,0,0,0.18), 0 1px 3px rgba(0,0,0,0.1)",
                      border: "2px solid white",
                    }}
                  >
                    <img
                      src={resolveImage(item.image)}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/placeholder.png"; }}
                    />

                    {/* Overflow badge on last visible slot */}
                    {isLast && (
                      <div
                        className="absolute inset-0 flex items-center justify-center rounded-xl"
                        style={{ background: "rgba(61,42,45,0.6)", backdropFilter: "blur(2px)" }}
                      >
                        <span className="text-white font-bold text-lg">
                          +{overflow}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Inner shadow for depth */}
        <div
          className="absolute inset-0 rounded-3xl pointer-events-none"
          style={{ boxShadow: "inset 0 2px 8px rgba(201,123,132,0.12)" }}
        />
      </div>

      {/* Item name strip below box */}
      {items.length > 0 && (
        <p className="text-center text-xs text-[#9B7280] mt-3 font-medium">
          {items.length === 1
            ? items[0].name
            : `${items.length} gift${items.length > 1 ? "s" : ""} in your hamper`}
        </p>
      )}
    </>
  );
}