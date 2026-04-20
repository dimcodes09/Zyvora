"use client";

import { useState } from "react";

type Msg = { role: "bot" | "user"; text: string };

const INITIAL: Msg[] = [
  { role: "bot", text: "Hello! ✨ Tell me about the person you're gifting. What's the occasion?" },
  { role: "user", text: "It's my mom's birthday — she loves florals and elegant things." },
  { role: "bot", text: "Perfect! What's your budget? I'll find something truly special for her." },
  { role: "user", text: "Around ₹2,000 to ₹5,000" },
];

const REPLIES = [
  "Based on her love for florals ✨, I'd suggest the Crimson Romance Bouquet (₹1,299) paired with a Rose Scented Candle (₹899). Total: ₹2,198.",
  "What a lovely choice! I also recommend the Garden Whisper Bouquet for an elegant vibe she'll adore.",
  "For an anniversary, nothing beats our Pearl Earrings + Lavender Bouquet combo — timeless and magical!",
  "Here are my top picks! 🌸 Would you like gift wrapping with a personalized note?",
];

const tags = ["✦ Birthday Gifts", "✦ Anniversary", "✦ Weddings", "✦ Just Because"];

export default function AIGiftFinder() {
  const [msgs, setMsgs] = useState<Msg[]>(INITIAL);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [replyIdx, setReplyIdx] = useState(0);

  const send = () => {
    const val = input.trim();
    if (!val || typing) return;

    setMsgs((m) => [...m, { role: "user", text: val }]);
    setInput("");
    setTyping(true);

    setTimeout(() => {
      setMsgs((m) => [
        ...m,
        { role: "bot", text: REPLIES[replyIdx % REPLIES.length] },
      ]);
      setReplyIdx((i) => i + 1);
      setTyping(false);
    }, 1200);
  };

  return (
    <section
      id="ai-finder"
      className="relative py-20 md:py-28 px-6 md:px-10 overflow-hidden"
      style={{ background: "var(--warm-white)" }}
    >
      {/* BIG BACKGROUND TEXT */}
      <div className="absolute right-[-2rem] top-1/2 -translate-y-1/2 font-playfair text-[12rem] md:text-[18rem] font-bold text-[rgba(201,123,132,0.05)] pointer-events-none">
        AI
      </div>

      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">

        {/* LEFT */}
        <div className="reveal">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-[var(--rose)] mb-4">
            <span className="w-6 h-[1px] bg-[var(--rose)]" />
            AI Powered
          </div>

          <h2 className="font-playfair text-[2.2rem] md:text-[3rem] font-bold leading-tight text-[var(--text-dark)] mb-4">
            Find the <em style={{ color: "var(--rose)" }}>Perfect</em>
            <br />
            Gift
          </h2>

          <p className="text-[0.95rem] leading-[1.8] text-[var(--text-mid)] mb-8 max-w-[420px]">
            Tell our AI about the person, occasion, and budget — it curates the
            perfect gift in seconds. Like having a personal shopper.
          </p>

          <div className="flex flex-wrap gap-3">
            {tags.map((t) => (
              <span
                key={t}
                className="px-4 py-1.5 rounded-full text-xs cursor-pointer transition"
                style={{
                  background: "var(--rose-blush)",
                  border: "1px solid rgba(201,123,132,0.2)",
                  color: "var(--rose)",
                }}
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* CHAT UI */}
        <div className="reveal reveal-delay-2 rounded-[24px] overflow-hidden border shadow-[0_20px_60px_rgba(201,123,132,0.12)] bg-white"
             style={{ borderColor: "rgba(201,123,132,0.1)" }}
        >

          {/* HEADER */}
          <div className="flex items-center gap-3 px-5 py-4"
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

          {/* MESSAGES */}
          <div className="flex flex-col gap-3 px-5 py-5 min-h-[280px] max-h-[320px] overflow-y-auto">
            {msgs.map((m, i) => (
              <div
                key={i}
                className="text-sm leading-[1.5] px-4 py-2 rounded-[18px] max-w-[80%]"
                style={{
                  alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                  background:
                    m.role === "user"
                      ? "var(--rose)"
                      : "var(--rose-blush)",
                  color:
                    m.role === "user" ? "white" : "var(--text-dark)",
                  borderBottomRightRadius:
                    m.role === "user" ? 4 : 18,
                  borderBottomLeftRadius:
                    m.role === "bot" ? 4 : 18,
                }}
              >
                {m.text}
              </div>
            ))}

            {/* typing */}
            {typing && (
              <div className="flex gap-1 px-4 py-2 rounded-[18px] bg-[var(--rose-blush)] w-fit">
                <div className="chat-dot" />
                <div className="chat-dot" />
                <div className="chat-dot" />
              </div>
            )}
          </div>

          {/* INPUT */}
          <div className="flex gap-3 px-5 py-4 border-t"
               style={{ borderColor: "rgba(201,123,132,0.1)" }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Describe your person..."
              className="flex-1 text-sm px-4 py-2 rounded-full outline-none"
              style={{
                border: "1.5px solid rgba(201,123,132,0.2)",
                background: "var(--rose-blush)",
              }}
            />

            <button
              onClick={send}
              className="w-9 h-9 rounded-full flex items-center justify-center text-white transition hover:scale-105"
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