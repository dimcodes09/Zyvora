"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

/* ─── Quotes ─────────────────────────────────── */
const quotes = [
  { text: '"The perfect gift is waiting for you"', opacity: 0.85 },
  { text: '"Find the gift he\'ll love"', opacity: 0.55 },
  { text: '"Make every gift count"', opacity: 0.3 },
];

/* ─── Inline keyframes ───────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,800;1,700&family=Inter:wght@300;400;500;600&display=swap');

  @keyframes na-slide-left {
    from { opacity: 0; transform: translateX(-48px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes na-fade-up {
    from { opacity: 0; transform: translateY(28px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes na-quote-in {
    from { opacity: 0; transform: translateX(32px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes na-pulse-ring {
    0%, 100% { transform: translateY(-50%) scale(1); opacity: 0.25; }
    50%       { transform: translateY(-50%) scale(1.05); opacity: 0.1; }
  }
  @keyframes na-video-in {
    from { opacity: 0; transform: translateY(-50%) rotate(-2deg) scale(0.93); }
    to   { opacity: 1; transform: translateY(-50%) rotate(-2deg) scale(1); }
  }
  @keyframes na-heading-marquee {
    from { transform: translateX(0); }
    to   { transform: translateX(-50%); }
  }

  .na-card    { animation: na-slide-left 0.9s cubic-bezier(0.22,1,0.36,1) 0.2s both; }
  .na-subtext { animation: na-fade-up 0.8s ease 0.6s both; }
  .na-btn     { animation: na-fade-up 0.8s ease 0.8s both; }
  .na-italic  { animation: na-fade-up 0.8s ease 1s both; }
  .na-video-wrap { animation: na-video-in 1s cubic-bezier(0.22,1,0.36,1) 0.4s both; }
  .na-quote-0 { animation: na-quote-in 0.8s ease 0.7s both; }
  .na-quote-1 { animation: na-quote-in 0.8s ease 0.9s both; }
  .na-quote-2 { animation: na-quote-in 0.8s ease 1.1s both; }

  .na-btn-inner {
    transition: transform 0.25s ease, box-shadow 0.25s ease;
  }
  .na-btn-inner:hover {
    transform: scale(1.04) translateY(-2px);
    box-shadow: 0 14px 36px rgba(50,18,20,0.32) !important;
  }

  .na-heading-track {
    display: flex;
    width: max-content;
    animation: na-heading-marquee 18s linear infinite;
    align-items: baseline;
  }
  .na-heading-track:hover {
    animation-play-state: paused;
  }

  #na-three-canvas {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 1;
    opacity: 0.4;
  }
`;

/* ─── Heading marquee segment ─────────────────── */
function HeadingSegment() {
  return (
    <span style={{ display: "inline-flex", alignItems: "baseline", whiteSpace: "nowrap", paddingRight: "2rem" }}>
      <span style={{
        fontFamily: "'Playfair Display', Georgia, serif",
        fontWeight: 800,
        fontSize: "clamp(3.2rem, 6.5vw, 5rem)",
        letterSpacing: "-0.02em",
        color: "#5C1A24",
        lineHeight: 0.95,
      }}>NEW&nbsp;</span>
      <span style={{
        fontFamily: "'Playfair Display', Georgia, serif",
        fontWeight: 800,
        fontSize: "clamp(3.8rem, 7.5vw, 6rem)",
        letterSpacing: "-0.03em",
        color: "#9B3040",
        fontStyle: "italic",
        lineHeight: 0.95,
      }}>ARRIVALS</span>
      <span style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: "clamp(1.5rem, 3vw, 2.2rem)",
        color: "#C4A882",
        opacity: 0.55,
        margin: "0 1rem",
        lineHeight: 1,
      }}>✦</span>
    </span>
  );
}

