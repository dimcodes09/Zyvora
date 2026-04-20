"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";

/* ─── Quotes ─────────────────────────────────── */
const quotes = [
  { text: '"The perfect gift is waiting for you"', opacity: 0.85 },
  { text: '"Find the gift he\'ll love"', opacity: 0.55 },
  { text: '"Make every gift count"', opacity: 0.3 },
];

/* ─── Inline keyframes ───────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,800;1,700&display=swap');

  @keyframes na-float {
    0%, 100% { transform: translateY(0px) rotate(-2deg); }
    50%       { transform: translateY(-22px) rotate(2deg); }
  }
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
  @keyframes na-shimmer {
    0%   { background-position: -200% center; }
    100% { background-position:  200% center; }
  }
  @keyframes na-spin-slow {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes na-pulse-ring {
    0%, 100% { transform: scale(1); opacity: 0.35; }
    50%       { transform: scale(1.06); opacity: 0.15; }
  }

  .na-card { animation: na-slide-left 0.9s cubic-bezier(0.22,1,0.36,1) 0.2s both; }
  .na-subtext { animation: na-fade-up 0.8s ease 0.6s both; }
  .na-btn { animation: na-fade-up 0.8s ease 0.8s both; }
  .na-italic { animation: na-fade-up 0.8s ease 1s both; }
  .na-product {
    animation: na-float 6s ease-in-out infinite;
    filter: drop-shadow(0 28px 48px rgba(140,50,60,0.26));
  }
  .na-btn-inner {
    transition: transform 0.25s ease, box-shadow 0.25s ease;
  }
  .na-btn-inner:hover {
    transform: scale(1.04) translateY(-2px);
    box-shadow: 0 14px 36px rgba(50,18,20,0.32) !important;
  }

  /* Three.js canvas overlay */
  #na-three-canvas {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 1;
    opacity: 0.55;
  }
