"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

/* ─── Category data ─────────────────────────────────────── */
const CATEGORIES = [
  {
    name: "Florals",
    count: "48 items",
    href: "/products?category=florals",
    img: "https://res.cloudinary.com/djsd3uxbz/image/upload/v1777445819/707ee0decbc4aed29f872c1598aeaf42_aeiwaa.webp",
    accent: "#C97B84",
  },
  {
    name: "Handbags",
    count: "32 items",
    href: "/products?category=handbags",
    img: "https://res.cloudinary.com/djsd3uxbz/image/upload/v1777446088/d7c6d208848a17666ae16fd89a0ec344_sca6mm.webp",
    accent: "#9B3040",
  },
  {
    name: "Candles",
    count: "24 items",
    href: "/products?category=candles",
    img: "https://res.cloudinary.com/djsd3uxbz/image/upload/v1777446425/7f5ec650099ad41eb8b0922543fe09f8_gj24ci.jpg",
    accent: "#C4A882",
  },
  {
    name: "Gourmet",
    count: "19 items",
    href: "/products?category=gourmet",
    img: "https://res.cloudinary.com/djsd3uxbz/image/upload/v1777446553/5484c40c9b0de9299ad180becff22024_ueomsx.jpg",
    accent: "#8C5E3C",
  },
  {
    name: "Jewellery",
    count: "56 items",
    href: "/products?category=jewellery",
    img: "https://res.cloudinary.com/djsd3uxbz/image/upload/v1777446716/c64e3bb614de04c7d79ac9badefb87fb_ezbfn8.jpg",
    accent: "#7A5C8A",
  },
  {
    name: "Gifting",
    count: "34 items",
    href: "/products?category=gifting",
    img: "https://res.cloudinary.com/djsd3uxbz/image/upload/v1777446824/4af08969e4c52450ea72fe592ecd8312_tr09sg.jpg",
    accent: "#4A6741",
  },
];

