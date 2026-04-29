"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";

/* ─── Stats strip ─────────────────────────────── */
const stats = [
  { num: "12K+", label: "Happy Gifters" },
  { num: "340+", label: "Curated Items" },
  { num: "4.9★", label: "Average Rating" },
];

/* ─── Carousel products ───────────────────────── */
const products = [
  { id: "1", image: "/images/p1.png", name: "Rosé Bloom Bouquet",      price: "₹3,200", tag: "Bestseller"  },
  { id: "2", image: "/images/p2.png", name: "Amber Glow Hamper",       price: "₹5,800", tag: "New Arrival" },
  { id: "3", image: "/images/p3.png", name: "Pearl Luxe Gift Box",     price: "₹8,400", tag: "Luxury Pick" },
  { id: "4", image: "/images/p4.png", name: "Velvet Dream Keepsake",   price: "₹4,600", tag: "Curated"     },
];

/* ─── Inline styles / keyframes ──────────────── */
const HERO_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,800;1,400;1,700;1,800&family=Inter:wght@300;400;500;600&display=swap');

  @keyframes h-fade-up {
    from { opacity: 0; transform: translateY(40px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes h-slide-right {
    from { opacity: 0; transform: translateX(-30px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes h-blob {
    0%, 100% { transform: scale(1) rotate(0deg); }
    50%       { transform: scale(1.06) rotate(6deg); }
  }
  @keyframes h-glow-pulse {
    0%, 100% { opacity: 0.55; transform: scale(1); }
    50%       { opacity: 0.75; transform: scale(1.04); }
  }
  @keyframes h-badge-pop {
    0%   { opacity: 0; transform: scale(0.8) rotate(-4deg); }
    60%  { transform: scale(1.04) rotate(1deg); }
    100% { opacity: 1; transform: scale(1) rotate(0deg); }
  }
  @keyframes h-float-bag {
    0%, 100% { transform: translateY(0px);   }
    50%       { transform: translateY(-14px); }
  }
  @keyframes h-float-petal {
    0%, 100% { transform: translateY(0px) rotate(0deg);  }
    50%       { transform: translateY(-10px) rotate(8deg);}
  }

  /* carousel slide transitions */
  @keyframes carousel-in-next {
    from { opacity: 0; transform: translateX(48px) scale(0.96); }
    to   { opacity: 1; transform: translateX(0)    scale(1);    }
  }
  @keyframes carousel-in-prev {
    from { opacity: 0; transform: translateX(-48px) scale(0.96); }
    to   { opacity: 1; transform: translateX(0)     scale(1);    }
  }
  @keyframes carousel-out-next {
    from { opacity: 1; transform: translateX(0)     scale(1);    }
    to   { opacity: 0; transform: translateX(-48px) scale(0.96); }
  }
  @keyframes carousel-out-prev {
    from { opacity: 1; transform: translateX(0)    scale(1);    }
    to   { opacity: 0; transform: translateX(48px) scale(0.96); }
  }

  .h-tagline  { animation: h-slide-right 0.8s cubic-bezier(0.22,1,0.36,1) 0.1s  both; }
  .h-your     { animation: h-fade-up     1s   cubic-bezier(0.22,1,0.36,1) 0.25s both; }
  .h-choice   { animation: h-fade-up     1s   cubic-bezier(0.22,1,0.36,1) 0.45s both; }
  .h-sub      { animation: h-fade-up     0.9s ease 0.7s  both; }
  .h-cta      { animation: h-fade-up     0.9s ease 0.9s  both; }
  .h-stats    { animation: h-fade-up     0.9s ease 1.1s  both; }
  .h-carousel { animation: h-fade-up     1s   ease 0.6s  both; }
  .h-glow     { animation: h-glow-pulse  5s   ease-in-out infinite; }
  .h-blob-1   { animation: h-blob        12s  ease-in-out infinite; }
  .h-blob-2   { animation: h-blob        15s  ease-in-out 4s infinite; }
  .h-badge    { animation: h-badge-pop   0.7s cubic-bezier(0.34,1.56,0.64,1) 1.4s both; }
  .h-float    { animation: h-float-bag   7s   ease-in-out infinite; }

  /* Progress bar track */
  .carousel-progress-track {
    width: 100%;
    height: 1px;
    background: rgba(123,23,40,0.12);
    border-radius: 1px;
    overflow: hidden;
  }
  .carousel-progress-fill {
    height: 100%;
    background: #7B1728;
    border-radius: 1px;
    transform-origin: left;
    transition: width 0.1s linear;
  }

  /* Dot indicators */
  .carousel-dot {
    width: 5px; height: 5px;
    border-radius: 50%;
    background: rgba(123,23,40,0.22);
    cursor: pointer;
    transition: background 0.3s ease, transform 0.3s ease, width 0.3s ease;
    border: none;
    padding: 0;
    flex-shrink: 0;
  }
  .carousel-dot.active {
    background: #7B1728;
    width: 22px;
    border-radius: 3px;
  }
  .carousel-dot:hover:not(.active) {
    background: rgba(123,23,40,0.45);
    transform: scale(1.3);
  }

  /* CTA buttons (unchanged) */
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
  .h-stat-dot {
    width: 3px; height: 3px;
    border-radius: 50%;
    background: rgba(123,23,40,0.3);
    flex-shrink: 0;
  }

  /* Nav arrow buttons */
  .carousel-arrow {
    width: 34px; height: 34px;
    border-radius: 50%;
    border: 1px solid rgba(123,23,40,0.18);
    background: rgba(253,243,240,0.85);
    backdrop-filter: blur(6px);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    transition: border-color 0.2s ease, background 0.2s ease, transform 0.2s ease;
    color: #7B1728;
    font-size: 0.75rem;
  }
  .carousel-arrow:hover {
    border-color: #7B1728;
    background: rgba(253,243,240,1);
    transform: scale(1.08);
  }

  .h-parallax { will-change: transform; }
`;

/* ─── Petal accent ────────────────────────────── */
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
      animation: `h-float-petal 6s ease-in-out ${delay} infinite`,
      ...style,
    }}
  >
    <svg width={size} height={size} viewBox="0 0 30 30">
      <ellipse cx="15" cy="10" rx="7" ry="11" fill={color} />
    </svg>
  </div>
);

/* ─── Product Carousel ────────────────────────── */
const INTERVAL = 3800; // ms

function ProductCarousel() {
  const [current, setCurrent]     = useState(0);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [animKey, setAnimKey]     = useState(0);
  const [progress, setProgress]   = useState(0);
  const timerRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const progRef   = useRef<ReturnType<typeof setInterval> | null>(null);
  const total = products.length;

  const clearTimers = () => {
    if (timerRef.current)  clearInterval(timerRef.current);
    if (progRef.current)   clearInterval(progRef.current);
  };

  const goTo = useCallback((idx: number, dir: "next" | "prev") => {
    setDirection(dir);
    setCurrent(idx);
    setAnimKey((k) => k + 1);
    setProgress(0);
  }, []);

  const next = useCallback(() => {
    goTo((current + 1) % total, "next");
  }, [current, total, goTo]);

  const prev = useCallback(() => {
    goTo((current - 1 + total) % total, "prev");
  }, [current, total, goTo]);

  /* Auto-advance + progress bar */
  useEffect(() => {
    clearTimers();
    setProgress(0);

    const tick = INTERVAL / 100;
    progRef.current = setInterval(() => {
      setProgress((p) => Math.min(p + 1, 100));
    }, tick);

    timerRef.current = setInterval(() => {
      setDirection("next");
      setCurrent((c) => (c + 1) % total);
      setAnimKey((k) => k + 1);
      setProgress(0);
    }, INTERVAL);

    return clearTimers;
  }, [current, total]);

  const product = products[current];
  const animStyle: React.CSSProperties = {
    animation: `${direction === "next" ? "carousel-in-next" : "carousel-in-prev"} 0.55s cubic-bezier(0.22,1,0.36,1) both`,
  };

  return (
    <div
      className="h-carousel"
      style={{
        position: "relative",
        width: "100%",
        height: "clamp(440px, 58vh, 620px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Ambient glow */}
      <div
        className="h-glow"
        style={{
          position: "absolute",
          width: "78%", height: "78%",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(210,130,140,0.3) 0%, rgba(240,180,185,0.1) 55%, transparent 75%)",
          filter: "blur(38px)",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />

      {/* Orbit rings */}
      <div style={{
        position: "absolute",
        width: "68%", height: "68%",
        borderRadius: "50%",
        border: "1px dashed rgba(123,23,40,0.1)",
        zIndex: 1,
        pointerEvents: "none",
        animation: "h-blob 22s linear infinite",
      }} />
      <div style={{
        position: "absolute",
        width: "88%", height: "88%",
        borderRadius: "50%",
        border: "1px dashed rgba(123,23,40,0.06)",
        zIndex: 1,
        pointerEvents: "none",
      }} />

      {/* Watermark */}
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          fontFamily: "'Playfair Display', serif",
          fontWeight: 800,
          fontStyle: "italic",
          fontSize: "clamp(4.5rem, 9vw, 11rem)",
          color: "transparent",
          WebkitTextStroke: "1px rgba(123,23,40,0.07)",
          userSelect: "none",
          zIndex: 2,
          letterSpacing: "-0.04em",
          whiteSpace: "nowrap",
          pointerEvents: "none",
        }}
      >
        chère
      </span>

      {/* ── Product card (animated) ── */}
      <div
        key={`${product.id}-${animKey}`}
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          ...animStyle,
        }}
      >
        {/* Image */}
        <div
          className="h-float"
          style={{
            position: "relative",
            width: "clamp(200px, 30vw, 340px)",
            aspectRatio: "380 / 460",
            filter: "drop-shadow(0 36px 60px rgba(120,40,50,0.28))",
          }}
        >
          <Image
            src={product.image}
            alt={product.name}
            fill
            priority={current === 0}
            className="object-contain"
            style={{ borderRadius: "4px" }}
          />
        </div>

        {/* Product info card */}
        <div
          className="h-badge"
          style={{
            marginTop: "1.4rem",
            background: "rgba(253,248,245,0.92)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(123,23,40,0.12)",
            borderRadius: "8px",
            padding: "12px 22px",
            boxShadow: "0 8px 28px rgba(0,0,0,0.07)",
            display: "flex",
            alignItems: "center",
            gap: "1.2rem",
            minWidth: 220,
          }}
        >
          <div>
            <div style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "0.58rem",
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#A07070",
              marginBottom: 3,
            }}>
              {product.tag}
            </div>
            <div style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "0.95rem",
              fontWeight: 600,
              color: "#4A2030",
              lineHeight: 1.3,
            }}>
              {product.name}
            </div>
          </div>
          <div style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "1.15rem",
            fontWeight: 700,
            color: "#7B1728",
            whiteSpace: "nowrap",
          }}>
            {product.price}
          </div>
        </div>
      </div>

      {/* ── Nav arrows ── */}
      <button
        className="carousel-arrow"
        onClick={prev}
        aria-label="Previous product"
        style={{ position: "absolute", left: "4%", top: "42%", zIndex: 20 }}
      >
        ‹
      </button>
      <button
        className="carousel-arrow"
        onClick={next}
        aria-label="Next product"
        style={{ position: "absolute", right: "4%", top: "42%", zIndex: 20 }}
      >
        ›
      </button>

      {/* ── Bottom controls: dots + progress ── */}
      <div style={{
        position: "absolute",
        bottom: "2%",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 20,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
        width: "55%",
      }}>
        {/* Dot indicators */}
        <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
          {products.map((p, i) => (
            <button
              key={p.id}
              className={`carousel-dot${i === current ? " active" : ""}`}
              onClick={() => goTo(i, i > current ? "next" : "prev")}
              aria-label={`Go to product ${i + 1}`}
            />
          ))}
        </div>

        {/* Progress bar */}
        <div className="carousel-progress-track" style={{ width: "100%" }}>
          <div
            className="carousel-progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}

/* ─── Hero Component ─────────────────────────── */
export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);

  /* GSAP stats entrance (graceful degradation) */
  useEffect(() => {
    (async () => {
      try {
        const { gsap } = await import("gsap");
        const { ScrollTrigger } = await import("gsap/ScrollTrigger");
        gsap.registerPlugin(ScrollTrigger);
        const ctx = gsap.context(() => {
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
          paddingTop: 70,
          background: "linear-gradient(155deg, #FDF3F0 0%, #F9EBE8 35%, #F4E2DD 70%, #EFD9D4 100%)",
        }}
      >
        {/* ── Ambient blobs ─────────────────────── */}
        <div aria-hidden="true" style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
          <div className="h-blob-1" style={{
            position: "absolute", top: -160, right: -160,
            width: 560, height: 560, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(210,140,150,0.18) 0%, transparent 70%)",
            filter: "blur(60px)",
          }} />
          <div className="h-blob-2" style={{
            position: "absolute", bottom: 80, left: -120,
            width: 420, height: 420, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(196,168,130,0.14) 0%, transparent 70%)",
            filter: "blur(50px)",
          }} />
          <FloatPetal style={{ top: "15%", left: "5%" }}      color="rgba(201,123,132,0.25)" size={30} delay="0s"   />
          <FloatPetal style={{ top: "65%", right: "6%" }}     color="rgba(232,180,186,0.3)"  size={22} delay="2.5s" />
          <FloatPetal style={{ bottom: "10%", left: "22%" }}  color="rgba(196,168,130,0.2)"  size={18} delay="4.2s" />
          <FloatPetal style={{ top: "38%", right: "22%" }}    color="rgba(201,123,132,0.18)" size={14} delay="1.3s" />
          <div style={{
            position: "absolute", inset: 0,
            backgroundImage: `
              linear-gradient(rgba(180,100,100,0.04) 1px, transparent 1px),
              linear-gradient(90deg, rgba(180,100,100,0.04) 1px, transparent 1px)
            `,
            backgroundSize: "80px 80px",
          }} />
        </div>

        {/* ── Main content grid ─────────────────── */}
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

          {/* ═══ LEFT: Typography (unchanged) ═══ */}
          <div style={{ position: "relative", zIndex: 20 }}>

            {/* Micro tagline */}
            <div className="h-tagline" style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: "2rem" }}>
              <div style={{ width: 28, height: 1, background: "linear-gradient(90deg, #7B1728, transparent)" }} />
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

            {/* Headline */}
            <div style={{ position: "relative", marginBottom: "2.4rem", lineHeight: 0.9 }}>
              <div
                className="h-your h-parallax"
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontWeight: 400, fontStyle: "italic",
                  fontSize: "clamp(3.8rem, 7vw, 6.5rem)",
                  color: "#5C1A24", letterSpacing: "-0.02em",
                  opacity: 0.72, lineHeight: 1, userSelect: "none",
                }}
              >
                your
              </div>
              <div
                className="h-choice h-parallax"
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontWeight: 800, fontStyle: "normal",
                  fontSize: "clamp(5.5rem, 10.5vw, 10rem)",
                  color: "#7B1728", letterSpacing: "-0.04em",
                  lineHeight: 0.88, userSelect: "none", marginTop: "-0.1em",
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
                      fontSize: "1.65rem", fontWeight: 700,
                      color: "#7B1728", lineHeight: 1.1,
                    }}>
                      {s.num}
                    </div>
                    <div style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "0.62rem", fontWeight: 600,
                      letterSpacing: "0.1em", textTransform: "uppercase",
                      color: "#A07070", marginTop: 3,
                    }}>
                      {s.label}
                    </div>
                  </div>
                  {i < stats.length - 1 && <span className="h-stat-dot" />}
                </div>
              ))}
            </div>
          </div>

          {/* ═══ RIGHT: Product Carousel ═══ */}
          <div style={{ position: "relative", zIndex: 20 }}>
            <ProductCarousel />
          </div>

        </div>

        {/* ── Bottom brand strip ─────────────────── */}
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