`;

/* ─── Component ─────────────────────────────── */
export default function NewArrivals() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const threeCleanup = useRef<(() => void) | undefined>(undefined);

  /* ── Three.js floating particles ─────────── */
  useEffect(() => {
    let THREE: typeof import("three") | null = null;
    let animId: number;

    (async () => {
      try {
        THREE = await import("three");
        const canvas = canvasRef.current;
        if (!canvas) return;

        const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setClearColor(0x000000, 0);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
        camera.position.z = 5;

        /* Resize helper */
        const resize = () => {
          const { offsetWidth: w, offsetHeight: h } = canvas.parentElement!;
          renderer.setSize(w, h);
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
        };
        resize();
        window.addEventListener("resize", resize);

        /* Particles */
        const COUNT = 160;
        const geo = new THREE.BufferGeometry();
        const pos = new Float32Array(COUNT * 3);
        const sizes = new Float32Array(COUNT);
        for (let i = 0; i < COUNT; i++) {
          pos[i * 3]     = (Math.random() - 0.5) * 14;
          pos[i * 3 + 1] = (Math.random() - 0.5) * 10;
          pos[i * 3 + 2] = (Math.random() - 0.5) * 6;
          sizes[i] = Math.random() * 2.5 + 0.8;
        }
        geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
        geo.setAttribute("size",     new THREE.BufferAttribute(sizes, 1));

        const mat = new THREE.PointsMaterial({
          color: 0xC97B84,
          size: 0.06,
          sizeAttenuation: true,
          transparent: true,
          opacity: 0.6,
        });

        const points = new THREE.Points(geo, mat);
        scene.add(points);

        /* Subtle torus rings */
        const ringGeo = new THREE.TorusGeometry(1.8, 0.003, 8, 120);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0xE8B4BA, transparent: true, opacity: 0.22 });
        const ring1 = new THREE.Mesh(ringGeo, ringMat);
        ring1.rotation.x = Math.PI / 4;
        scene.add(ring1);

        const ring2Geo = new THREE.TorusGeometry(2.6, 0.002, 8, 120);
        const ring2Mat = new THREE.MeshBasicMaterial({ color: 0xC9A080, transparent: true, opacity: 0.13 });
        const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
        ring2.rotation.x = -Math.PI / 6;
        ring2.rotation.y = Math.PI / 5;
        scene.add(ring2);

        /* Animate */
        const clock = new THREE.Clock();
        const animate = () => {
          animId = requestAnimationFrame(animate);
          const t = clock.getElapsedTime();
          points.rotation.y = t * 0.04;
          points.rotation.x = t * 0.018;
          ring1.rotation.z = t * 0.06;
          ring2.rotation.z = -t * 0.04;
          renderer.render(scene, camera);
        };
        animate();

        threeCleanup.current = () => {
          cancelAnimationFrame(animId);
          window.removeEventListener("resize", resize);
          geo.dispose();
          mat.dispose();
          renderer.dispose();
        };
      } catch (e) {
        console.warn("Three.js init failed", e);
      }
    })();

    return () => threeCleanup.current?.();
  }, []);

  /* ── GSAP scroll reveal ─────────────────────── */
  useEffect(() => {
    let gsapCleanup: (() => void) | undefined;

    (async () => {
      try {
        const { gsap } = await import("gsap");
        const { ScrollTrigger } = await import("gsap/ScrollTrigger");
        gsap.registerPlugin(ScrollTrigger);

        const ctx = gsap.context(() => {
          /* Card slide-in */
          gsap.from(".na-gsap-card", {
            x: -60, opacity: 0, duration: 1.1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: ".na-gsap-card",
              start: "top 80%",
              toggleActions: "play none none none",
            },
          });

          /* Product image appear */
          gsap.from(".na-gsap-product", {
            y: 40, opacity: 0, scale: 0.88,
            duration: 1.3, ease: "elastic.out(1,0.7)", delay: 0.3,
            scrollTrigger: {
              trigger: ".na-gsap-card",
              start: "top 80%",
              toggleActions: "play none none none",
            },
          });

          /* Quotes stagger */
          gsap.from(".na-gsap-quote", {
            x: 40, opacity: 0, duration: 0.9, stagger: 0.2,
            ease: "power2.out",
            scrollTrigger: {
              trigger: ".na-gsap-quotes",
              start: "top 78%",
              toggleActions: "play none none none",
            },
          });
        }, sectionRef);

        gsapCleanup = () => ctx.revert();
      } catch (e) {
        console.warn("GSAP init failed", e);
      }
    })();

    return () => gsapCleanup?.();
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
          background: "linear-gradient(135deg, #F5EDE8 0%, #EFE4DC 40%, #E8DDD6 100%)",
          display: "flex",
          alignItems: "center",
          padding: "80px 0",
        }}
      >
        {/* Three.js canvas */}
        <canvas ref={canvasRef} id="na-three-canvas" />

        {/* Subtle radial glow */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none",
          background: "radial-gradient(ellipse 55% 60% at 78% 50%, rgba(232,180,186,0.22) 0%, transparent 70%)",
        }} />

        {/* Decorative spin rings (right-side ambience) */}
        <div style={{
          position: "absolute", right: "8%", top: "50%",
          transform: "translateY(-50%)",
          width: 340, height: 340,
          borderRadius: "50%",
          border: "1px dashed rgba(201,123,132,0.18)",
          animation: "na-pulse-ring 7s ease-in-out infinite",
          zIndex: 2, pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", right: "8%", top: "50%",
          transform: "translateY(-50%)",
          width: 480, height: 480,
          borderRadius: "50%",
          border: "1px dashed rgba(201,123,132,0.10)",
          animation: "na-pulse-ring 9s ease-in-out 2s infinite",
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

          {/* ═══════ LEFT SIDE ═══════ */}
          <div style={{ position: "relative" }}>

            {/* Floating product image */}
            <div
              className="na-product na-gsap-product"
              style={{
                position: "absolute",
                right: "-14%",
                top: "50%",
                transform: "translateY(-50%) rotate(-2deg)",
                zIndex: 20,
                width: "clamp(160px, 16vw, 220px)",
                pointerEvents: "none",
              }}
            >
              <Image
                src="/handbag-luxury.png"
                alt="Luxury handbag – New Arrival"
                width={220}
                height={280}
                style={{
                  width: "100%",
                  height: "auto",
                  objectFit: "contain",
                  borderRadius: "12px",
                }}
                priority
              />
            </div>

            {/* Pink card */}
            <div
              className="na-card na-gsap-card"
              style={{
                background: "linear-gradient(145deg, #F9E4E7 0%, #F2D0D5 50%, #ECC4CB 100%)",
                borderRadius: "28px",
                padding: "clamp(2.2rem, 4vw, 3.5rem) clamp(2rem, 4vw, 3rem)",
                boxShadow: "0 20px 60px rgba(180,90,100,0.14), 0 2px 8px rgba(180,90,100,0.08)",
                position: "relative",
                overflow: "hidden",
                maxWidth: 480,
              }}
            >
              {/* Card inner glow */}
              <div style={{
                position: "absolute", top: -60, right: -60,
                width: 200, height: 200,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.35)",
                filter: "blur(50px)",
                pointerEvents: "none",
              }} />

              {/* Serif heading */}
              <h2
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontWeight: 800,
                  lineHeight: 0.95,
                  marginBottom: "1.2rem",
                  color: "#5C1A24",
                  userSelect: "none",
                }}
              >
                <span style={{
                  display: "block",
                  fontSize: "clamp(3.2rem, 6.5vw, 5rem)",
                  letterSpacing: "-0.02em",
                }}>
                  NEW
                </span>
                <span style={{
                  display: "block",
                  fontSize: "clamp(3.8rem, 7.5vw, 6rem)",
                  letterSpacing: "-0.03em",
                  color: "#9B3040",
                  fontStyle: "italic",
                }}>
                  ARRIVALS
                </span>
              </h2>

              {/* Divider */}
              <div style={{
                width: 48, height: 2,
                background: "linear-gradient(90deg, #9B3040, transparent)",
                marginBottom: "1.2rem",
                borderRadius: 2,
              }} />

              {/* Subtext */}
              <p
                className="na-subtext"
                style={{
                  fontSize: "0.83rem",
                  color: "#7A3A42",
                  lineHeight: 1.6,
                  marginBottom: "1.8rem",
                  letterSpacing: "0.01em",
                  maxWidth: 300,
                }}
              >
                Add these fresh new styles to your closet ASAP
              </p>

              {/* CTA Button */}
              <div className="na-btn">
                <Link
                  href="/products"
                  className="na-btn-inner"
                  style={{
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
                  }}
                >
                  Shop Now
                </Link>
              </div>

              {/* Italic tagline */}
              <p
                className="na-italic"
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontStyle: "italic",
                  fontSize: "0.75rem",
                  color: "#9B5060",
                  marginTop: "1.2rem",
                  opacity: 0.72,
                  letterSpacing: "0.01em",
                }}
              >
                The gifts are waiting to be inside you !!
              </p>
            </div>
          </div>

          {/* ═══════ RIGHT SIDE ═══════ */}
          <div
            className="na-gsap-quotes"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1.8rem",
              padding: "1rem 0 1rem 3rem",
            }}
          >
            {quotes.map((q, i) => (
              <div
                key={i}
                className="na-gsap-quote"
                style={{
                  opacity: q.opacity,
                  transition: "opacity 0.3s ease",
                }}
              >
                <p
                  style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontStyle: "italic",
                    fontSize: `clamp(1rem, ${1.4 - i * 0.12}vw, ${1.3 - i * 0.08}rem)`,
                    color: "#5C3038",
                    lineHeight: 1.45,
                    fontWeight: i === 0 ? 700 : 400,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {q.text}
                </p>
                {i < quotes.length - 1 && (
                  <div style={{
                    width: 32, height: 1,
                    background: "rgba(156,80,90,0.22)",
                    marginTop: "1rem",
                  }} />
                )}
              </div>
            ))}

            {/* Decorative gold accent */}
            <div style={{
              marginTop: "2rem",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              opacity: 0.45,
            }}>
              <div style={{
                width: 8, height: 8,
                borderRadius: "50%",
                background: "#C4A882",
              }} />
              <div style={{
                width: 40, height: 1,
                background: "linear-gradient(90deg, #C4A882, transparent)",
              }} />
              <span style={{
                fontFamily: "'Playfair Display', serif",
                fontStyle: "italic",
                fontSize: "0.68rem",
                color: "#8A6A50",
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