/* ─── Component ─────────────────────────────── */
export default function NewArrivals() {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const threeCleanup = useRef<(() => void) | undefined>(undefined);

  useEffect(() => {
    let animId: number;
    (async () => {
      try {
        const THREE = await import("three");
        const canvas = canvasRef.current;
        if (!canvas) return;

        // ✅ Guard: wait until parent has real dimensions
        const parent = canvas.parentElement;
        if (!parent || parent.offsetWidth === 0 || parent.offsetHeight === 0) return;

        const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: "low-power" });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        renderer.setClearColor(0x000000, 0);

        const scene  = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
        camera.position.z = 5;

        const resize = () => {
          const w = canvas.parentElement?.offsetWidth ?? 0;
          const h = canvas.parentElement?.offsetHeight ?? 0;
          if (!w || !h) return; // ✅ skip if still 0
          renderer.setSize(w, h, false);
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
        };
        resize();
        window.addEventListener("resize", resize);

        const COUNT = 140;
        const geo   = new THREE.BufferGeometry();
        const pos   = new Float32Array(COUNT * 3);
        for (let i = 0; i < COUNT; i++) {
          pos[i * 3]     = (Math.random() - 0.5) * 14;
          pos[i * 3 + 1] = (Math.random() - 0.5) * 10;
          pos[i * 3 + 2] = (Math.random() - 0.5) * 6;
        }
        geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
        const mat    = new THREE.PointsMaterial({ color: 0xC97B84, size: 0.055, sizeAttenuation: true, transparent: true, opacity: 0.45 });
        const points = new THREE.Points(geo, mat);
        scene.add(points);

        const rg1  = new THREE.TorusGeometry(1.8, 0.003, 8, 120);
        const rm1  = new THREE.MeshBasicMaterial({ color: 0xE8B4BA, transparent: true, opacity: 0.15 });
        const ring1 = new THREE.Mesh(rg1, rm1);
        ring1.rotation.x = Math.PI / 4;
        scene.add(ring1);

        let t = 0;
        const animate = () => {
          animId = requestAnimationFrame(animate);
          t += 0.01;
          points.rotation.y = t * 0.035;
          points.rotation.x = t * 0.015;
          ring1.rotation.z  = t * 0.055;
          renderer.render(scene, camera);
        };
        animate();

        threeCleanup.current = () => {
          cancelAnimationFrame(animId);
          window.removeEventListener("resize", resize);
          geo.dispose(); mat.dispose(); renderer.dispose();
        };
      } catch (e) { console.warn("Three.js init failed", e); }
    })();
    return () => threeCleanup.current?.();
  }, []);

  return (
    <>
      <style>{STYLES}</style>

      <section
        ref={sectionRef}
        id="new-arrivals"
        style={{
          position: "relative",
          width: "100%",
          minHeight: "520px",
          overflow: "hidden",
          /* Dark warm background matching video's gift-box tones */
          background: "linear-gradient(135deg, #2C1A1D 0%, #3D2226 35%, #4A2A30 65%, #3A2020 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
          padding: "80px 0",
        }}
      >
        <canvas ref={canvasRef} id="na-three-canvas" />

        {/* Warm golden radial glow — mirrors candlelight in the video */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none",
          background: `
            radial-gradient(ellipse 50% 70% at 58% 50%, rgba(180,110,80,0.16) 0%, transparent 65%),
            radial-gradient(ellipse 30% 40% at 82% 28%, rgba(220,160,100,0.10) 0%, transparent 60%)
          `,
        }} />

        {/* Decorative rings */}
        <div style={{
          position: "absolute", right: "8%", top: "50%",
          transform: "translateY(-50%)",
          width: 340, height: 340, borderRadius: "50%",
          border: "1px dashed rgba(201,123,132,0.12)",
          animation: "na-pulse-ring 7s ease-in-out infinite",
          zIndex: 2, pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", right: "8%", top: "50%",
          transform: "translateY(-50%)",
          width: 500, height: 500, borderRadius: "50%",
          border: "1px dashed rgba(201,123,132,0.06)",
          animation: "na-pulse-ring 10s ease-in-out 2s infinite",
          zIndex: 2, pointerEvents: "none",
        }} />

        {/* ── Main grid ─────────────────────────── */}
        <div style={{
          position: "relative", zIndex: 10,
          width: "100%", maxWidth: 1280,
          margin: "0 auto",
          padding: "0 2.5rem",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "2rem",
          alignItems: "center",
        }}>

          {/* ═══════ LEFT: Card + Video ═══════ */}
          <div style={{ position: "relative", minHeight: 400 }}>

            {/* ── Video — taller, wider ── */}
            <div
              className="na-video-wrap"
              style={{
                position: "absolute",
                right: "-90px",
                top: "50%",
                transform: "translateY(-50%) rotate(-2deg)",
                zIndex: 20,
                pointerEvents: "none",
                width: "clamp(200px, 22vw, 285px)",
                borderRadius: "18px",
                overflow: "hidden",
                boxShadow: "0 36px 70px rgba(0,0,0,0.5), 0 8px 24px rgba(0,0,0,0.35)",
              }}
            >
              <video
                src="/him.mp4"
                autoPlay
                muted
                loop
                playsInline
                style={{
                  width: "100%",
                  display: "block",
                  objectFit: "cover",
                  aspectRatio: "3 / 5",
                  borderRadius: "18px",
                }}
              />
              {/* Warm vignette */}
              <div style={{
                position: "absolute", inset: 0,
                borderRadius: "18px",
                boxShadow: "inset 0 0 36px rgba(30,8,8,0.3)",
                pointerEvents: "none",
              }} />
            </div>

            {/* Pink card */}
            <div
              className="na-card"
              style={{
                background: "linear-gradient(145deg, #F9E4E7 0%, #F2D0D5 50%, #ECC4CB 100%)",
                borderRadius: "28px",
                padding: "clamp(1.8rem, 3vw, 2.8rem) clamp(2rem, 4vw, 3rem)",
                boxShadow: "0 24px 70px rgba(0,0,0,0.35), 0 2px 8px rgba(0,0,0,0.2)",
                position: "relative",
                overflow: "hidden",
                maxWidth: 480,
              }}
            >
              {/* Card inner glow */}
              <div style={{
                position: "absolute", top: -60, right: -60,
                width: 200, height: 200, borderRadius: "50%",
                background: "rgba(255,255,255,0.35)",
                filter: "blur(50px)",
                pointerEvents: "none",
              }} />

              {/* ── Scrolling "NEW ARRIVALS" marquee ── */}
              <div style={{
                overflow: "hidden",
                marginBottom: "1.2rem",
                WebkitMaskImage: "linear-gradient(90deg, transparent 0%, black 6%, black 94%, transparent 100%)",
                maskImage:       "linear-gradient(90deg, transparent 0%, black 6%, black 94%, transparent 100%)",
              }}>
                <div className="na-heading-track">
                  <HeadingSegment />
                  <HeadingSegment />
                  <HeadingSegment />
                  <HeadingSegment />
                </div>
              </div>

              {/* Divider */}
              <div style={{
                width: 48, height: 2,
                background: "linear-gradient(90deg, #9B3040, transparent)",
                marginBottom: "1.2rem",
                borderRadius: 2,
              }} />

              {/* Subtext */}
              <p className="na-subtext" style={{
                fontSize: "0.83rem",
                color: "#7A3A42",
                lineHeight: 1.6,
                marginBottom: "1.8rem",
                letterSpacing: "0.01em",
                maxWidth: 300,
              }}>
                Add these fresh new styles to your closet ASAP
              </p>

              {/* CTA */}
              <div className="na-btn">
                <Link href="/products" className="na-btn-inner" style={{
                  display: "inline-block",
                  padding: "11px 32px",
                  background: "#2A0A0E",
                  color: "#fff",
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  textDecoration: "none",
                  borderRadius: "4px",
                  boxShadow: "0 8px 24px rgba(42,10,14,0.28)",
                }}>
                  Shop Now
                </Link>
              </div>

              {/* Italic tagline */}
              <p className="na-italic" style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontStyle: "italic",
                fontSize: "0.75rem",
                color: "#9B5060",
                marginTop: "1.2rem",
                opacity: 0.72,
                letterSpacing: "0.01em",
              }}>
                The gifts are waiting to be inside you !!
              </p>
            </div>
          </div>

          {/* ═══════ RIGHT: Quotes — pushed further right ═══════ */}
          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: "1.8rem",
            padding: "1rem 0 1rem 7rem",   /* more left padding = further right */
          }}>
            {quotes.map((q, i) => (
              <div key={i} className={`na-quote-${i}`} style={{ opacity: q.opacity, transition: "opacity 0.3s ease" }}>
                <p style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontStyle: "italic",
                  fontSize: `clamp(1rem, ${1.4 - i * 0.12}vw, ${1.3 - i * 0.08}rem)`,
                  color: "#F0D8DC",
                  lineHeight: 1.45,
                  fontWeight: i === 0 ? 700 : 400,
                  letterSpacing: "-0.01em",
                }}>
                  {q.text}
                </p>
                {i < quotes.length - 1 && (
                  <div style={{
                    width: 32, height: 1,
                    background: "rgba(240,190,196,0.22)",
                    marginTop: "1rem",
                  }} />
                )}
              </div>
            ))}

            {/* Gold accent */}
            <div style={{
              marginTop: "2rem",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              opacity: 0.5,
            }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#C4A882" }} />
              <div style={{ width: 40, height: 1, background: "linear-gradient(90deg, #C4A882, transparent)" }} />
              <span style={{
                fontFamily: "'Playfair Display', serif",
                fontStyle: "italic",
                fontSize: "0.68rem",
                color: "#C4A882",
                letterSpacing: "0.08em",
              }}>
                Zyvora Collection
              </span>
            </div>
          </div>

        </div>
      </section>
    </>
  );
}