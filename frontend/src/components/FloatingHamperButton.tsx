"use client";

// components/FloatingHamperButton.tsx

import { useHamperContext } from "@/context/HamperContext";

export default function FloatingHamperButton() {
  const { itemCount, openHamper, isOpen } = useHamperContext();

  return (
    <button
      onClick={openHamper}
      aria-label={`Open hamper${itemCount > 0 ? ` — ${itemCount} item${itemCount > 1 ? "s" : ""}` : ""}`}
      className="fixed bottom-24 right-6 z-[9998] w-14 h-14 rounded-full flex items-center justify-center
                 shadow-[0_8px_32px_rgba(201,123,132,0.45)] hover:shadow-[0_12px_48px_rgba(201,123,132,0.6)]
                 hover:scale-110 active:scale-95 transition-all duration-200 select-none"
      style={{ background: "var(--rose)" }}
    >
      {/* Basket icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>

      {/* Count badge */}
      {itemCount > 0 && (
        <span
          className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full
                     bg-emerald-500 text-white text-[11px] font-bold
                     flex items-center justify-center shadow-sm pointer-events-none
                     transition-transform duration-200"
          style={{ transform: itemCount > 0 ? "scale(1)" : "scale(0)" }}
        >
          {itemCount > 9 ? "9+" : itemCount}
        </span>
      )}

      {/* Pulse ring — visible when hamper has items and drawer is closed */}
      {itemCount > 0 && !isOpen && (
        <span
          aria-hidden
          className="absolute inset-0 rounded-full animate-ping opacity-20 pointer-events-none"
          style={{ background: "var(--rose)" }}
        />
      )}
    </button>
  );
}