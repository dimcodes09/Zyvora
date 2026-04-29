"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";

/* ─── Product data ──────────────────────────────────────── */
const GIFTS = [
  {
    id: 0,
    name: "Harry Potter Wizard Box",
    tag: "Magical ✨",
    price: "₹3,499",
    href: "/products",
    img: "https://res.cloudinary.com/djsd3uxbz/image/upload/v1777443546/20322807c2cabebf3a673a00555ee50e_goi8ii.jpg",
  },
  {
    id: 1,
    name: "Marvel Superhero Kit",
    tag: "Hero 🔥",
    price: "₹2,999",
    href: "/products",
    img: "https://res.cloudinary.com/djsd3uxbz/image/upload/v1777443824/43833b1546c6aa213c2b4495fe6ce62a_b1vrqe.jpg",
  },
  {
    id: 2,
    name: "DC Dark Knight Box",
    tag: "Vigilante 🖤",
    price: "₹3,200",
    href: "/products",
    img: "https://res.cloudinary.com/djsd3uxbz/image/upload/v1777444640/cb065b604aaf4289ab860babbdb5ccd5_qjuvks.jpg",
  },
  {
    id: 3,
    name: "Disney Princess Core",
    tag: "Dreamy 👑",
    price: "₹2,499",
    href: "/products",
    img: "https://res.cloudinary.com/djsd3uxbz/image/upload/v1777444842/d935e54e1a3a85cdee74852db80127a3_nvdobg.jpg",
  },
  {
    id: 4,
    name: "JJK Manga",
    tag: "JJK",
    price: "₹2,799",
    href: "/products",
    img: "https://res.cloudinary.com/djsd3uxbz/image/upload/v1777444997/eee2d9179d1443eb3333da0b8f20d4f5_zzzooz.jpg",
  },
  {
    id: 6,
    name: "Stranger Things Vibes",
    tag: "Retro ⚡",
    price: "₹2,899",
    href: "/products",
    img: "https://res.cloudinary.com/djsd3uxbz/image/upload/v1777445177/0693a1054f935b5c99b0b1d38a5578c2_p2c91a.jpg",
  },
  {
    id: 8,
    name: "Wednesday Gothic Collection",
    tag: "Dark 🖤",
    price: "₹2,700",
    href: "/products",
    img: "https://res.cloudinary.com/djsd3uxbz/image/upload/v1777445400/63b161eb4137e42dd0b7f5d336f11ddd_txitef.jpg",
  },
  {
    id: 10,
    name: "HOt Wheels Bouquet",
    tag: "HOt WHeels",
    price: "₹3,800",
    href: "/products",
    img: "https://res.cloudinary.com/djsd3uxbz/image/upload/v1777445609/94529d7a3eb82ebf039ad73c75f0fcfe_xoj5bw.jpg",
  },
];
/* ─── Tag colour mapping ────────────────────────────────── */
const TAG_COLORS: Record<string, string> = {
  Bestseller: "#7B1728",
  "New Arrival": "#4A6741",
  "Limited Edition": "#6B4226",
  "Most Loved": "#C97B84",
  Exclusive: "#4A4070",
};

