"use client";

import { useState } from "react";
import ARDemoModal from "@/components/ar/ARDemoModal";

// ─── PRODUCT DATA ─────────────────────────────────────────────────────────────
// This is the product that will be previewed in AR.
// In a real app, pass this in as a prop from a product page/context.
const DEMO_PRODUCT = {
  id:    "demo",
  name:  "Mauve Bag",
  price: "₹5,500",
  image: "/products/mauve-bag.png", // put your actual product PNG here
};

export default function ARDemo() {
  const [modalOpen, setModalOpen] = useState(false);

  const features = [
    {
      icon: "📐",
      title: "True-Scale Preview",
      desc: "See exact dimensions in your real environment",
    },
    {
      icon: "🎨",
      title: "Color Variants",
      desc: "Switch between colors in real-time AR",
    },
    {
      icon: "📸",
      title: "Share & Save",
      desc: "Screenshot and share before buying",
    },
  ];

  return (
    <>
      <section
        id="ar-demo"
        className="py-20 md:py-28 px-6 md:px-10 overflow-hidden"
        style={{ background: "var(--rose-blush)" }}
      >
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">

          {/* ── PHONE MOCKUP ──────────────────────────────────────────────── */}
          <div className="flex justify-center reveal">
            <div className="relative w-[260px] p-3 rounded-[40px] bg-[#1a0d0f] shadow-[0_40px_80px_rgba(61,42,45,0.25)]">

              {/* notch */}
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-[70px] h-[6px] bg-[#2a1517] rounded-full z-10" />

              {/* screen */}
              <div className="relative rounded-[30px] overflow-hidden aspect-[9/19] bg-[var(--cream)]">

                {/* bg */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#e8ddd5] to-[#f0e6e0]" />

                {/* grid */}
                <svg className="absolute bottom-[100px] w-full opacity-20" viewBox="0 0 260 80">
                  <line x1="0"   y1="40" x2="260" y2="40" stroke="#9B5C63" strokeWidth="0.5"/>
                  <line x1="0"   y1="60" x2="260" y2="60" stroke="#9B5C63" strokeWidth="0.5"/>
                  <line x1="65"  y1="0"  x2="65"  y2="80" stroke="#9B5C63" strokeWidth="0.5"/>
                  <line x1="130" y1="0"  x2="130" y2="80" stroke="#9B5C63" strokeWidth="0.5"/>
                  <line x1="195" y1="0"  x2="195" y2="80" stroke="#9B5C63" strokeWidth="0.5"/>
                </svg>

                {/* shadow */}
                <div className="absolute bottom-[50px] left-1/2 -translate-x-1/2 w-[100px] h-[20px] bg-[rgba(61,42,45,0.15)] rounded-full blur-md animate-shadow-pulse" />

                {/* product */}
                <div className="absolute bottom-[60px] left-1/2 -translate-x-1/2 animate-ar-float">
                  <svg width="100" height="90" viewBox="0 0 140 130">
                    <defs>
                      <radialGradient id="arBag" cx="38%" cy="32%">
                        <stop offset="0%"   stopColor="#F0C8CC"/>
                        <stop offset="55%"  stopColor="#C97B84"/>
                        <stop offset="100%" stopColor="#7A3A42"/>
                      </radialGradient>
                    </defs>
                    <path
                      d="M25 40 Q20 80 24 98 Q50 112 70 112 Q90 112 116 98 Q120 80 115 40 Q102 27 70 26 Q38 27 25 40Z"
                      fill="url(#arBag)"
                    />
                    <path
                      d="M48 26 Q55 5 70 3 Q85 5 92 26"
                      stroke="#9B5C63" strokeWidth="5" fill="none" strokeLinecap="round"
                    />
                  </svg>
                </div>

                {/* UI top */}
                <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
                  <span
                    className="px-3 py-1 rounded-full text-[10px] font-semibold tracking-widest text-white"
                    style={{ background: "rgba(201,123,132,0.9)" }}
                  >
                    AR MODE
                  </span>
                  <span className="w-6 h-6 rounded-full bg-white/80 flex items-center justify-center text-xs">
                    ✕
                  </span>
                </div>

                {/* UI bottom */}
                <div className="absolute bottom-0 w-full p-4 bg-gradient-to-t from-[rgba(253,248,245,0.95)] to-transparent">
                  <p className="font-playfair text-sm font-semibold text-[var(--text-dark)]">
                    Mauve Bag
                  </p>
                  <p className="text-xs font-medium text-[var(--rose)]">
                    ₹5,500
                  </p>
                  <div className="flex gap-2 mt-2">
                    <button
                      className="flex-1 py-1.5 text-xs rounded-full"
                      style={{ background: "rgba(201,123,132,0.1)", color: "var(--rose)" }}
                    >
                      Share
                    </button>
                    <button
                      className="flex-1 py-1.5 text-xs rounded-full text-white"
                      style={{ background: "var(--rose)" }}
                    >
                      Add
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* ── TEXT ──────────────────────────────────────────────────────── */}
          <div className="reveal reveal-delay-1">
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-[var(--rose)] mb-4">
              <span className="w-6 h-[1px] bg-[var(--rose)]" />
              AR Experience
            </div>

            <h2 className="font-playfair text-[2.2rem] md:text-[3rem] font-bold leading-tight text-[var(--text-dark)] mb-4">
              See It in Your <br />
              <em style={{ color: "var(--rose)" }}>Space</em> First
            </h2>

            <p className="text-[1rem] leading-[1.8] text-[var(--text-mid)] mb-8 max-w-[420px]">
              Place products in your room before buying. No more guessing about size,
              color, or style.
            </p>

            {/* features */}
            <div className="flex flex-col gap-5">
              {features.map((f) => (
                <div key={f.title} className="flex gap-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                    style={{ background: "rgba(201,123,132,0.1)" }}
                  >
                    {f.icon}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[var(--text-dark)]">
                      {f.title}
                    </h4>
                    <p className="text-xs text-[var(--text-light)] leading-relaxed">
                      {f.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA — wired to modal */}
            <button
              onClick={() => setModalOpen(true)}
              className="mt-8 px-8 py-3 rounded-full text-sm text-white transition hover:-translate-y-0.5 active:scale-95"
              style={{ background: "var(--rose)" }}
            >
              ✦ Try AR Demo
            </button>
          </div>

        </div>
      </section>

      {/* ── AR Modal (portal-style, rendered outside section) ───────────── */}
      <ARDemoModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        product={DEMO_PRODUCT}
      />
    </>
  );
}