/* ─── Styles ─────────────────────────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,700;1,400;1,700&family=Inter:wght@300;400;500;600&display=swap');

  /* ── Section ── */
  .cat-section {
    position: relative;
    overflow: hidden;
    padding: 6rem 2rem 7rem;
    background: linear-gradient(160deg, #F9F4F0 0%, #F5EDE8 40%, #F0E6EE 80%, #EEE8F5 100%);
  }

  /* ── Three.js canvas ── */
  .cat-canvas {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 1;
    opacity: 0.55;
  }

  /* ── Grain texture overlay ── */
  .cat-grain {
    position: absolute;
    inset: 0;
    z-index: 2;
    pointer-events: none;
    opacity: 0.028;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
    background-repeat: repeat;
    background-size: 200px 200px;
  }

  /* ── Ambient blobs ── */
  .cat-blob-wrap {
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    overflow: hidden;
  }

  /* ── Content z-layer ── */
  .cat-content {
    position: relative;
    z-index: 10;
    max-width: 1280px;
    margin: 0 auto;
  }

  /* ── Header ── */
  .cat-header {
    margin-bottom: 3.5rem;
  }
  .cat-label {
    display: inline-flex;
    align-items: center;
    gap: 0.6rem;
    font-family: 'Inter', sans-serif;
    font-size: 0.6rem;
    font-weight: 500;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: #C97B84;
    margin-bottom: 1rem;
  }
  .cat-heading {
    font-family: 'Playfair Display', Georgia, serif;
    font-weight: 500;
    font-size: clamp(2.2rem, 4.5vw, 3.4rem);
    color: #1C0A12;
    line-height: 1.1;
    letter-spacing: -0.02em;
    margin: 0;
  }
  .cat-heading em {
    font-style: italic;
    font-weight: 700;
    background: linear-gradient(135deg, #C97B84 0%, #9B3040 70%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  /* ── Grid ── */
  .cat-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 18px;
  }

  /* ── Card ── */
  .cat-card {
    position: relative;
    border-radius: 20px;
    overflow: hidden;
    aspect-ratio: 3/4;
    cursor: pointer;
    text-decoration: none;
    display: block;
    box-shadow:
      0 4px 16px rgba(26, 8, 14, 0.06),
      0 1px 4px rgba(26, 8, 14, 0.04);
    will-change: transform;
    background: #f0e8e8;
  }

  /* Image */
  .cat-card-img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    transition: transform 0.65s cubic-bezier(0.25, 1, 0.5, 1);
    will-change: transform;
  }

  /* Gradient overlay */
  .cat-card-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      to bottom,
      rgba(26, 8, 14, 0.01) 0%,
      rgba(26, 8, 14, 0.04) 40%,
      rgba(26, 8, 14, 0.65) 100%
    );
    z-index: 2;
    transition: background 0.4s ease;
  }

  /* Hover glow ring */
  .cat-card-glow {
    position: absolute;
    inset: 0;
    border-radius: 20px;
    z-index: 3;
    opacity: 0;
    transition: opacity 0.4s ease;
    box-shadow: inset 0 0 0 1.5px rgba(201, 123, 132, 0.55),
                0 0 28px rgba(201, 123, 132, 0.18);
    pointer-events: none;
  }

  /* Text block */
  .cat-card-text {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 10;
    padding: 1.1rem 1rem 1rem;
    transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1);
    will-change: transform;
  }
  .cat-card-name {
    font-family: 'Playfair Display', Georgia, serif;
    font-weight: 500;
    font-size: 1rem;
    color: #fff;
    margin: 0 0 0.2rem;
    letter-spacing: -0.01em;
    line-height: 1.2;
  }
  .cat-card-count {
    font-family: 'Inter', sans-serif;
    font-size: 0.62rem;
    color: rgba(255, 255, 255, 0.6);
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin: 0;
    font-weight: 400;
  }

  /* Arrow CTA */
  .cat-card-arrow {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    margin-top: 0.55rem;
    font-family: 'Inter', sans-serif;
    font-size: 0.54rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.75);
    border-bottom: 1px solid rgba(255, 255, 255, 0.3);
    padding-bottom: 2px;
    opacity: 0;
    transform: translateY(6px);
    transition: opacity 0.3s ease, transform 0.3s ease, color 0.3s ease, border-color 0.3s ease;
  }

  /* Hover states (CSS) */
  .cat-card:hover .cat-card-img {
    transform: scale(1.07);
  }
  .cat-card:hover .cat-card-overlay {
    background: linear-gradient(
      to bottom,
      rgba(26, 8, 14, 0.02) 0%,
      rgba(26, 8, 14, 0.08) 30%,
      rgba(26, 8, 14, 0.78) 100%
    );
  }
  .cat-card:hover .cat-card-glow {
    opacity: 1;
  }
  .cat-card:hover .cat-card-text {
    transform: translateY(-6px);
  }
  .cat-card:hover .cat-card-arrow {
    opacity: 1;
    transform: translateY(0);
    color: #fff;
    border-color: rgba(255, 255, 255, 0.55);
  }

  /* ── Responsive ── */
  @media (max-width: 1100px) {
    .cat-grid {
      grid-template-columns: repeat(3, 1fr);
      gap: 14px;
    }
  }
  @media (max-width: 680px) {
    .cat-section {
      padding: 4rem 1rem 5rem;
    }
    .cat-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }
    .cat-card {
      aspect-ratio: 2/3;
    }
  }
  @media (max-width: 400px) {
    .cat-grid {
      grid-template-columns: 1fr;
      max-width: 280px;
      margin: 0 auto;
    }
  }