/* ─── Styles ─────────────────────────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,700;0,800;1,400;1,700&family=Inter:wght@300;400;500;600&display=swap');

  .mlg-section {
    position: relative;
    overflow: visible;
    padding: 4.5rem 2rem 4rem;
    min-height: auto;
    background: linear-gradient(160deg, #F9F4F0 0%, #F5EDE8 40%, #F0E6EE 80%, #EEE8F5 100%);
  }

  /* ── Section fade-in ── */
  .mlg-section[data-visible="false"] .mlg-head,
  .mlg-section[data-visible="false"] .mlg-carousel-wrap {
    opacity: 0;
    transform: translateY(36px);
  }
  .mlg-head, .mlg-carousel-wrap {
    transition: opacity 0.8s cubic-bezier(0.16,1,0.3,1),
                transform 0.8s cubic-bezier(0.16,1,0.3,1);
  }
  .mlg-carousel-wrap {
    transition-delay: 0.12s;
  }

  /* ── Three.js canvas ── */
  .mlg-three-canvas {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 1;
    opacity: 0.5;
  }

  /* ── 3D Carousel ── */
  .mlg-carousel-viewport {
    perspective: 1600px;
    perspective-origin: 50% 45%;
  }
  .mlg-track {
    transform-style: preserve-3d;
  }
  .mlg-card-wrap {
    position: absolute;
    top: 0;
    left: 50%;
    transform-style: preserve-3d;
    cursor: pointer;
    transition: transform 0.7s cubic-bezier(0.33, 1, 0.68, 1),
                opacity   0.7s cubic-bezier(0.33, 1, 0.68, 1),
                filter    0.7s ease;
  }
  .mlg-card-inner {
    width: 100%;
    height: 100%;
    border-radius: 18px;
    overflow: hidden;
    position: relative;
    box-shadow: 0 10px 36px rgba(0,0,0,0.16);
    transition: box-shadow 0.4s ease;
  }
  .mlg-card-inner:hover {
    box-shadow: 0 20px 56px rgba(26,8,14,0.28);
  }
  .mlg-card-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    transition: transform 0.6s cubic-bezier(0.25,1,0.5,1);
  }
  .mlg-card-inner:hover .mlg-card-img {
    transform: scale(1.05);
  }
  .mlg-cta-btn {
    opacity: 0;
    transform: translateY(8px);
    transition: opacity 0.3s ease, transform 0.3s ease;
  }
  .mlg-card-inner:hover .mlg-cta-btn {
    opacity: 1;
    transform: translateY(0);
  }
  .mlg-card-content {
    transition: transform 0.4s cubic-bezier(0.25,1,0.5,1);
  }
  .mlg-card-inner:hover .mlg-card-content {
    transform: translateY(-6px);
  }

  /* ── Nav dots ── */
  .mlg-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: rgba(201,123,132,0.28);
    border: none;
    padding: 0;
    cursor: pointer;
    transition: width 0.3s ease, background 0.3s ease, border-radius 0.3s ease;
    flex-shrink: 0;
  }
  .mlg-dot.active {
    width: 26px;
    background: #C97B84;
    border-radius: 4px;
  }

  /* ── Arrow buttons ── */
  .mlg-arrow {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    border: 1px solid rgba(201,123,132,0.25);
    background: rgba(255,255,255,0.8);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #7B1728;
    font-size: 1rem;
    transition: background 0.25s ease, border-color 0.25s ease,
                transform 0.2s ease, box-shadow 0.25s ease;
    box-shadow: 0 3px 14px rgba(201,123,132,0.12);
  }
  .mlg-arrow:hover {
    background: #7B1728;
    border-color: #7B1728;
    color: #fff;
    transform: scale(1.06);
    box-shadow: 0 6px 22px rgba(123,23,40,0.24);
  }

  /* ── Responsiveness ── */
  @media (max-width: 768px) {
    .mlg-section {
      padding: 3rem 1rem 3rem;
    }
    .mlg-carousel-viewport {
      perspective: none !important;
    }
    .mlg-three-canvas {
      opacity: 0.35;
    }
  }
  @media (max-width: 480px) {
    .mlg-section {
      padding: 2.5rem 0.5rem 2.5rem;
    }
  }
