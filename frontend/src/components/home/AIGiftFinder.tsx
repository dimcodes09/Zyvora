"use client";

import { useState, useRef, useEffect } from "react";
import { useZyvoraChat, type ChatMsg, type ChatProduct } from "@/hooks/useZyvoraChat";

// ── Constants ─────────────────────────────────────────────────────────────────

// Strip the /api suffix so image paths like /uploads/foo.jpg resolve correctly
const _apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";
const BACKEND_URL = _apiUrl.replace(/\/api\/?$/, ""); // → "http://localhost:5000"

const TAGS = ["✦ Birthday Gifts", "✦ Anniversary", "✦ Weddings", "✦ Just Because"] as const;

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency", currency: "INR", maximumFractionDigits: 0,
  }).format(price);
}

function resolveImage(src?: string) {
  if (!src || src.trim() === "") return "/placeholder.png";
  return src.startsWith("http") ? src : `${BACKEND_URL}${src}`;
}

// ── Product card inside chat ──────────────────────────────────────────────────

function ChatProductCard({ product }: { product: ChatProduct }) {
  return (
    <a
      href={`/products/${product._id}`}
      className="flex items-center gap-3 bg-white rounded-2xl p-2.5 border border-rose-100 hover:shadow-md hover:border-[#C97B84]/40 transition-all duration-200 group"
    >
      <div
        className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-[#FAF0F1]"
        style={{ minWidth: "3.5rem" }}
      >
        <img
          src={resolveImage(product.image)}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/placeholder.png"; }}
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
      <span className="text-[#C97B84] text-lg pr-1 opacity-0 group-hover:opacity-100 transition-opacity">›</span>
    </a>
  );
}

// ── Message bubble ────────────────────────────────────────────────────────────

function MessageBubble({ msg }: { msg: ChatMsg }) {
  if (msg.role === "user") {
    return (
      <div
        className="text-sm leading-[1.5] px-4 py-2 rounded-[18px] max-w-[80%] self-end text-white"
        style={{ background: "var(--rose)", borderBottomRightRadius: 4 }}
      >
        {msg.text}
      </div>
    );
  }

  if (msg.kind === "products") {
    return (
      <div className="self-start max-w-[90%] w-full">
        <p className="text-xs text-[#9B7280] mb-2 ml-1">Here are my top picks for you ✨</p>
        <div className="flex flex-col gap-2">
          {msg.products.map((p) => (
            <ChatProductCard key={p._id} product={p} />
          ))}
        </div>
        <p className="text-xs text-[#9B7280] mt-2 ml-1">
          Click any product to view details 🛍️
        </p>
      </div>
    );
  }

  // bot text
  return (
    <div
      className="text-sm leading-[1.5] px-4 py-2 rounded-[18px] max-w-[80%] self-start"
      style={{ background: "var(--rose-blush)", color: "var(--text-dark)", borderBottomLeftRadius: 4 }}
    >
      {msg.text}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function AIGiftFinder() {
  // ── Hook provides all chat state & the send function ──────────────────────
  const { messages: msgs, isLoading: loading, sendMessage } = useZyvoraChat();
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, loading]);

  const send = () => {
    const query = input.trim();
    if (!query || loading) return;
    setInput("");
    sendMessage(query);
  };

  return (
    <section
      id="ai-finder"
      className="relative py-20 md:py-28 px-6 md:px-10 overflow-hidden"
      style={{ background: "var(--warm-white)" }}
    >
      {/* Decorative background text */}
      <div
        aria-hidden
        className="absolute right-[-2rem] top-1/2 -translate-y-1/2 font-playfair text-[12rem] md:text-[18rem] font-bold text-[rgba(201,123,132,0.05)] pointer-events-none select-none"
      >
        AI
      </div>

      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">

        {/* ── Left: Copy ── */}
        <div className="reveal">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-[var(--rose)] mb-4">
            <span className="w-6 h-[1px] bg-[var(--rose)]" />
            AI Powered
          </div>

          <h2 className="font-playfair text-[2.2rem] md:text-[3rem] font-bold leading-tight text-[var(--text-dark)] mb-4">
            Find the <em style={{ color: "var(--rose)" }}>Perfect</em>
            <br />Gift
          </h2>

          <p className="text-[0.95rem] leading-[1.8] text-[var(--text-mid)] mb-8 max-w-[420px]">
            Tell our AI about the person, occasion, and budget — it curates the
            perfect gift in seconds. Like having a personal shopper.
          </p>

          <div className="flex flex-wrap gap-3">
            {TAGS.map((t) => (
              <button
                key={t}
                onClick={() => setInput(t.replace("✦ ", ""))}
                className="px-4 py-1.5 rounded-full text-xs cursor-pointer transition hover:opacity-80"
                style={{
                  background: "var(--rose-blush)",
                  border: "1px solid rgba(201,123,132,0.2)",
                  color: "var(--rose)",
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* ── Right: Chat UI ── */}
        <div
          className="reveal reveal-delay-2 rounded-[24px] overflow-hidden border shadow-[0_20px_60px_rgba(201,123,132,0.12)] bg-white"
          style={{ borderColor: "rgba(201,123,132,0.1)" }}
        >
          {/* Header */}
          <div
            className="flex items-center gap-3 px-5 py-4"
            style={{ background: "var(--rose)" }}
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm bg-white/25">
              ✦
            </div>
            <div>
              <p className="text-white text-sm font-medium">Zyvora AI</p>
              <p className="text-white/70 text-xs">Your personal gift curator</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex flex-col gap-3 px-5 py-5 min-h-[280px] max-h-[380px] overflow-y-auto">
            {msgs.map((msg, i) => (
              <MessageBubble key={i} msg={msg} />
            ))}

            {/* Typing indicator */}
            {loading && (
              <div
                role="status"
                aria-label="AI is thinking"
                className="flex gap-1 px-4 py-2 rounded-[18px] bg-[var(--rose-blush)] w-fit self-start"
              >
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-[var(--rose)] inline-block"
                    style={{ animation: `bounce 1s ease-in-out ${i * 0.15}s infinite` }}
                  />
                ))}
                <style>{`
                  @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50%       { transform: translateY(-5px); }
                  }
                `}</style>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div
            className="flex gap-3 px-5 py-4 border-t"
            style={{ borderColor: "rgba(201,123,132,0.1)" }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="e.g. luxury gift for girlfriend under ₹5000"
              aria-label="Describe what you're looking for"
              disabled={loading}
              autoComplete="off"
              className="flex-1 text-sm px-4 py-2 rounded-full outline-none disabled:opacity-60"
              style={{
                border: "1.5px solid rgba(201,123,132,0.2)",
                background: "var(--rose-blush)",
              }}
            />

            <button
              onClick={send}
              disabled={!input.trim() || loading}
              aria-label="Send message"
              className="w-9 h-9 rounded-full flex items-center justify-center text-white transition hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              style={{ background: "var(--rose)" }}
            >
              →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}