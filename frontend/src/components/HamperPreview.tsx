"use client";

// components/HamperPreview.tsx
// Enhanced: breathing float animation, staggered entry, larger hero presence.
// Logic/structure unchanged — only CSS/animation layer added.

import type { HamperItem } from "@/hooks/useHamper";

const _apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";
const BACKEND_URL = _apiUrl.replace(/\/api\/?$/, "");

function resolveImage(src?: string) {
  if (!src || src.trim() === "") return "/placeholder.png";
  return src.startsWith("http") ? src : `${BACKEND_URL}${src}`;
}

type SlotStyle = {
  top?: string; bottom?: string; left?: string; right?: string;
  width: string; height: string; rotate: string; zIndex: number;
  // float direction per slot so items drift independently
  floatX: number; floatY: number;
  // explicit centering flags
  centerX?: boolean; centerY?: boolean;
};

// Each slot gets a unique float vector so items breathe independently
const SLOTS: Record<number, SlotStyle[]> = {
  1: [
    // Single item: centered both axes
    { top: "50%", left: "50%", width: "58%", height: "58%", rotate: "-3deg", zIndex: 2, floatX: 0, floatY: -5, centerX: true, centerY: true },
  ],
  2: [
    // Two items side by side, positioned explicitly (no centering needed)
    { top: "27%", left: "4%",  width: "46%", height: "46%", rotate: "-7deg", zIndex: 2, floatX: -3, floatY: -5 },
    { top: "27%", right: "4%", width: "46%", height: "46%", rotate:  "5deg", zIndex: 1, floatX:  3, floatY: -4 },
  ],
  3: [
    // Top center: center X only
    { top:    "8%",  left: "50%",  width: "44%", height: "44%", rotate: "-5deg", zIndex: 3, floatX:  0, floatY: -6, centerX: true },
    { bottom: "8%",  left:  "8%",  width: "42%", height: "42%", rotate:  "5deg", zIndex: 2, floatX: -4, floatY: -4 },
    { bottom: "8%",  right: "8%",  width: "42%", height: "42%", rotate: "-4deg", zIndex: 1, floatX:  4, floatY: -5 },
  ],
  4: [
    { top:    "6%", left:  "6%",  width: "46%", height: "46%", rotate: "-7deg", zIndex: 4, floatX: -3, floatY: -5 },
    { top:    "6%", right: "6%",  width: "46%", height: "46%", rotate:  "5deg", zIndex: 3, floatX:  3, floatY: -6 },
    { bottom: "6%", left:  "6%",  width: "46%", height: "46%", rotate:  "4deg", zIndex: 2, floatX: -4, floatY: -4 },
    { bottom: "6%", right: "6%",  width: "46%", height: "46%", rotate: "-5deg", zIndex: 1, floatX:  4, floatY: -5 },
  ],
};

function slotStyle(s: SlotStyle): React.CSSProperties {
  const translateX = s.centerX ? "-50%" : "0";
  const translateY = s.centerY ? "-50%" : "0";
  const translatePart = (s.centerX || s.centerY) ? `translate(${translateX},${translateY}) ` : "";
  const base: React.CSSProperties = {
    position: "absolute",
    width: s.width,
    height: s.height,
    zIndex: s.zIndex,
    transform: `${translatePart}rotate(${s.rotate})`,
    transition: "all 0.4s cubic-bezier(0.34,1.56,0.64,1)",
  };
  if (s.top)    base.top    = s.top;
  if (s.bottom) base.bottom = s.bottom;
  if (s.left)   base.left   = s.left;
  if (s.right)  base.right  = s.right;
  return base;
}

function Bow({ size }: { size: number }) {
  const scale = size / 220;
  return (
    <div
      className="absolute left-1/2 z-10 flex items-center gap-0"
      style={{
        top: 0,
        transform: "translateX(-50%) translateY(-38%)",
      }}
    >
      <div style={{
        width: 22 * scale, height: 17 * scale,
        borderRadius: "50% 0 0 50%",
        background: "var(--rose)",
        transform: "rotate(-15deg) translateX(2px)",
        opacity: 0.92,
        boxShadow: "inset 0 0 5px rgba(0,0,0,0.18)",
      }} />
      <div style={{
        width: 13 * scale, height: 13 * scale,
        borderRadius: "50%",
        background: "var(--rose)",
        boxShadow: "0 1px 6px rgba(201,123,132,0.7)",
        zIndex: 1,
      }} />
      <div style={{
        width: 22 * scale, height: 17 * scale,
        borderRadius: "0 50% 50% 0",
        background: "var(--rose)",
        transform: "rotate(15deg) translateX(-2px)",
        opacity: 0.92,
        boxShadow: "inset 0 0 5px rgba(0,0,0,0.18)",
      }} />
    </div>
  );
}

function EmptyPreview() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 py-6">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
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

interface HamperPreviewProps {
  items: HamperItem[];
  size?: number;
}