`;

/* ─── Helpers ──────────────────────────────────────────── */
const CARD_W_DESKTOP = "clamp(220px, 24vw, 310px)";
const CARD_H_DESKTOP = "clamp(300px, 38vw, 420px)";
const CARD_W_MOBILE = "clamp(200px, 65vw, 280px)";
const CARD_H_MOBILE = "clamp(260px, 80vw, 380px)";

function getCardTransform(offset: number, isMobile: boolean) {
  if (isMobile) {
    return {
      x: offset * 100 + "%",
      z: 0,
      rotY: 0,
      scale: offset === 0 ? 1 : 0.88,
      opacity: Math.abs(offset) <= 1 ? (offset === 0 ? 1 : 0.5) : 0,
      blur: offset === 0 ? 0 : 2,
    };
  }
  const absOff = Math.abs(offset);
  const x =
    offset === 0
      ? "-50%"
      : `calc(-50% + ${offset * 220}px)`;
  const z = -absOff * 120;
  const rotY = offset * -24;
  const scale = absOff === 0 ? 1 : absOff === 1 ? 0.82 : 0.65;
  const opacity = absOff === 0 ? 1 : absOff === 1 ? 0.7 : absOff === 2 ? 0.38 : 0;
  const blur = absOff === 0 ? 0 : absOff === 1 ? 2 : 4.5;
  return { x, z, rotY, scale, opacity, blur };
}

/* ─── Component ─────────────────────────────────────────── */
export default function Categories() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hoverPaused = useRef(false);
  const mouseRef = useRef({ x: 0, y: 0 });
  const isVisibleRef = useRef(false);

  const [active, setActive] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const [visible, setVisible] = useState(false);
  const total = GIFTS.length;

  /* ── mobile detect ───────────────────────────────────── */
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  /* ── IntersectionObserver for fade-in + Three.js gate ── */
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting;
        if (entry.isIntersecting && !visible) setVisible(true);
      },
      { threshold: 0.05 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [visible]);

  /* ── Mouse tracking (lightweight — no per-card tilt) ── */
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1,
      };
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  /* ── Three.js — optimised dreamy orb + sparkles ─────── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let raf = 0;
    let cleanup: (() => void) | undefined;

    (async () => {
      try {
        const THREE = await import("three");

        /* Renderer — capped pixel ratio, alpha, no antialias for perf */
        const renderer = new THREE.WebGLRenderer({
          canvas,
          alpha: true,
          antialias: false,
          powerPreference: "low-power",
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        renderer.setClearColor(0x000000, 0);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 80);
        camera.position.z = 5;

        /* ── Resize ── */
        const resize = () => {
          const w = canvas.clientWidth;
          const h = canvas.clientHeight;
          if (!w || !h) return;
          renderer.setSize(w, h, false);
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
        };
        resize();
        window.addEventListener("resize", resize);

        /* ── Central glowing orb (low-poly icosahedron) ── */
        const orbGeo = new THREE.IcosahedronGeometry(1.2, 4);
        const orbMat = new THREE.MeshStandardMaterial({
          color: 0xD4909C,
          roughness: 0.5,
          metalness: 0.05,
          transparent: true,
          opacity: 0.32,
        });
        const orb = new THREE.Mesh(orbGeo, orbMat);
        scene.add(orb);

        /* ── Thin orbital rings ── */
        const makeRing = (
          radius: number,
          tube: number,
          col: number,
          op: number,
          rotX: number,
          rotZ = 0,
        ) => {
          const m = new THREE.Mesh(
            new THREE.TorusGeometry(radius, tube, 6, 64),
            new THREE.MeshBasicMaterial({
              color: col,
              transparent: true,
              opacity: op,
            }),
          );
          m.rotation.x = rotX;
          m.rotation.z = rotZ;
          scene.add(m);
          return m;
        };

        const ring1 = makeRing(1.9, 0.012, 0xE8B4BA, 0.2, Math.PI / 3.5);
        const ring2 = makeRing(2.5, 0.008, 0xC4A882, 0.12, -Math.PI / 4, Math.PI / 6);

        /* ── Sparkle particles (low count) ── */
        const PCOUNT = 60;
        const pGeo = new THREE.BufferGeometry();
        const pPos = new Float32Array(PCOUNT * 3);
        const pSizes = new Float32Array(PCOUNT);
        for (let i = 0; i < PCOUNT; i++) {
          // Distribute in a spherical shell
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(2 * Math.random() - 1);
          const r = 2.2 + Math.random() * 5;
          pPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
          pPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
          pPos[i * 3 + 2] = r * Math.cos(phi);
          pSizes[i] = 0.03 + Math.random() * 0.05;
        }
        pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));

        const pMat = new THREE.PointsMaterial({
          color: 0xC97B84,
          size: 0.05,
          sizeAttenuation: true,
          transparent: true,
          opacity: 0.5,
        });
        const particles = new THREE.Points(pGeo, pMat);
        scene.add(particles);

        /* ── Lights ── */
        scene.add(new THREE.AmbientLight(0xfff0f0, 1.2));
        const pl1 = new THREE.PointLight(0xFFAEC0, 2.5, 10);
        pl1.position.set(2, 2.5, 3);
        scene.add(pl1);
        const pl2 = new THREE.PointLight(0xC4A882, 1.2, 8);
        pl2.position.set(-2.5, -1.5, 2);
        scene.add(pl2);

        /* ── Animate loop (visibility-gated, manual timing) ── */
        let t = 0;
        let lastTime = performance.now();

        const tick = () => {
          raf = requestAnimationFrame(tick);

          // Skip rendering when off-screen for performance
          if (!isVisibleRef.current) return;

          const now = performance.now();
          t += (now - lastTime) * 0.001; // seconds elapsed
          lastTime = now;

          const mx = mouseRef.current.x;
          const my = mouseRef.current.y;

          // Orb — gentle rotation + mouse parallax
          orb.rotation.x = Math.sin(t * 0.3) * 0.3;
          orb.rotation.y = t * 0.2 + mx * 0.4;
          orb.position.y = Math.sin(t * 0.45) * 0.15 + my * 0.2;
          orb.position.x = mx * 0.15;

          // Subtle breathe scale
          const breathe = 1 + Math.sin(t * 0.6) * 0.04;
          orb.scale.setScalar(breathe);

          // Rings — slow orbit
          ring1.rotation.y = t * 0.14;
          ring2.rotation.y = -t * 0.1;
          ring2.rotation.z = Math.PI / 6 + t * 0.03;

          // Particles — slow drift + mouse parallax
          particles.rotation.y = t * 0.018 + mx * 0.06;
          particles.rotation.x = t * 0.008 + my * 0.04;

          // Subtle particle twinkle via opacity
          pMat.opacity = 0.4 + Math.sin(t * 1.2) * 0.15;

          renderer.render(scene, camera);
        };
        tick();

        cleanup = () => {
          cancelAnimationFrame(raf);
          window.removeEventListener("resize", resize);
          orbGeo.dispose();
          orbMat.dispose();
          pGeo.dispose();
          pMat.dispose();
          ring1.geometry.dispose();
          (ring1.material as any).dispose();
          ring2.geometry.dispose();
          (ring2.material as any).dispose();
          scene.clear();
          renderer.dispose();
        };
      } catch (e) {
        console.warn("Three.js init failed — falling back to CSS", e);
      }
    })();

    return () => cleanup?.();
  }, []);

  /* ── Navigation helpers ──────────────────────────────── */
  const goTo = useCallback((idx: number) => {
    setActive(((idx % total) + total) % total);
  }, [total]);

  const prev = useCallback(() => goTo(active - 1), [active, goTo]);
  const next = useCallback(() => goTo(active + 1), [active, goTo]);

  /* ── Auto rotation ───────────────────────────────────── */
  const startAuto = useCallback(() => {
    if (autoRef.current) clearInterval(autoRef.current);
    autoRef.current = setInterval(() => {
      if (!hoverPaused.current) {
        setActive((a) => (a + 1) % total);
      }
    }, 4000);
  }, [total]);

  useEffect(() => {
    startAuto();
    return () => { if (autoRef.current) clearInterval(autoRef.current); };
  }, [startAuto]);

  /* ── Touch / swipe ───────────────────────────────────── */
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    let sx = 0;
    const onStart = (e: TouchEvent) => { sx = e.touches[0].clientX; };
    const onEnd = (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 40) dx < 0 ? next() : prev();
    };
    el.addEventListener("touchstart", onStart, { passive: true });
    el.addEventListener("touchend", onEnd, { passive: true });
    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchend", onEnd);
    };
  }, [next, prev]);

  /* ── keyboard nav ────────────────────────────────────── */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prev, next]);

  /* ── Render each card in 3D ──────────────────────────── */
  const getStyle = (idx: number): React.CSSProperties => {
    const offset = ((idx - active + total) % total + total) % total;
    const centered = offset > total / 2 ? offset - total : offset;
    const { x, z, rotY, scale, opacity, blur } = getCardTransform(centered, isMobile);
    const cardW = isMobile ? CARD_W_MOBILE : CARD_W_DESKTOP;

    return {
      width: isMobile ? CARD_W_MOBILE : CARD_W_DESKTOP,
      height: isMobile ? CARD_H_MOBILE : CARD_H_DESKTOP,
      transform: `translateX(${x}) translateZ(${z}px) rotateY(${rotY}deg) scale(${scale})`,
      opacity,
      filter: blur > 0 ? `blur(${blur}px)` : "none",
      zIndex: 10 - Math.abs(centered),
      marginLeft: `calc(-${cardW} / 2)`,
      pointerEvents: Math.abs(centered) <= 2 ? "auto" : "none",
    };
  };

  return (
    <>
      <style>{STYLES}</style>

      <section
        ref={sectionRef}
        id="most-loved-gifts"
        className="mlg-section"
        aria-label="Most Loved Gifts Showcase"
        data-visible={visible ? "true" : "false"}
      >
        {/* ── Three.js canvas (dreamy orb + sparkles) ── */}
        <canvas ref={canvasRef} className="mlg-three-canvas" aria-hidden="true" />

        {/* ── CSS fallback ambient blobs (visible behind canvas) ── */}
        <div aria-hidden="true" style={{
          position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden",
        }}>
          <div style={{
            position: "absolute",
            top: "50%", left: "50%",
            width: "min(600px, 80vw)", height: "min(600px, 80vw)",
            borderRadius: "50%",
            transform: "translate(-50%, -55%)",
            background: "radial-gradient(circle, rgba(218,172,180,0.18) 0%, rgba(201,123,132,0.06) 40%, transparent 70%)",
            filter: "blur(40px)",
          }} />
          <div style={{
            position: "absolute",
            top: "-10%", left: "-8%",
            width: 380, height: 380, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(201,123,132,0.08) 0%, transparent 65%)",
            filter: "blur(50px)",
          }} />
          <div style={{
            position: "absolute",
            bottom: "-8%", right: "-6%",
            width: 320, height: 320, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(180,148,200,0.06) 0%, transparent 65%)",
            filter: "blur(45px)",
          }} />
        </div>

        {/* ── CONTENT ── */}
        <div style={{ position: "relative", zIndex: 10, maxWidth: 1280, margin: "0 auto" }}>

          {/* ─── HEADING ─────────────────────────────────── */}
          <div className="mlg-head" style={{ textAlign: "center", marginBottom: "2.8rem" }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "0.7rem",
              fontSize: "0.6rem", letterSpacing: "0.22em", textTransform: "uppercase",
              color: "#C97B84", marginBottom: "1rem",
              fontFamily: "'Inter', sans-serif", fontWeight: 500,
            }}>
              <span style={{ display: "block", width: 32, height: 1, background: "linear-gradient(90deg,transparent,#C97B84)" }} />
              Curated with Love
              <span style={{ display: "block", width: 32, height: 1, background: "linear-gradient(90deg,#C97B84,transparent)" }} />
            </div>

            <h2 style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontWeight: 500,
              lineHeight: 1.12,
              margin: 0,
              color: "#1C0A12",
              fontSize: "clamp(2.2rem, 5vw, 3.6rem)",
              letterSpacing: "-0.02em",
            }}>
              Most{" "}
              <span style={{
                fontStyle: "italic",
                fontWeight: 700,
                background: "linear-gradient(135deg, #C97B84 0%, #9B3040 60%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>
                Loved
              </span>{" "}
              <em style={{
                color: "#C97B84",
                fontStyle: "italic",
                fontWeight: 400,
              }}>
                Gifts
              </em>
            </h2>

            <p style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "0.82rem",
              color: "#8A6A72",
              lineHeight: 1.7,
              maxWidth: 360,
              margin: "0.9rem auto 0",
              fontWeight: 300,
              letterSpacing: "0.02em",
            }}>
              Handpicked treasures — adored by thousands, crafted for the extraordinary.
            </p>
          </div>

          {/* ─── 3D CAROUSEL ─────────────────────────────── */}
          <div className="mlg-carousel-wrap" style={{ position: "relative" }}>
            <div
              className="mlg-carousel-viewport"
              style={{
                position: "relative",
                height: isMobile ? "clamp(280px, 82vw, 400px)" : "clamp(320px, 42vw, 440px)",
                overflow: "visible",
              }}
              onMouseEnter={() => { hoverPaused.current = true; }}
              onMouseLeave={() => { hoverPaused.current = false; }}
            >
              <div className="mlg-track" style={{ position: "relative", width: "100%", height: "100%" }}>
                {GIFTS.map((gift, idx) => {
                  const offset = ((idx - active + total) % total + total) % total;
                  const centered = offset > total / 2 ? offset - total : offset;
                  const isActive = centered === 0;

                  return (
                    <div
                      key={gift.id}
                      className="mlg-card-wrap"
                      style={getStyle(idx)}
                      onClick={() => !isActive && goTo(idx)}
                      aria-label={`${gift.name} — ${gift.price}`}
                    >
                      <div className="mlg-card-inner">
                        {/* Image */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          className="mlg-card-img"
                          src={gift.img}
                          alt={gift.name}
                          loading={isActive ? "eager" : "lazy"}
                          style={{ position: "absolute", inset: 0 }}
                        />

                        {/* Gradient overlay */}
                        <div
                          aria-hidden="true"
                          style={{
                            position: "absolute", inset: 0,
                            background: "linear-gradient(to bottom, rgba(0,0,0,0.02) 0%, rgba(0,0,0,0.06) 40%, rgba(0,0,0,0.72) 100%)",
                            zIndex: 2,
                          }}
                        />

                        {/* Tag */}
                        <div style={{ position: "absolute", top: 16, left: 16, zIndex: 10 }}>
                          <span style={{
                            display: "inline-block",
                            padding: "4px 11px",
                            borderRadius: 50,
                            fontSize: "0.54rem",
                            letterSpacing: "0.18em",
                            textTransform: "uppercase",
                            fontFamily: "'Inter', sans-serif",
                            fontWeight: 600,
                            color: "#fff",
                            background: TAG_COLORS[gift.tag] ?? "#7B1728",
                            boxShadow: "0 3px 12px rgba(0,0,0,0.2)",
                          }}>
                            {gift.tag}
                          </span>
                        </div>

                        {/* Bottom card content */}
                        <div
                          className="mlg-card-content"
                          style={{
                            position: "absolute", bottom: 0, left: 0, right: 0,
                            zIndex: 10,
                            padding: "1.4rem 1.2rem 1.2rem",
                            background: "linear-gradient(to top, rgba(0,0,0,0.68) 0%, transparent 100%)",
                          }}
                        >
                          <h3 style={{
                            fontFamily: "'Playfair Display', Georgia, serif",
                            fontWeight: 500,
                            fontSize: isActive ? "1.1rem" : "0.92rem",
                            color: "#fff",
                            margin: "0 0 0.3rem",
                            lineHeight: 1.25,
                            letterSpacing: "-0.01em",
                          }}>
                            {gift.name}
                          </h3>

                          <p style={{
                            fontFamily: "'Inter', sans-serif",
                            fontSize: "0.76rem",
                            color: "rgba(255,255,255,0.65)",
                            margin: 0,
                            letterSpacing: "0.04em",
                          }}>
                            {gift.price}
                          </p>

                          {/* CTA */}
                          <Link
                            href={gift.href}
                            className="mlg-cta-btn"
                            onClick={(e) => e.stopPropagation()}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0.5rem",
                              marginTop: "0.7rem",
                              fontSize: "0.56rem",
                              letterSpacing: "0.2em",
                              textTransform: "uppercase",
                              fontFamily: "'Inter', sans-serif",
                              fontWeight: 600,
                              color: "rgba(255,255,255,0.85)",
                              textDecoration: "none",
                              borderBottom: "1px solid rgba(255,255,255,0.4)",
                              paddingBottom: 2,
                            }}
                          >
                            View Product →
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ─── Arrow Navigation ─────────────────────── */}
            <button
              className="mlg-arrow"
              onClick={prev}
              aria-label="Previous gift"
              style={{
                position: "absolute",
                left: "clamp(8px, 3%, 40px)",
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: 20,
              }}
            >
              ←
            </button>

            <button
              className="mlg-arrow"
              onClick={next}
              aria-label="Next gift"
              style={{
                position: "absolute",
                right: "clamp(8px, 3%, 40px)",
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: 20,
              }}
            >
              →
            </button>
          </div>

          {/* ─── Dot Navigation ───────────────────────── */}
          <div
            role="tablist"
            aria-label="Gift navigation"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              marginTop: "2rem",
            }}
          >
            {GIFTS.map((_, idx) => (
              <button
                key={idx}
                role="tab"
                aria-selected={idx === active}
                aria-label={`Go to gift ${idx + 1}`}
                className={`mlg-dot${idx === active ? " active" : ""}`}
                onClick={() => goTo(idx)}
              />
            ))}
          </div>

          {/* ─── Bottom CTA ───────────────────────────── */}
          <div style={{ textAlign: "center", marginTop: "2.2rem" }}>
            <Link
              href="/products"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.8rem",
                fontFamily: "'Inter', sans-serif",
                fontSize: "0.62rem",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                fontWeight: 600,
                color: "#2A1018",
                textDecoration: "none",
                borderBottom: "1px solid rgba(42,16,24,0.22)",
                paddingBottom: 3,
                transition: "color 0.3s ease, border-color 0.3s ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.color = "#C97B84";
                (e.currentTarget as HTMLElement).style.borderColor = "#C97B84";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.color = "#2A1018";
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(42,16,24,0.22)";
              }}
            >
              Explore All Gifts
              <span style={{
                display: "inline-block",
                width: 24, height: 1,
                background: "currentColor",
                transition: "width 0.3s ease",
              }} />
            </Link>
          </div>

        </div>
      </section>
    </>
  );
}