`;

/* ─── Component ─────────────────────────────────────────── */
export default function Categories() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const isVisibleRef = useRef(false);
  const [visible, setVisible] = useState(false);

  /* ── IntersectionObserver → triggers GSAP + Three.js ── */
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting;
        if (entry.isIntersecting && !visible) setVisible(true);
      },
      { threshold: 0.08 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [visible]);

  /* ── GSAP: section entry + stagger ────────────────────── */
  useEffect(() => {
    if (!visible) return;

    (async () => {
      try {
        const { gsap } = await import("gsap");
        const { ScrollTrigger } = await import("gsap/ScrollTrigger");
        gsap.registerPlugin(ScrollTrigger);

        const header = headerRef.current;
        const cards = gridRef.current?.querySelectorAll(".cat-card");
        if (!header || !cards?.length) return;

        /* Header fade-up */
        gsap.fromTo(
          header,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: "power3.out",
          }
        );

        /* Staggered card entrance */
        gsap.fromTo(
          cards,
          { opacity: 0, y: 50, scale: 0.96 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.75,
            ease: "power3.out",
            stagger: 0.09,
            delay: 0.18,
          }
        );

        /* Subtle scroll parallax on header */
        gsap.to(header, {
          y: -28,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 1.5,
          },
        });
      } catch (e) {
        console.warn("GSAP init failed", e);
      }
    })();
  }, [visible]);

  /* ── GSAP: card hover micro-interactions ──────────────── */
  useEffect(() => {
    if (!visible) return;

    (async () => {
      try {
        const { gsap } = await import("gsap");
        const cards = gridRef.current?.querySelectorAll(".cat-card");
        if (!cards?.length) return;

        cards.forEach((card) => {
          const el = card as HTMLElement;

          el.addEventListener("mouseenter", () => {
            gsap.to(el, {
              scale: 1.04,
              boxShadow:
                "0 20px 50px rgba(26,8,14,0.14), 0 6px 20px rgba(201,123,132,0.18)",
              duration: 0.4,
              ease: "power2.out",
            });
          });

          el.addEventListener("mouseleave", () => {
            gsap.to(el, {
              scale: 1,
              boxShadow:
                "0 4px 16px rgba(26,8,14,0.06), 0 1px 4px rgba(26,8,14,0.04)",
              duration: 0.45,
              ease: "power2.out",
            });
          });
        });
      } catch (e) {
        console.warn("GSAP hover init failed", e);
      }
    })();
  }, [visible]);

  /* ── Three.js: floating particles ─────────────────────── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let raf = 0;
    let cleanup: (() => void) | undefined;

    (async () => {
      try {
        const THREE = await import("three");

        const renderer = new THREE.WebGLRenderer({
          canvas,
          alpha: true,
          antialias: false,
          powerPreference: "low-power",
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.4));
        renderer.setClearColor(0x000000, 0);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 60);
        camera.position.z = 6;

        /* ── Resize ── */
        const resize = () => {
          const parent = canvas.parentElement;
          if (!parent) return;
          const w = parent.offsetWidth;
          const h = parent.offsetHeight;
          renderer.setSize(w, h);
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
        };
        resize();
        window.addEventListener("resize", resize);

        /* ── Subtle glowing orb (far back, low opacity) ── */
        const orbGeo = new THREE.SphereGeometry(2.4, 16, 16);
        const orbMat = new THREE.MeshBasicMaterial({
          color: 0xDAACB4,
          transparent: true,
          opacity: 0.08,
        });
        const orb = new THREE.Mesh(orbGeo, orbMat);
        orb.position.set(1.5, 0, -2);
        scene.add(orb);

        /* ── Soft secondary orb ── */
        const orb2Geo = new THREE.SphereGeometry(1.6, 12, 12);
        const orb2Mat = new THREE.MeshBasicMaterial({
          color: 0xC4B0D4,
          transparent: true,
          opacity: 0.055,
        });
        const orb2 = new THREE.Mesh(orb2Geo, orb2Mat);
        orb2.position.set(-3, 1, -1.5);
        scene.add(orb2);

        /* ── Floating particles ── */
        const PCOUNT = 80;
        const pPositions = new Float32Array(PCOUNT * 3);
        const pSpeeds = new Float32Array(PCOUNT);

        for (let i = 0; i < PCOUNT; i++) {
          pPositions[i * 3]     = (Math.random() - 0.5) * 14;
          pPositions[i * 3 + 1] = (Math.random() - 0.5) * 8;
          pPositions[i * 3 + 2] = (Math.random() - 0.5) * 6;
          pSpeeds[i] = 0.12 + Math.random() * 0.2;
        }

        const pGeo = new THREE.BufferGeometry();
        const posAttr = new THREE.BufferAttribute(pPositions, 3);
        pGeo.setAttribute("position", posAttr);

        const pMat = new THREE.PointsMaterial({
          color: 0xC97B84,
          size: 0.04,
          sizeAttenuation: true,
          transparent: true,
          opacity: 0.45,
        });
        const particles = new THREE.Points(pGeo, pMat);
        scene.add(particles);

        /* ── Mouse tracking ── */
        const mouse = { x: 0, y: 0 };
        const onMove = (e: MouseEvent) => {
          mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
          mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        };
        window.addEventListener("mousemove", onMove, { passive: true });

        /* ── Animate loop (visibility-gated) ── */
        let t = 0;
        const tick = () => {
          raf = requestAnimationFrame(tick);
          if (!isVisibleRef.current) return;
          t += 0.004;

          /* Orbs breathe + drift */
          orb.position.y = Math.sin(t * 0.7) * 0.3 + mouse.y * 0.15;
          orb.position.x = 1.5 + Math.cos(t * 0.5) * 0.25 + mouse.x * 0.12;
          orb2.position.y = Math.sin(t * 0.55 + 1) * 0.25 + mouse.y * 0.1;
          orb2.position.x = -3 + Math.cos(t * 0.4) * 0.2;

          /* Particles drift slowly */
          particles.rotation.y = t * 0.025 + mouse.x * 0.04;
          particles.rotation.x = t * 0.012 + mouse.y * 0.025;

          /* Gentle twinkle */
          pMat.opacity = 0.35 + Math.sin(t * 1.8) * 0.12;

          renderer.render(scene, camera);
        };
        tick();

        cleanup = () => {
          cancelAnimationFrame(raf);
          window.removeEventListener("resize", resize);
          window.removeEventListener("mousemove", onMove);
          orbGeo.dispose();
          orbMat.dispose();
          orb2Geo.dispose();
          orb2Mat.dispose();
          pGeo.dispose();
          pMat.dispose();
          renderer.dispose();
        };
      } catch (e) {
        console.warn("Three.js init failed", e);
      }
    })();

    return () => cleanup?.();
  }, []);

  return (
    <>
      <style>{STYLES}</style>

      <section
        ref={sectionRef}
        id="shop-by-category"
        className="cat-section"
        aria-label="Shop by Category"
      >
        {/* ── Three.js canvas ── */}
        <canvas ref={canvasRef} className="cat-canvas" aria-hidden="true" />

        {/* ── Grain texture ── */}
        <div className="cat-grain" aria-hidden="true" />

        {/* ── Ambient CSS blobs ── */}
        <div className="cat-blob-wrap" aria-hidden="true">
          <div style={{
            position: "absolute",
            top: "30%", left: "50%",
            width: "min(700px, 80vw)", height: "min(700px, 80vw)",
            borderRadius: "50%",
            transform: "translate(-50%, -50%)",
            background: "radial-gradient(circle, rgba(218,172,180,0.14) 0%, rgba(201,123,132,0.05) 45%, transparent 70%)",
            filter: "blur(60px)",
          }} />
          <div style={{
            position: "absolute",
            top: "-15%", right: "-10%",
            width: 420, height: 420, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(180,148,210,0.08) 0%, transparent 65%)",
            filter: "blur(55px)",
          }} />
          <div style={{
            position: "absolute",
            bottom: "-10%", left: "-5%",
            width: 360, height: 360, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(196,168,130,0.07) 0%, transparent 65%)",
            filter: "blur(50px)",
          }} />
        </div>

        {/* ── CONTENT ── */}
        <div className="cat-content">

          {/* ─── HEADER ──────────────────────────────────── */}
          <div ref={headerRef} className="cat-header"
            style={{ opacity: 0 /* GSAP will animate in */ }}
          >
            {/* Label */}
            <div className="cat-label">
              <span style={{
                display: "block", width: 28, height: 1,
                background: "linear-gradient(90deg, transparent, #C97B84)",
              }} />
              Browse By
              <span style={{
                display: "block", width: 28, height: 1,
                background: "linear-gradient(90deg, #C97B84, transparent)",
              }} />
            </div>

            {/* Heading */}
            <h2 className="cat-heading">
              Shop by{" "}
              <em>Category</em>
            </h2>

            {/* Subtext */}
            <p style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "0.8rem",
              color: "#8A6A72",
              lineHeight: 1.75,
              marginTop: "0.75rem",
              fontWeight: 300,
              letterSpacing: "0.02em",
              maxWidth: 360,
            }}>
              Explore our curated world — each category, a story of luxury.
            </p>
          </div>

          {/* ─── CATEGORY GRID ────────────────────────── */}
          <div ref={gridRef} className="cat-grid">
            {CATEGORIES.map(({ name, count, href, img, accent }) => (
              <Link
                key={name}
                href={href}
                className="cat-card"
                aria-label={`${name} — ${count}`}
                style={{ opacity: 0 /* GSAP will animate in */ }}
              >
                {/* Image */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="cat-card-img"
                  src={img}
                  alt={name}
                  loading="lazy"
                />

                {/* Gradient overlay */}
                <div className="cat-card-overlay" aria-hidden="true" />

                {/* Hover glow ring */}
                <div
                  className="cat-card-glow"
                  aria-hidden="true"
                  style={{
                    boxShadow: `inset 0 0 0 1.5px ${accent}88, 0 0 28px ${accent}30`,
                  }}
                />

                {/* Top accent dot */}
                <div
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    top: 14,
                    right: 14,
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: accent,
                    boxShadow: `0 0 8px ${accent}80`,
                    zIndex: 10,
                    opacity: 0.85,
                  }}
                />

                {/* Text */}
                <div className="cat-card-text">
                  <p className="cat-card-name">{name}</p>
                  <p className="cat-card-count">{count}</p>
                  <span className="cat-card-arrow">
                    Explore →
                  </span>
                </div>
              </Link>
            ))}
          </div>

        </div>
      </section>
    </>
  );
}