export default function HamperPreview({ items, size = 260 }: HamperPreviewProps) {
  const capped   = items.slice(0, 4);
  const overflow = items.length - 4;
  const count    = Math.min(capped.length, 4);
  const slots    = SLOTS[count] ?? [];

  return (
    <>
      <style>{`
        @keyframes previewItemIn {
          from { opacity: 0; transform: scale(0.65) rotate(var(--r, 0deg)); }
          to   { opacity: 1; transform: scale(1)    rotate(var(--r, 0deg)); }
        }
        /* Each slot gets a named float animation so they drift independently */
        @keyframes floatA {
          0%,100% { transform: var(--base-transform) translate(0px, 0px); }
          50%     { transform: var(--base-transform) translate(var(--fx), var(--fy)); }
        }
        .preview-item { animation: previewItemIn 0.45s cubic-bezier(0.34,1.56,0.64,1) var(--delay, 0s) both; }
        .preview-item-float {
          animation:
            previewItemIn 0.45s cubic-bezier(0.34,1.56,0.64,1) var(--delay, 0s) both,
            floatA var(--dur, 3s) ease-in-out var(--fdelay, 0s) infinite;
        }
        .preview-img-wrap {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .preview-img-wrap:hover {
          transform: scale(1.06) !important;
          box-shadow: 0 8px 28px rgba(0,0,0,0.24), 0 2px 6px rgba(0,0,0,0.12) !important;
        }
      `}</style>

      {/* Gift box */}
      <div
        className="relative mx-auto rounded-3xl overflow-visible shrink-0"
        style={{
          width: size,
          height: size,
          background: "linear-gradient(145deg, #FDF0F1 0%, #FAE8EB 100%)",
          border: "2px solid rgba(201,123,132,0.28)",
          boxShadow: "0 16px 56px rgba(201,123,132,0.22), inset 0 1px 0 rgba(255,255,255,0.85)",
        }}
      >
        {/* Ribbon H */}
        <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 pointer-events-none"
          style={{ height: 7, background: "linear-gradient(90deg, rgba(201,123,132,0.35), rgba(201,123,132,0.65), rgba(201,123,132,0.35))" }}
        />
        {/* Ribbon V */}
        <div className="absolute left-1/2 top-0 bottom-0 -translate-x-1/2 pointer-events-none"
          style={{ width: 7, background: "linear-gradient(180deg, rgba(201,123,132,0.35), rgba(201,123,132,0.65), rgba(201,123,132,0.35))" }}
        />

        <Bow size={size} />

        {/* Collage */}
        <div className="absolute inset-3">
          {count === 0 ? (
            <EmptyPreview />
          ) : (
            capped.map((item, i) => {
              const s      = slots[i];
              const isLast = i === 3 && overflow > 0;

              // Build CSS custom props for the float animation
              const floatDur   = 2.8 + i * 0.4;     // staggered speed
              const floatDelay = i * 0.6;
              const translateX = s.centerX ? "-50%" : "0";
              const translateY = s.centerY ? "-50%" : "0";
              const translatePart = (s.centerX || s.centerY) ? `translate(${translateX},${translateY}) ` : "";
              const baseTransform = `${translatePart}rotate(${s.rotate})`;

              return (
                <div
                  key={item._id}
                  className="preview-item-float"
                  style={{
                    ...slotStyle(s),
                    "--delay":          `${i * 0.07}s`,
                    "--r":              s.rotate,
                    "--base-transform": baseTransform,
                    "--fx":             `${s.floatX}px`,
                    "--fy":             `${s.floatY}px`,
                    "--dur":            `${floatDur}s`,
                    "--fdelay":         `${floatDelay}s`,
                  } as React.CSSProperties}
                >
                  <div
                    className="preview-img-wrap w-full h-full rounded-xl overflow-hidden"
                    style={{
                      boxShadow: "0 5px 20px rgba(0,0,0,0.2), 0 1px 4px rgba(0,0,0,0.1)",
                      border: "2.5px solid white",
                    }}
                  >
                    <img
                      src={resolveImage(item.image)}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/placeholder.png"; }}
                    />

                    {isLast && (
                      <div
                        className="absolute inset-0 flex items-center justify-center rounded-xl"
                        style={{ background: "rgba(61,16,16,0.58)", backdropFilter: "blur(3px)" }}
                      >
                        <span className="text-white font-bold" style={{ fontSize: size * 0.1 }}>
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

        {/* Inner glow rim */}
        <div
          className="absolute inset-0 rounded-3xl pointer-events-none"
          style={{ boxShadow: "inset 0 2px 10px rgba(201,123,132,0.14)" }}
        />
      </div>

      {items.length > 0 && (
        <p className="text-center text-xs text-[#9B7280] mt-3.5 font-medium tracking-wide">
          {items.length === 1
            ? items[0].name
            : `${items.length} gifts in your hamper`}
        </p>
      )}
    </>
  );
}