"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useZyvoraChat, type ChatMsg, type ChatProduct } from "@/hooks/useZyvoraChat";

// ── Constants ─────────────────────────────────────────────────────────────────

const _apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";
const BACKEND_URL = _apiUrl.replace(/\/api\/?$/, "");

const SUGGESTION_CHIPS = [
  "Birthday gift under ₹2000",
  "Anniversary surprise",
  "Wedding gift ideas",
  "Something unique",
] as const;

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
}

function resolveImage(src?: string) {
  if (!src || src.trim() === "") return "/placeholder.png";
  return src.startsWith("http") ? src : `${BACKEND_URL}${src}`;
}

// ── Product Card ──────────────────────────────────────────────────────────────

function ChatProductCard({ product }: { product: ChatProduct }) {
  return (
    <a
      href={`/products/${product._id}`}
      className="flex items-center gap-3 bg-white rounded-2xl p-2.5 border border-rose-100
                 hover:shadow-md hover:border-[#C97B84]/40 transition-all duration-200 group"
    >
      <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-[#FAF0F1]">
        <img
          src={resolveImage(product.image)}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = "/placeholder.png";
          }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[9px] font-bold tracking-widest uppercase text-[#C97B84] mb-0.5">
          {product.category}
        </p>
        <p className="text-xs font-semibold text-[#3D2A2D] truncate leading-snug">
          {product.name}
        </p>
        <p className="text-sm font-bold text-[#C97B84] mt-0.5">
          {formatPrice(product.price)}
        </p>
      </div>
      <span className="text-[#C97B84] text-base pr-1 opacity-0 group-hover:opacity-100 transition-opacity">
        ›
      </span>
    </a>
  );
}

// ── Message Bubble ────────────────────────────────────────────────────────────

function MessageBubble({ msg }: { msg: ChatMsg }) {
  if (msg.role === "user") {
    return (
      <div
        className="text-sm leading-relaxed px-4 py-2 rounded-[18px] max-w-[82%] self-end text-white"
        style={{ background: "var(--rose)", borderBottomRightRadius: 4 }}
      >
        {msg.text}
      </div>
    );
  }

  if (msg.kind === "products") {
    return (
      <div className="self-start max-w-full w-full">
        <p className="text-xs text-[#9B7280] mb-2 ml-1">Top picks for you ✨</p>
        <div className="flex flex-col gap-2">
          {msg.products.map((p) => (
            <ChatProductCard key={p._id} product={p} />
          ))}
        </div>
        <p className="text-xs text-[#9B7280] mt-2 ml-1">Tap any to view details 🛍️</p>
      </div>
    );
  }

  return (
    <div
      className="text-sm leading-relaxed px-4 py-2 rounded-[18px] max-w-[82%] self-start"
      style={{
        background: "var(--rose-blush)",
        color: "var(--text-dark)",
        borderBottomLeftRadius: 4,
      }}
    >
      {msg.text}
    </div>
  );
}

// ── Typing indicator ──────────────────────────────────────────────────────────

function TypingDots() {
  return (
    <div
      role="status"
      aria-label="Zyvora AI is thinking"
      className="flex gap-1 px-4 py-2.5 rounded-[18px] w-fit self-start"
      style={{ background: "var(--rose-blush)" }}
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-[#C97B84] inline-block"
          style={{
            animation: `zyv-bounce 1s ease-in-out ${i * 0.15}s infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes zyv-bounce {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-5px); }
        }
      `}</style>
    </div>
  );
}

// ── Main FloatingChat ─────────────────────────────────────────────────────────

export default function FloatingChat() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const { messages, isLoading, sendMessage } = useZyvoraChat();
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Auto-focus input when popup opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 120);
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const onClickOut = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        // Don't close if clicking the toggle button itself (handled separately)
        const btn = document.getElementById("zyv-float-btn");
        if (btn && btn.contains(e.target as Node)) return;
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOut);
    return () => document.removeEventListener("mousedown", onClickOut);
  }, [open]);

  const send = useCallback(() => {
    const query = input.trim();
    if (!query || isLoading) return;
    setInput("");
    sendMessage(query);
  }, [input, isLoading, sendMessage]);

  const handleChip = (chip: string) => {
    setInput(chip);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  return (
    <>
      {/* ── Floating Toggle Button ── */}
      <button
        id="zyv-float-btn"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close gift finder" : "Open AI gift finder"}
        className="fixed bottom-6 right-6 z-[9999] w-14 h-14 rounded-full flex items-center justify-center
                   shadow-[0_8px_32px_rgba(201,123,132,0.45)] hover:shadow-[0_12px_40px_rgba(201,123,132,0.6)]
                   hover:scale-110 active:scale-95 transition-all duration-200 select-none"
        style={{ background: "var(--rose)" }}
      >
        <span
          className="text-white text-xl transition-transform duration-300"
          style={{ transform: open ? "rotate(45deg)" : "rotate(0deg)" }}
        >
          {open ? "✕" : "✦"}
        </span>

        {/* Pulse ring (only when closed) */}
        {!open && (
          <span
            aria-hidden
            className="absolute inset-0 rounded-full animate-ping opacity-30"
            style={{ background: "var(--rose)" }}
          />
        )}
      </button>

      {/* ── Unread badge (shows when closed & has messages) ── */}
      {!open && messages.length > 1 && (
        <span
          className="fixed bottom-[4.5rem] right-5 z-[9999] w-5 h-5 rounded-full bg-emerald-500
                     text-white text-[10px] font-bold flex items-center justify-center
                     shadow-md pointer-events-none"
        >
          {Math.min(messages.length - 1, 9)}
        </span>
      )}

      {/* ── Popup ── */}
      <div
        ref={popupRef}
        role="dialog"
        aria-label="Zyvora AI Gift Finder"
        aria-modal="true"
        className="fixed bottom-24 right-6 z-[9998] w-[350px] rounded-[20px] overflow-hidden
                   border shadow-[0_24px_64px_rgba(201,123,132,0.25)] bg-white
                   origin-bottom-right transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
        style={{
          borderColor: "rgba(201,123,132,0.15)",
          // Scale + opacity animation via inline style toggling
          transform: open ? "scale(1) translateY(0)" : "scale(0.85) translateY(16px)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          maxHeight: "calc(100vh - 7rem)",
        }}
      >
        {/* ── Header ── */}
        <div
          className="flex items-center justify-between px-4 py-3 shrink-0"
          style={{ background: "var(--rose)" }}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white/25 text-white text-sm">
              ✦
            </div>
            <div>
              <p className="text-white text-sm font-semibold leading-tight">Zyvora AI</p>
              <p className="text-white/70 text-[11px]">Your personal gift curator</p>
            </div>
          </div>

          <button
            onClick={() => setOpen(false)}
            aria-label="Close chat"
            className="w-7 h-7 rounded-full flex items-center justify-center bg-white/20
                       hover:bg-white/35 text-white text-sm transition-colors"
          >
            ✕
          </button>
        </div>

        {/* ── Messages ── */}
        <div
          className="flex flex-col gap-3 px-4 py-4 overflow-y-auto"
          style={{
            minHeight: "260px",
            maxHeight: "340px",
            // Custom scrollbar
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(201,123,132,0.3) transparent",
          }}
        >
          {messages.map((msg, i) => (
            <MessageBubble key={i} msg={msg} />
          ))}

          {isLoading && <TypingDots />}

          <div ref={bottomRef} />
        </div>

        {/* ── Suggestion chips (only on first open) ── */}
        {messages.length <= 1 && !isLoading && (
          <div className="px-4 pb-2 flex flex-wrap gap-1.5">
            {SUGGESTION_CHIPS.map((chip) => (
              <button
                key={chip}
                onClick={() => handleChip(chip)}
                className="text-[11px] px-3 py-1 rounded-full transition-all duration-150 hover:opacity-75 active:scale-95"
                style={{
                  background: "var(--rose-blush)",
                  border: "1px solid rgba(201,123,132,0.2)",
                  color: "var(--rose)",
                }}
              >
                {chip}
              </button>
            ))}
          </div>
        )}

        {/* ── Input ── */}
        <div
          className="flex gap-2 px-4 py-3 border-t shrink-0"
          style={{ borderColor: "rgba(201,123,132,0.12)" }}
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Gift for girlfriend under ₹3000…"
            aria-label="Describe the gift you're looking for"
            disabled={isLoading}
            autoComplete="off"
            className="flex-1 text-sm px-3.5 py-2 rounded-full outline-none disabled:opacity-60 transition-colors"
            style={{
              border: "1.5px solid rgba(201,123,132,0.2)",
              background: "var(--rose-blush)",
              color: "var(--text-dark)",
            }}
          />

          <button
            onClick={send}
            disabled={!input.trim() || isLoading}
            aria-label="Send message"
            className="w-9 h-9 shrink-0 rounded-full flex items-center justify-center text-white
                       hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
                       disabled:hover:scale-100 transition-all duration-150"
            style={{ background: "var(--rose)" }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Mobile: full-screen backdrop on small screens ── */}
      {open && (
        <div
          className="fixed inset-0 z-[9990] bg-black/30 backdrop-blur-sm sm:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Mobile: re-position popup to center on small screens ── */}
      <style>{`
        @media (max-width: 639px) {
          [aria-label="Zyvora AI Gift Finder"] {
            right: 50% !important;
            bottom: 50% !important;
            transform: ${open ? "scale(1) translate(50%, 50%)" : "scale(0.85) translate(50%, 50%)"} !important;
            width: calc(100vw - 2rem) !important;
            max-height: 80vh !important;
          }
        }
      `}</style>
    </>
  );
}