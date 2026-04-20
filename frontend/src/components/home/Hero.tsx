"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";

/* ─── Stats strip ─────────────────────────────── */
const stats = [
  { num: "12K+", label: "Happy Gifters" },
  { num: "340+", label: "Curated Items" },
  { num: "4.9★", label: "Average Rating" },
];

/* ─── Inline styles / keyframes ──────────────── */
const HERO_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,800;1,400;1,700;1,800&family=Inter:wght@300;400;500;600&display=swap');

  /* ── Entrance animations ── */
  @keyframes h-fade-up {
    from { opacity: 0; transform: translateY(40px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes h-fade-in {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes h-slide-right {
    from { opacity: 0; transform: translateX(-30px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes h-float-bag {
    0%, 100% { transform: translateY(0px); }
    50%       { transform: translateY(-20px); }
  }
  @keyframes h-blob {
    0%, 100% { transform: scale(1) rotate(0deg); }
    50%       { transform: scale(1.06) rotate(6deg); }
  }
  @keyframes h-glow-pulse {
    0%, 100% { opacity: 0.55; transform: scale(1); }
    50%       { opacity: 0.75; transform: scale(1.04); }
  }
  @keyframes h-counter {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes h-badge-pop {
    0%   { opacity: 0; transform: scale(0.8) rotate(-4deg); }
    60%  { transform: scale(1.04) rotate(1deg); }
    100% { opacity: 1; transform: scale(1) rotate(0deg); }
  }
  @keyframes h-scan-line {
    0%   { top: 0; opacity: 0.6; }
    100% { top: 100%; opacity: 0; }
  }

  /* ── Applied classes ── */
  .h-tagline    { animation: h-slide-right 0.8s cubic-bezier(0.22,1,0.36,1) 0.1s both; }
  .h-your       { animation: h-fade-up 1s cubic-bezier(0.22,1,0.36,1) 0.25s both; }
  .h-choice     { animation: h-fade-up 1s cubic-bezier(0.22,1,0.36,1) 0.45s both; }
  .h-sub        { animation: h-fade-up 0.9s ease 0.7s both; }
  .h-cta        { animation: h-fade-up 0.9s ease 0.9s both; }
  .h-stats      { animation: h-fade-up 0.9s ease 1.1s both; }
  .h-bag-wrap   { animation: h-float-bag 7s ease-in-out infinite; }
  .h-glow       { animation: h-glow-pulse 5s ease-in-out infinite; }
  .h-blob-1     { animation: h-blob 12s ease-in-out infinite; }
  .h-blob-2     { animation: h-blob 15s ease-in-out 4s infinite; }
  .h-badge      { animation: h-badge-pop 0.7s cubic-bezier(0.34,1.56,0.64,1) 1.4s both; }

  /* ── Scan line on bag ── */
  .h-scan-wrap {
    position: absolute; inset: 0;
    overflow: hidden;
    border-radius: 50%;
    pointer-events: none;
  }
  .h-scan-line {
    position: absolute;
    left: 0; right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent);
    animation: h-scan-line 4s ease-in-out 1.8s infinite;
  }

  /* ── CTA button ── */
  .h-btn-primary {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 13px 34px;
    background: #7B1728;
    color: #fff;
    font-family: 'Inter', sans-serif;
    font-size: 0.74rem;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    text-decoration: none;
    border-radius: 2px;
    transition: background 0.22s ease, transform 0.2s ease, box-shadow 0.22s ease;
    box-shadow: 0 6px 22px rgba(123,23,40,0.26);
  }
  .h-btn-primary:hover {
    background: #5C1020;
    transform: translateY(-2px);
    box-shadow: 0 12px 30px rgba(123,23,40,0.34);
  }
  .h-btn-ghost {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 13px 28px;
    background: transparent;
    color: #7B1728;
    font-family: 'Inter', sans-serif;
    font-size: 0.74rem;
    font-weight: 500;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    text-decoration: none;
    border: 1px solid rgba(123,23,40,0.32);
    border-radius: 2px;
    transition: border-color 0.22s ease, background 0.22s ease, transform 0.2s ease;
  }
  .h-btn-ghost:hover {
    border-color: #7B1728;
    background: rgba(123,23,40,0.05);
    transform: translateY(-2px);
  }

  /* ── Stat divider dot ── */
  .h-stat-dot {
    width: 3px; height: 3px;
    border-radius: 50%;
    background: rgba(123,23,40,0.3);
    flex-shrink: 0;
  }

  /* ── Parallax on scroll ── */
  .h-parallax { will-change: transform; }
`;

/* ─── Petal / float accent ────────────────────── */
const FloatPetal = ({
  style,
  color,
  size,
  delay,
}: {
  style: React.CSSProperties;
  color: string;
  size: number;
  delay: string;
}) => (
  <div
    style={{
      position: "absolute",
      pointerEvents: "none",
      animation: `h-float-bag 6s ease-in-out ${delay} infinite`,
      ...style,
    }}
  >
    <svg width={size} height={size} viewBox="0 0 30 30">
      <ellipse cx="15" cy="10" rx="7" ry="11" fill={color} />
    </svg>
  </div>
);

/* ─── Hero Component ─────────────────────────── */
export default function Hero() {
  const bagRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  /* Parallax effect on scroll */
  useEffect(() => {
    const bag = bagRef.current;
    if (!bag) return;

    const onScroll = () => {
      const y = window.scrollY;
      bag.style.transform = `translateY(${y * 0.12}px)`;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* GSAP entrance (optional — degrades gracefully) */
  useEffect(() => {
    (async () => {
      try {
        const { gsap } = await import("gsap");
        const { ScrollTrigger } = await import("gsap/ScrollTrigger");
        gsap.registerPlugin(ScrollTrigger);

        const ctx = gsap.context(() => {
          /* Stats count-up feel */
          gsap.from(".h-stats-inner", {
            y: 20, opacity: 0, stagger: 0.15, duration: 0.9, ease: "power3.out",
            scrollTrigger: { trigger: ".h-stats", start: "top 88%", toggleActions: "play none none none" },
          });
        }, sectionRef);

        return () => ctx.revert();
      } catch { /* graceful fallback */ }
    })();
  }, []);

  return (
    <>
      <style>{HERO_STYLES}</style>

      <section
        ref={sectionRef}
        id="hero"
        style={{
          position: "relative",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          overflow: "hidden",
          paddingTop: 70, /* navbar height */
          background: "linear-gradient(155deg, #FDF3F0 0%, #F9EBE8 35%, #F4E2DD 70%, #EFD9D4 100%)",
        }}
      >
        {/* ── Ambient blobs ──────────────────────────── */}
        <div aria-hidden="true" style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
          {/* Top-right blob */}
          <div
            className="h-blob-1"
            style={{
              position: "absolute", top: -160, right: -160,
              width: 560, height: 560, borderRadius: "50%",
              background: "radial-gradient(circle, rgba(210,140,150,0.18) 0%, transparent 70%)",
              filter: "blur(60px)",
            }}
          />
          {/* Bottom-left blob */}
          <div
            className="h-blob-2"
            style={{
              position: "absolute", bottom: 80, left: -120,
              width: 420, height: 420, borderRadius: "50%",
              background: "radial-gradient(circle, rgba(196,168,130,0.14) 0%, transparent 70%)",
              filter: "blur(50px)",
            }}
          />

          {/* Floating petals */}
          <FloatPetal style={{ top: "15%", left: "5%" }}  color="rgba(201,123,132,0.25)" size={30} delay="0s"   />
          <FloatPetal style={{ top: "65%", right: "6%" }} color="rgba(232,180,186,0.3)"  size={22} delay="2.5s" />
          <FloatPetal style={{ bottom: "10%", left: "22%" }} color="rgba(196,168,130,0.2)" size={18} delay="4.2s" />
          <FloatPetal style={{ top: "38%", right: "22%" }} color="rgba(201,123,132,0.18)" size={14} delay="1.3s" />

          {/* Subtle grid lines */}
          <div style={{
            position: "absolute", inset: 0,
            backgroundImage: `
              linear-gradient(rgba(180,100,100,0.04) 1px, transparent 1px),
              linear-gradient(90deg, rgba(180,100,100,0.04) 1px, transparent 1px)
            `,
            backgroundSize: "80px 80px",
          }} />
        </div>

        {/* ── Main content grid ─────────────────────── */}
        <div
          style={{
            position: "relative", zIndex: 10,
            width: "100%", maxWidth: 1320,
            margin: "0 auto",
            padding: "0 2.5rem",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "4rem",
            alignItems: "center",
            minHeight: "calc(100vh - 70px)",
          }}
        >

          {/* ═══ LEFT: Typography ═══ */}
          <div style={{ position: "relative", zIndex: 20 }}>

            {/* Micro tagline */}
            <div
              className="h-tagline"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                marginBottom: "2rem",
              }}
            >
              <div style={{
                width: 28, height: 1,
                background: "linear-gradient(90deg, #7B1728, transparent)",
              }} />
              <span style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "0.64rem",
                fontWeight: 600,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "#7B1728",
                opacity: 0.85,
              }}>
                SS 2026 Collection
              </span>
            </div>

            {/* ── THE BIG EDITORIAL HEADLINE ── */}
            <div
              style={{
                position: "relative",
                marginBottom: "2.4rem",
                lineHeight: 0.9,
              }}
            >
              {/* "your" — light italic */}
              <div
                className="h-your h-parallax"
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontWeight: 400,
                  fontStyle: "italic",
                  fontSize: "clamp(3.8rem, 7vw, 6.5rem)",
                  color: "#5C1A24",
                  letterSpacing: "-0.02em",
                  opacity: 0.72,
                  lineHeight: 1,
                  userSelect: "none",
                }}
              >
                your
              </div>

              {/* "choice" — bold, oversized */}
              <div
                className="h-choice h-parallax"
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontWeight: 800,
                  fontStyle: "normal",
                  fontSize: "clamp(5.5rem, 10.5vw, 10rem)",
                  color: "#7B1728",
                  letterSpacing: "-0.04em",
                  lineHeight: 0.88,
                  userSelect: "none",
                  marginTop: "-0.1em",
                }}
              >
                choice
              </div>
            </div>

            {/* Body */}
            <p
              className="h-sub"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "1rem",
                lineHeight: 1.75,
                color: "#7A5050",
                maxWidth: 400,
                marginBottom: "2.5rem",
                fontWeight: 300,
              }}
            >
              Discover curated gifts, floral stories & unique keepsakes —
              handpicked for the ones who deserve only the extraordinary.
            </p>

            {/* CTA buttons */}
            <div className="h-cta" style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "3rem" }}>
              <Link href="/products" className="h-btn-primary">
                Explore Collection →
              </Link>
              <Link href="#ai-finder" className="h-btn-ghost">
                AI Gift Finder
              </Link>
            </div>

            {/* Stats */}
            <div
              className="h-stats"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "2rem",
                paddingTop: "2rem",
                borderTop: "1px solid rgba(123,23,40,0.1)",
              }}
            >
              {stats.map((s, i) => (
                <div key={s.label} style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
                  <div className="h-stats-inner">
                    <div style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: "1.65rem",
                      fontWeight: 700,
                      color: "#7B1728",
                      lineHeight: 1.1,
                    }}>
                      {s.num}
                    </div>
                    <div style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "0.62rem",
                      fontWeight: 600,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "#A07070",
                      marginTop: 3,
                    }}>
                      {s.label}
                    </div>
                  </div>
                  {i < stats.length - 1 && <span className="h-stat-dot" />}
                </div>
              ))}
            </div>

          </div>

          {/* ═══ RIGHT: Bag with layered text depth ═══ */}
          <div
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "clamp(420px, 55vh, 600px)",
            }}
          >
            {/* Radial glow behind bag */}
            <div
              className="h-glow"
              style={{
                position: "absolute",
                width: "80%", height: "80%",
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(210,130,140,0.32) 0%, rgba(240,180,185,0.12) 50%, transparent 75%)",
                filter: "blur(36px)",
                zIndex: 0,
              }}
            />

            {/* Dashed orbit ring */}
            <div style={{
              position: "absolute",
              width: "72%", height: "72%",
              borderRadius: "50%",
              border: "1px dashed rgba(123,23,40,0.12)",
              zIndex: 1,
              animation: "h-blob 20s linear infinite",
            }} />
            <div style={{
              position: "absolute",
              width: "90%", height: "90%",
              borderRadius: "50%",
              border: "1px dashed rgba(123,23,40,0.07)",
              zIndex: 1,
            }} />

            {/* "chère" watermark */}
            <span
              aria-hidden="true"
              style={{
                position: "absolute",
                fontFamily: "'Playfair Display', serif",
                fontWeight: 800,
                fontStyle: "italic",
                fontSize: "clamp(5rem, 10vw, 12rem)",
                color: "transparent",
                WebkitTextStroke: "1px rgba(123,23,40,0.08)",
                userSelect: "none",
                zIndex: 2,
                letterSpacing: "-0.04em",
                whiteSpace: "nowrap",
              }}
            >
              chère
            </span>

            {/* ── Floating bag (parallax container) ── */}
            <div
              ref={bagRef}
              className="h-bag-wrap"
              style={{
                position: "absolute",
                width: "clamp(240px, 36vw, 400px)",
                zIndex: 3,
                willChange: "transform",
              }}
            >
              <Image
                src="/hero-bag.png"
                alt="Luxury fashion handbag – Zyvora Collection"
                width={400}
                height={480}
                priority
                style={{
                  width: "100%",
                  height: "auto",
                  objectFit: "contain",
                  filter: "drop-shadow(0 40px 70px rgba(120,40,50,0.32))",
                  borderRadius: "4px",
                }}
              />

              {/* Scan line overlay */}
              <div className="h-scan-wrap">
                <div className="h-scan-line" />
              </div>

              {/* "New Season" badge */}
              <div
                className="h-badge"
                style={{
                  position: "absolute",
                  top: "12%",
                  right: "-10%",
                  background: "#7B1728",
                  color: "#fff",
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "0.58rem",
                  fontWeight: 600,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  padding: "6px 14px",
                  borderRadius: "2px",
                  boxShadow: "0 4px 14px rgba(123,23,40,0.3)",
                  whiteSpace: "nowrap",
                }}
              >
                New Season
              </div>

              {/* Price tag */}
              <div
                className="h-badge"
                style={{
                  position: "absolute",
                  bottom: "14%",
                  left: "-8%",
                  background: "rgba(253,248,245,0.95)",
                  backdropFilter: "blur(8px)",
                  border: "1px solid rgba(123,23,40,0.14)",
                  borderRadius: "6px",
                  padding: "10px 16px",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                }}
              >
                <div style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  color: "#7B1728",
                  lineHeight: 1.2,
                }}>
                  ₹8,400
                </div>
                <div style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "0.58rem",
                  color: "#A07070",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  marginTop: 2,
                }}>
                  Luxury Pick
                </div>
              </div>
            </div>

            {/* Text layered OVER bag in z-index */}
            {/* (The large "your choice" is on the LEFT but the editorial depth is created by the watermark + bag overlap in this column) */}

          </div>

        </div>

        {/* ── Bottom thin brand strip ──────────────── */}
        <div
          style={{
            position: "absolute",
            bottom: 0, left: 0, right: 0,
            height: 48,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "4rem",
            borderTop: "1px solid rgba(123,23,40,0.08)",
            zIndex: 20,
          }}
        >
          {["Free Delivery Above ₹1,499", "Premium Packaging", "30-Day Returns", "Gift Wrapping Available"].map((t) => (
            <span
              key={t}
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "0.6rem",
                fontWeight: 500,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#A08080",
                whiteSpace: "nowrap",
              }}
            >
              {t}
            </span>
          ))}
        </div>

      </section>
    </>
  );
}