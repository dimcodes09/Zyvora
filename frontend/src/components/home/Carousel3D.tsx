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

/* ─── Design tokens (mirrors your site's palette) ────────── */
const TOKEN = {
  ivoryBase:   "#FAF6F2",
  blushMid:    "#F3E8E8",
  roseDust:    "#EDD8DC",
  beigeWarm:   "#F0E9E0",
  accent:      "#C97B84",
  accentDeep:  "#9B3040",
  accentDark:  "#7B1728",
  textPrimary: "#1C0A12",
  textMuted:   "#8A6A72",
  gold:        "#C4A882",
  goldLight:   "#E8DDD0",
};

/* ─── Styles ─────────────────────────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,700;0,800;1,400;1,700&family=Inter:wght@300;400;500;600&display=swap');

  /* ── Keyframes ── */
  @keyframes mlg-float-a {
    0%,100% { transform: translate(0, 0) scale(1); }
    33%      { transform: translate(18px, -22px) scale(1.04); }
    66%      { transform: translate(-14px, 12px) scale(0.97); }
  }
  @keyframes mlg-float-b {
    0%,100% { transform: translate(0, 0) scale(1); }
    40%      { transform: translate(-20px, 16px) scale(1.06); }
    75%      { transform: translate(16px, -10px) scale(0.95); }
  }
  @keyframes mlg-float-c {
    0%,100% { transform: translate(0, 0) rotate(0deg); }
    50%      { transform: translate(-10px, -18px) rotate(8deg); }
  }
  @keyframes mlg-shimmer {
    0%   { opacity: 0.4; transform: scale(0.96) translateY(4px); }
    50%  { opacity: 0.72; transform: scale(1.02) translateY(-4px); }
    100% { opacity: 0.4; transform: scale(0.96) translateY(4px); }
  }
  @keyframes mlg-grain-shift {
    0%,100% { transform: translate(0,0); }
    20%     { transform: translate(-2px, 1px); }
    40%     { transform: translate(1px, -2px); }
    60%     { transform: translate(-1px, 2px); }
    80%     { transform: translate(2px, -1px); }
  }
  @keyframes mlg-spin-slow {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes mlg-spin-rev {
    from { transform: rotate(0deg); }
    to   { transform: rotate(-360deg); }
  }
  @keyframes mlg-twinkle {
    0%,100% { opacity: 0.15; transform: scale(0.8); }
    50%     { opacity: 0.9;  transform: scale(1.2); }
  }
  @keyframes mlg-card-glow-pulse {
    0%,100% { opacity: 0.55; transform: translate(-50%,-50%) scale(1); }
    50%     { opacity: 0.82; transform: translate(-50%,-50%) scale(1.08); }
  }
  @keyframes mlg-section-in {
    from { opacity: 0; transform: translateY(40px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes mlg-head-in {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes mlg-carousel-in {
    from { opacity: 0; transform: translateY(32px) scale(0.98); }
    to   { opacity: 1; transform: translateY(0)  scale(1); }
  }

  /* ── Root section ── */
  .mlg-section {
    position: relative;
    overflow: hidden;
    padding: 5rem 2rem 4.5rem;
    min-height: auto;
    /* Multi-stop luxury gradient: ivory → blush → rose dust → warm beige */
    background:
      linear-gradient(
        168deg,
        #FAF6F2 0%,
        #F5ECEC 22%,
        #EDD8DC 46%,
        #F0E9E0 72%,
        #F7F2ED 100%
      );
    isolation: isolate;
  }

  /* ── Animated fade-in when section enters viewport ── */
  .mlg-section[data-visible="true"] .mlg-head {
    animation: mlg-head-in 0.9s cubic-bezier(0.16,1,0.3,1) both;
  }
  .mlg-section[data-visible="true"] .mlg-carousel-wrap {
    animation: mlg-carousel-in 0.95s cubic-bezier(0.16,1,0.3,1) 0.14s both;
  }
  .mlg-section[data-visible="false"] .mlg-head,
  .mlg-section[data-visible="false"] .mlg-carousel-wrap {
    opacity: 0;
  }

  /* ── Three.js canvas ── */
  .mlg-three-canvas {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 1;
    opacity: 0.45;
    mix-blend-mode: multiply;
  }

  /* ── Fine grain overlay for premium texture ── */
  .mlg-grain {
    position: absolute;
    inset: -30%;
    width: 160%;
    height: 160%;
    pointer-events: none;
    z-index: 3;
    opacity: 0.028;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    background-repeat: repeat;
    background-size: 200px 200px;
    animation: mlg-grain-shift 0.8s steps(2) infinite;
  }

  /* ── Ambient CSS blobs (always visible behind canvas) ── */
  .mlg-blob {
    position: absolute;
    border-radius: 50%;
    pointer-events: none;
  }
  /* Central warm glow — largest, slowest */
  .mlg-blob-center {
    top: 50%; left: 50%;
    width: min(700px, 90vw);
    height: min(700px, 90vw);
    transform: translate(-50%, -52%);
    background: radial-gradient(circle at 50% 50%,
      rgba(218,172,180,0.28) 0%,
      rgba(201,123,132,0.12) 35%,
      rgba(240,200,190,0.06) 60%,
      transparent 75%
    );
    filter: blur(48px);
    animation: mlg-shimmer 7s ease-in-out infinite;
  }
  /* Top-left ivory-gold accent */
  .mlg-blob-tl {
    top: -12%; left: -8%;
    width: min(420px, 55vw);
    height: min(420px, 55vw);
    background: radial-gradient(circle,
      rgba(196,168,130,0.13) 0%,
      rgba(250,246,242,0.04) 55%,
      transparent 70%
    );
    filter: blur(52px);
    animation: mlg-float-a 14s ease-in-out infinite;
  }
  /* Bottom-right lavender blush */
  .mlg-blob-br {
    bottom: -10%; right: -6%;
    width: min(380px, 50vw);
    height: min(380px, 50vw);
    background: radial-gradient(circle,
      rgba(185,152,205,0.1) 0%,
      rgba(201,123,132,0.05) 45%,
      transparent 68%
    );
    filter: blur(46px);
    animation: mlg-float-b 11s ease-in-out infinite;
  }
  /* Top-right dusty rose streak */
  .mlg-blob-tr {
    top: -6%; right: 8%;
    width: min(280px, 38vw);
    height: min(280px, 38vw);
    background: radial-gradient(circle,
      rgba(224,170,160,0.12) 0%,
      transparent 65%
    );
    filter: blur(40px);
    animation: mlg-float-c 18s ease-in-out infinite;
  }
  /* Bottom-left warm beige whisper */
  .mlg-blob-bl {
    bottom: 0; left: 4%;
    width: min(260px, 36vw);
    height: min(260px, 36vw);
    background: radial-gradient(circle,
      rgba(196,168,130,0.09) 0%,
      transparent 65%
    );
    filter: blur(38px);
    animation: mlg-float-a 20s ease-in-out infinite reverse;
  }

  /* ── Decorative SVG geometry layer ── */
  .mlg-geometry {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 2;
    overflow: hidden;
  }

  /* ── Radial "spotlight" directly behind active card ── */
  .mlg-card-spotlight {
    position: absolute;
    left: 50%;
    top: 50%;
    width: min(480px, 70vw);
    height: min(480px, 70vw);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    pointer-events: none;
    z-index: 4;
    background: radial-gradient(circle at 50% 46%,
      rgba(218,160,168,0.32) 0%,
      rgba(201,123,132,0.14) 38%,
      rgba(240,220,210,0.06) 60%,
      transparent 75%
    );
    filter: blur(32px);
    animation: mlg-card-glow-pulse 5s ease-in-out infinite;
  }

  /* ── Floating sparkle dots ── */
  .mlg-sparkle {
    position: absolute;
    border-radius: 50%;
    pointer-events: none;
    z-index: 3;
    animation: mlg-twinkle var(--dur, 3s) ease-in-out infinite var(--delay, 0s);
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
    transition:
      transform 0.72s cubic-bezier(0.33, 1, 0.68, 1),
      opacity   0.72s cubic-bezier(0.33, 1, 0.68, 1),
      filter    0.72s ease;
  }
  .mlg-card-inner {
    width: 100%;
    height: 100%;
    border-radius: 20px;
    overflow: hidden;
    position: relative;
    /* Richer shadow stack: soft ambient + directional lift */
    box-shadow:
      0 2px 4px rgba(123,23,40,0.04),
      0 8px 24px rgba(123,23,40,0.10),
      0 20px 48px rgba(26,8,14,0.14),
      0 0 0 1px rgba(201,123,132,0.08);
    transition: box-shadow 0.45s ease, transform 0.45s ease;
  }
  .mlg-card-inner:hover {
    box-shadow:
      0 4px 8px rgba(123,23,40,0.06),
      0 16px 36px rgba(123,23,40,0.16),
      0 32px 64px rgba(26,8,14,0.22),
      0 0 0 1px rgba(201,123,132,0.18);
    transform: translateY(-3px);
  }
  .mlg-card-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    transition: transform 0.65s cubic-bezier(0.25,1,0.5,1);
  }
  .mlg-card-inner:hover .mlg-card-img {
    transform: scale(1.06);
  }
  /* Active card ring — elegant rose-gold border */
  .mlg-card-wrap[data-active="true"] .mlg-card-inner {
    box-shadow:
      0 4px 8px rgba(123,23,40,0.06),
      0 12px 32px rgba(123,23,40,0.14),
      0 28px 56px rgba(26,8,14,0.18),
      0 0 0 1.5px rgba(196,168,130,0.55),
      0 0 28px rgba(201,123,132,0.18);
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
    transition: transform 0.42s cubic-bezier(0.25,1,0.5,1);
  }
  .mlg-card-inner:hover .mlg-card-content {
    transform: translateY(-6px);
  }

  /* ── Nav dots ── */
  .mlg-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: rgba(201,123,132,0.22);
    border: 1px solid rgba(201,123,132,0.12);
    padding: 0;
    cursor: pointer;
    transition: width 0.3s ease, background 0.3s ease,
                border-radius 0.3s ease, border-color 0.3s ease;
    flex-shrink: 0;
  }
  .mlg-dot.active {
    width: 28px;
    background: linear-gradient(90deg, #C97B84, #9B3040);
    border-color: transparent;
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(155,48,64,0.28);
  }

  /* ── Arrow buttons ── */
  .mlg-arrow {
    width: 46px;
    height: 46px;
    border-radius: 50%;
    border: 1px solid rgba(196,168,130,0.35);
    background: rgba(250,246,242,0.88);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #7B1728;
    font-size: 1rem;
    transition:
      background 0.28s ease, border-color 0.28s ease,
      transform 0.22s ease, box-shadow 0.28s ease, color 0.28s ease;
    box-shadow:
      0 2px 8px rgba(201,123,132,0.10),
      0 0 0 1px rgba(255,255,255,0.6) inset;
  }
  .mlg-arrow:hover {
    background: linear-gradient(135deg, #9B3040, #7B1728);
    border-color: transparent;
    color: #fff;
    transform: scale(1.08);
    box-shadow:
      0 8px 24px rgba(123,23,40,0.28),
      0 2px 6px rgba(123,23,40,0.16);
  }

  /* ── Divider line ── */
  .mlg-divider {
    width: 1px;
    height: 48px;
    background: linear-gradient(to bottom, transparent, rgba(201,123,132,0.3), transparent);
    margin: 0 auto;
    margin-top: 2rem;
  }

  /* ── Responsiveness ── */
  @media (max-width: 768px) {
    .mlg-section { padding: 3.5rem 1rem 3rem; }
    .mlg-carousel-viewport { perspective: none !important; }
    .mlg-three-canvas { opacity: 0.3; }
    .mlg-card-spotlight { width: min(340px, 85vw); height: min(340px, 85vw); }
    .mlg-geometry { display: none; }
  }
  @media (max-width: 480px) {
    .mlg-section { padding: 2.5rem 0.5rem 2.5rem; }
  }

  /* ── Reduced-motion safety ── */
  @media (prefers-reduced-motion: reduce) {
    .mlg-blob, .mlg-sparkle, .mlg-card-spotlight { animation: none !important; }
    .mlg-head, .mlg-carousel-wrap { animation: none !important; opacity: 1 !important; }
  }
`;

/* ─── Static sparkle positions (SSR-safe) ───────────────── */
const SPARKLES = [
  { top: "12%",  left: "8%",  size: 5, dur: "4.2s", delay: "0s",    col: "rgba(201,123,132,0.7)" },
  { top: "20%",  left: "88%", size: 4, dur: "3.6s", delay: "0.8s",  col: "rgba(196,168,130,0.8)" },
  { top: "72%",  left: "6%",  size: 3, dur: "5.1s", delay: "1.4s",  col: "rgba(201,123,132,0.6)" },
  { top: "80%",  left: "91%", size: 5, dur: "3.9s", delay: "0.4s",  col: "rgba(196,168,130,0.7)" },
  { top: "38%",  left: "4%",  size: 4, dur: "6.0s", delay: "2.1s",  col: "rgba(224,180,185,0.65)" },
  { top: "55%",  left: "93%", size: 3, dur: "4.7s", delay: "1.0s",  col: "rgba(196,168,130,0.6)" },
  { top: "6%",   left: "52%", size: 3, dur: "5.5s", delay: "0.6s",  col: "rgba(201,123,132,0.5)" },
  { top: "90%",  left: "42%", size: 4, dur: "4.0s", delay: "1.8s",  col: "rgba(196,168,130,0.55)" },
  { top: "25%",  left: "72%", size: 2, dur: "3.2s", delay: "2.5s",  col: "rgba(201,123,132,0.45)" },
  { top: "62%",  left: "18%", size: 2, dur: "5.8s", delay: "0.2s",  col: "rgba(196,168,130,0.5)" },
];

/* ─── Helpers ──────────────────────────────────────────── */
const CARD_W_DESKTOP = "clamp(220px, 24vw, 310px)";
const CARD_H_DESKTOP = "clamp(300px, 38vw, 420px)";
const CARD_W_MOBILE  = "clamp(200px, 65vw, 280px)";
const CARD_H_MOBILE  = "clamp(260px, 80vw, 380px)";

function getCardTransform(offset: number, isMobile: boolean) {
  if (isMobile) {
    return {
      x: offset * 100 + "%",
      z: 0, rotY: 0,
      scale:   offset === 0 ? 1 : 0.88,
      opacity: Math.abs(offset) <= 1 ? (offset === 0 ? 1 : 0.5) : 0,
      blur:    offset === 0 ? 0 : 2,
    };
  }
  const absOff = Math.abs(offset);
  const x = offset === 0 ? "-50%" : `calc(-50% + ${offset * 220}px)`;
  const z      = -absOff * 120;
  const rotY   = offset * -24;
  const scale  = absOff === 0 ? 1 : absOff === 1 ? 0.82 : 0.65;
  const opacity= absOff === 0 ? 1 : absOff === 1 ? 0.7 : absOff === 2 ? 0.38 : 0;
  const blur   = absOff === 0 ? 0 : absOff === 1 ? 2   : 4.5;
  return { x, z, rotY, scale, opacity, blur };
}

/* ─── Component ─────────────────────────────────────────── */
export default function Categories() {
  const sectionRef   = useRef<HTMLElement>(null);
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const autoRef      = useRef<ReturnType<typeof setInterval> | null>(null);
  const hoverPaused  = useRef(false);
  const mouseRef     = useRef({ x: 0, y: 0 });
  const isVisibleRef = useRef(false);

  const [active,   setActive]   = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const [visible,  setVisible]  = useState(false);
  const total = GIFTS.length;

  /* ── mobile detect ───────────────────────────────────── */
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  /* ── IntersectionObserver — fade-in + Three.js gate ──── */
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

  /* ── Mouse tracking ──────────────────────────────────── */
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouseRef.current = {
        x:  (e.clientX / window.innerWidth)  * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1,
      };
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  /* ── Three.js — upgraded luxury scene ───────────────── */
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
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        renderer.setClearColor(0x000000, 0);

        const scene  = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 80);
        camera.position.z = 5;

        const resize = () => {
          const w = canvas.clientWidth, h = canvas.clientHeight;
          if (!w || !h) return;
          renderer.setSize(w, h, false);
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
        };
        resize();
        window.addEventListener("resize", resize);

        /* ── Central pearlescent orb ── */
        const orbGeo = new THREE.IcosahedronGeometry(1.3, 5);
        const orbMat = new THREE.MeshStandardMaterial({
          color:       0xDAAEB6,
          roughness:   0.38,
          metalness:   0.12,
          transparent: true,
          opacity:     0.26,
        });
        const orb = new THREE.Mesh(orbGeo, orbMat);
        scene.add(orb);

        /* ── Inner glow sphere (slightly smaller, warmer) ── */
        const innerGeo = new THREE.SphereGeometry(0.9, 32, 32);
        const innerMat = new THREE.MeshStandardMaterial({
          color:       0xF0CABB,
          roughness:   0.6,
          metalness:   0.0,
          transparent: true,
          opacity:     0.15,
        });
        const innerOrb = new THREE.Mesh(innerGeo, innerMat);
        scene.add(innerOrb);

        /* ── Orbital rings — rose gold + ivory ── */
        const makeRing = (
          radius: number, tube: number, col: number,
          op: number, rotX: number, rotZ = 0,
        ) => {
          const m = new THREE.Mesh(
            new THREE.TorusGeometry(radius, tube, 6, 80),
            new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: op }),
          );
          m.rotation.x = rotX;
          m.rotation.z = rotZ;
          scene.add(m);
          return m;
        };
        const ring1 = makeRing(2.0,  0.014, 0xE8B4BA, 0.22, Math.PI / 3.5);
        const ring2 = makeRing(2.65, 0.009, 0xC4A882, 0.14, -Math.PI / 4, Math.PI / 6);
        const ring3 = makeRing(1.55, 0.007, 0xF0DDD0, 0.10, Math.PI / 2.2, -Math.PI / 8);

        /* ── Gold dust particles (two groups — fine + coarse) ── */
        const makeDust = (count: number, rMin: number, rMax: number,
                          col: number, sz: number, op: number) => {
          const geo  = new THREE.BufferGeometry();
          const pos  = new Float32Array(count * 3);
          for (let i = 0; i < count; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi   = Math.acos(2 * Math.random() - 1);
            const r     = rMin + Math.random() * (rMax - rMin);
            pos[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
            pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            pos[i * 3 + 2] = r * Math.cos(phi);
          }
          geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
          const mat = new THREE.PointsMaterial({
            color: col, size: sz, sizeAttenuation: true,
            transparent: true, opacity: op,
          });
          const pts = new THREE.Points(geo, mat);
          scene.add(pts);
          return { pts, geo, mat };
        };
        const fine   = makeDust(80, 2.0, 6.0, 0xC97B84, 0.04, 0.55);  // rose
        const coarse = makeDust(40, 2.5, 5.5, 0xC4A882, 0.07, 0.38);  // gold

        /* ── Lights ── */
        scene.add(new THREE.AmbientLight(0xFFF5F0, 1.4));
        const pl1 = new THREE.PointLight(0xFFB8C6, 3.0, 12);
        pl1.position.set(2.5, 3, 3.5);
        scene.add(pl1);
        const pl2 = new THREE.PointLight(0xC4A882, 1.5, 10);
        pl2.position.set(-3, -2, 2);
        scene.add(pl2);
        const pl3 = new THREE.PointLight(0xF0E0D0, 0.8, 8);
        pl3.position.set(0, -3, 4);
        scene.add(pl3);

        /* ── Animate ── */
        let t = 0, lastTime = performance.now();
        const tick = () => {
          raf = requestAnimationFrame(tick);
          if (!isVisibleRef.current) return;
          const now = performance.now();
          t += (now - lastTime) * 0.001;
          lastTime = now;
          const mx = mouseRef.current.x, my = mouseRef.current.y;

          orb.rotation.x  = Math.sin(t * 0.28) * 0.28;
          orb.rotation.y  = t * 0.18 + mx * 0.36;
          orb.position.y  = Math.sin(t * 0.42) * 0.12 + my * 0.18;
          orb.position.x  = mx * 0.12;
          orb.scale.setScalar(1 + Math.sin(t * 0.55) * 0.035);

          innerOrb.rotation.x = orb.rotation.x * 0.6;
          innerOrb.rotation.y = orb.rotation.y * 0.6;

          ring1.rotation.y = t * 0.13;
          ring2.rotation.y = -t * 0.09;
          ring2.rotation.z = Math.PI / 6 + t * 0.028;
          ring3.rotation.y = t * 0.07;
          ring3.rotation.x = Math.PI / 2.2 + t * 0.015;

          fine.pts.rotation.y   = t * 0.016 + mx * 0.05;
          fine.pts.rotation.x   = t * 0.007 + my * 0.035;
          fine.mat.opacity      = 0.42 + Math.sin(t * 1.1) * 0.14;

          coarse.pts.rotation.y = -t * 0.012 + mx * 0.03;
          coarse.pts.rotation.x = t * 0.005  + my * 0.02;
          coarse.mat.opacity    = 0.28 + Math.sin(t * 0.85 + 1) * 0.1;

          renderer.render(scene, camera);
        };
        tick();

        cleanup = () => {
          cancelAnimationFrame(raf);
          window.removeEventListener("resize", resize);
          [orbGeo, innerGeo, fine.geo, coarse.geo,
           ring1.geometry, ring2.geometry, ring3.geometry].forEach(g => g.dispose());
          [orbMat, innerMat, fine.mat, coarse.mat,
           ring1.material as unknown as { dispose(): void },
           ring2.material as unknown as { dispose(): void },
           ring3.material as unknown as { dispose(): void }].forEach(m => m.dispose());
          scene.clear();
          renderer.dispose();
        };
      } catch (e) {
        console.warn("Three.js init failed — CSS fallback active", e);
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
      if (!hoverPaused.current) setActive(a => (a + 1) % total);
    }, 4000);
  }, [total]);
  useEffect(() => {
    startAuto();
    return () => { if (autoRef.current) clearInterval(autoRef.current); };
  }, [startAuto]);

  /* ── Swipe ───────────────────────────────────────────── */
  useEffect(() => {
    const el = sectionRef.current; if (!el) return;
    let sx = 0;
    const onStart = (e: TouchEvent) => { sx = e.touches[0].clientX; };
    const onEnd   = (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 40) dx < 0 ? next() : prev();
    };
    el.addEventListener("touchstart", onStart, { passive: true });
    el.addEventListener("touchend",   onEnd,   { passive: true });
    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchend",   onEnd);
    };
  }, [next, prev]);

  /* ── Keyboard ────────────────────────────────────────── */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft")  prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prev, next]);

  /* ── Card CSS style ──────────────────────────────────── */
  const getStyle = (idx: number): React.CSSProperties => {
    const offset   = ((idx - active + total) % total + total) % total;
    const centered = offset > total / 2 ? offset - total : offset;
    const { x, z, rotY, scale, opacity, blur } = getCardTransform(centered, isMobile);
    const cardW = isMobile ? CARD_W_MOBILE : CARD_W_DESKTOP;
    return {
      width:         isMobile ? CARD_W_MOBILE  : CARD_W_DESKTOP,
      height:        isMobile ? CARD_H_MOBILE  : CARD_H_DESKTOP,
      transform:     `translateX(${x}) translateZ(${z}px) rotateY(${rotY}deg) scale(${scale})`,
      opacity,
      filter:        blur > 0 ? `blur(${blur}px)` : "none",
      zIndex:        10 - Math.abs(centered),
      marginLeft:    `calc(-${cardW} / 2)`,
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
        {/* ── Three.js canvas ── */}
        <canvas ref={canvasRef} className="mlg-three-canvas" aria-hidden="true" />

        {/* ── Fine grain texture overlay ── */}
        <div className="mlg-grain" aria-hidden="true" />

        {/* ── Animated CSS ambient blobs ── */}
        <div aria-hidden="true" style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none" }}>
          <div className="mlg-blob mlg-blob-center" />
          <div className="mlg-blob mlg-blob-tl"     />
          <div className="mlg-blob mlg-blob-br"     />
          <div className="mlg-blob mlg-blob-tr"     />
          <div className="mlg-blob mlg-blob-bl"     />
        </div>

        {/* ── Card spotlight radial glow ── */}
        <div className="mlg-card-spotlight" aria-hidden="true" />

        {/* ── Decorative SVG geometry ── */}
        <svg className="mlg-geometry" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
          {/* Top-left corner bracket */}
          <line x1="48" y1="20" x2="20" y2="20" stroke="rgba(196,168,130,0.25)" strokeWidth="1" />
          <line x1="20" y1="20" x2="20" y2="52" stroke="rgba(196,168,130,0.25)" strokeWidth="1" />

          {/* Top-right corner bracket */}
          <line x1="calc(100% - 48px)" y1="20" x2="calc(100% - 20px)" y2="20"
            stroke="rgba(196,168,130,0.25)" strokeWidth="1" />
          <line x1="calc(100% - 20px)" y1="20" x2="calc(100% - 20px)" y2="52"
            stroke="rgba(196,168,130,0.25)" strokeWidth="1" />

          {/* Bottom-left corner bracket */}
          <line x1="48" y1="calc(100% - 20px)" x2="20" y2="calc(100% - 20px)"
            stroke="rgba(196,168,130,0.22)" strokeWidth="1" />
          <line x1="20" y1="calc(100% - 52px)" x2="20" y2="calc(100% - 20px)"
            stroke="rgba(196,168,130,0.22)" strokeWidth="1" />

          {/* Bottom-right corner bracket */}
          <line x1="calc(100% - 48px)" y1="calc(100% - 20px)"
            x2="calc(100% - 20px)" y2="calc(100% - 20px)"
            stroke="rgba(196,168,130,0.22)" strokeWidth="1" />
          <line x1="calc(100% - 20px)" y1="calc(100% - 52px)"
            x2="calc(100% - 20px)" y2="calc(100% - 20px)"
            stroke="rgba(196,168,130,0.22)" strokeWidth="1" />

          {/* Rotating large circle — top left */}
          <circle cx="0" cy="0" r="180"
            fill="none" stroke="rgba(201,123,132,0.055)" strokeWidth="1"
            style={{ transformOrigin: "0 0", animation: "mlg-spin-slow 90s linear infinite" }}
          />

          {/* Rotating large circle — bottom right */}
          <circle cx="100%" cy="100%" r="200"
            fill="none" stroke="rgba(196,168,130,0.05)" strokeWidth="1"
            style={{ transformOrigin: "100% 100%", animation: "mlg-spin-rev 110s linear infinite" }}
          />

          {/* Subtle diamond at center-left */}
          <line x1="36" y1="50%" x2="54" y2="calc(50% - 18px)" stroke="rgba(201,123,132,0.15)" strokeWidth="1" />
          <line x1="54" y1="calc(50% - 18px)" x2="72" y2="50%" stroke="rgba(201,123,132,0.15)" strokeWidth="1" />
          <line x1="72" y1="50%" x2="54" y2="calc(50% + 18px)" stroke="rgba(201,123,132,0.15)" strokeWidth="1" />
          <line x1="54" y1="calc(50% + 18px)" x2="36" y2="50%" stroke="rgba(201,123,132,0.15)" strokeWidth="1" />
          
          {/* Subtle diamond at center-right */}
          <line x1="calc(100% - 36px)" y1="50%" x2="calc(100% - 18px)" y2="calc(50% - 18px)" stroke="rgba(196,168,130,0.15)" strokeWidth="1" />
          <line x1="calc(100% - 18px)" y1="calc(50% - 18px)" x2="100%" y2="50%" stroke="rgba(196,168,130,0.15)" strokeWidth="1" />
          <line x1="100%" y1="50%" x2="calc(100% - 18px)" y2="calc(50% + 18px)" stroke="rgba(196,168,130,0.15)" strokeWidth="1" />
          <line x1="calc(100% - 18px)" y1="calc(50% + 18px)" x2="calc(100% - 36px)" y2="50%" stroke="rgba(196,168,130,0.15)" strokeWidth="1" />
        </svg>

        {/* ── Floating sparkle dots ── */}
        {SPARKLES.map((s, i) => (
          <div
            key={i}
            className="mlg-sparkle"
            aria-hidden="true"
            style={{
              top:    s.top,
              left:   s.left,
              width:  s.size,
              height: s.size,
              background: s.col,
              "--dur":   s.dur,
              "--delay": s.delay,
              boxShadow: `0 0 ${s.size * 2}px ${s.col}`,
            } as React.CSSProperties}
          />
        ))}

        {/* ── CONTENT ── */}
        <div style={{ position: "relative", zIndex: 10, maxWidth: 1280, margin: "0 auto" }}>

          {/* ─── HEADING ─────────────────────────────────── */}
          <div className="mlg-head" style={{ textAlign: "center", marginBottom: "3rem" }}>

            {/* Eyebrow rule */}
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "0.75rem",
              fontSize: "0.58rem", letterSpacing: "0.26em", textTransform: "uppercase",
              color: TOKEN.accent, marginBottom: "1.1rem",
              fontFamily: "'Inter', sans-serif", fontWeight: 500,
            }}>
              <span style={{
                display: "block", width: 40, height: 1,
                background: `linear-gradient(90deg, transparent, ${TOKEN.accent})`,
              }} />
              Curated with Love
              <span style={{
                display: "block", width: 40, height: 1,
                background: `linear-gradient(90deg, ${TOKEN.accent}, transparent)`,
              }} />
            </div>

            <h2 style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontWeight: 500,
              lineHeight: 1.1,
              margin: 0,
              color: TOKEN.textPrimary,
              fontSize: "clamp(2.2rem, 5vw, 3.6rem)",
              letterSpacing: "-0.02em",
            }}>
              Most{" "}
              <span style={{
                fontStyle: "italic", fontWeight: 700,
                background: `linear-gradient(135deg, ${TOKEN.accent} 0%, ${TOKEN.accentDeep} 60%)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>
                Loved
              </span>{" "}
              <em style={{ color: TOKEN.accent, fontStyle: "italic", fontWeight: 400 }}>
                Gifts
              </em>
            </h2>

            <p style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "0.82rem",
              color: TOKEN.textMuted,
              lineHeight: 1.75,
              maxWidth: 360,
              margin: "1rem auto 0",
              fontWeight: 300,
              letterSpacing: "0.02em",
            }}>
              Handpicked treasures — adored by thousands, crafted for the extraordinary.
            </p>

            {/* Gold hairline divider below heading */}
            <div style={{
              width: 48, height: 1,
              background: `linear-gradient(90deg, transparent, ${TOKEN.gold}, transparent)`,
              margin: "1.4rem auto 0",
            }} />
          </div>

          {/* ─── 3D CAROUSEL ─────────────────────────────── */}
          <div className="mlg-carousel-wrap" style={{ position: "relative" }}>
            <div
              className="mlg-carousel-viewport"
              style={{
                position: "relative",
                height: isMobile
                  ? "clamp(280px, 82vw, 400px)"
                  : "clamp(320px, 42vw, 440px)",
                overflow: "visible",
              }}
              onMouseEnter={() => { hoverPaused.current = true; }}
              onMouseLeave={() => { hoverPaused.current = false; }}
            >
              <div className="mlg-track" style={{ position: "relative", width: "100%", height: "100%" }}>
                {GIFTS.map((gift, idx) => {
                  const offset   = ((idx - active + total) % total + total) % total;
                  const centered = offset > total / 2 ? offset - total : offset;
                  const isActive = centered === 0;

                  return (
                    <div
                      key={gift.id}
                      className="mlg-card-wrap"
                      data-active={isActive ? "true" : "false"}
                      style={getStyle(idx)}
                      onClick={() => !isActive && goTo(idx)}
                      aria-label={`${gift.name} — ${gift.price}`}
                    >
                      <div className="mlg-card-inner">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          className="mlg-card-img"
                          src={gift.img}
                          alt={gift.name}
                          loading={isActive ? "eager" : "lazy"}
                          style={{ position: "absolute", inset: 0 }}
                        />

                        {/* Richer gradient overlay — warm at top, deep at bottom */}
                        <div
                          aria-hidden="true"
                          style={{
                            position: "absolute", inset: 0, zIndex: 2,
                            background: [
                              "linear-gradient(to bottom,",
                              "  rgba(28,10,18,0.01) 0%,",
                              "  rgba(28,10,18,0.04) 35%,",
                              "  rgba(28,10,18,0.52) 70%,",
                              "  rgba(28,10,18,0.78) 100%",
                              ")",
                            ].join(" "),
                          }}
                        />

                        {/* Tag pill */}
                        <div style={{ position: "absolute", top: 16, left: 16, zIndex: 10 }}>
                          <span style={{
                            display: "inline-block",
                            padding: "4px 12px",
                            borderRadius: 50,
                            fontSize: "0.52rem",
                            letterSpacing: "0.2em",
                            textTransform: "uppercase",
                            fontFamily: "'Inter', sans-serif",
                            fontWeight: 600,
                            color: "#fff",
                            background: TAG_COLORS[gift.tag] ?? TOKEN.accentDark,
                            boxShadow: "0 3px 14px rgba(0,0,0,0.22)",
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
                            padding: "1.6rem 1.3rem 1.3rem",
                            background: "linear-gradient(to top, rgba(10,0,6,0.72) 0%, transparent 100%)",
                          }}
                        >
                          {/* Thin gold hairline above name */}
                          {isActive && (
                            <div style={{
                              width: 28, height: 1, marginBottom: "0.5rem",
                              background: `linear-gradient(90deg, ${TOKEN.gold}, transparent)`,
                              opacity: 0.7,
                            }} />
                          )}

                          <h3 style={{
                            fontFamily: "'Playfair Display', Georgia, serif",
                            fontWeight: 500,
                            fontSize: isActive ? "1.12rem" : "0.9rem",
                            color: "#fff",
                            margin: "0 0 0.28rem",
                            lineHeight: 1.22,
                            letterSpacing: "-0.01em",
                          }}>
                            {gift.name}
                          </h3>

                          <p style={{
                            fontFamily: "'Inter', sans-serif",
                            fontSize: "0.74rem",
                            color: "rgba(255,255,255,0.6)",
                            margin: 0,
                            letterSpacing: "0.05em",
                          }}>
                            {gift.price}
                          </p>

                          <Link
                            href={gift.href}
                            className="mlg-cta-btn"
                            onClick={e => e.stopPropagation()}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0.5rem",
                              marginTop: "0.75rem",
                              fontSize: "0.54rem",
                              letterSpacing: "0.22em",
                              textTransform: "uppercase",
                              fontFamily: "'Inter', sans-serif",
                              fontWeight: 600,
                              color: "rgba(255,255,255,0.82)",
                              textDecoration: "none",
                              borderBottom: "1px solid rgba(196,168,130,0.45)",
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

            {/* ─── Arrows ───────────────────────────────── */}
            <button
              className="mlg-arrow"
              onClick={prev}
              aria-label="Previous gift"
              style={{
                position: "absolute",
                left: "clamp(8px, 3%, 40px)",
                top: "50%", transform: "translateY(-50%)",
                zIndex: 20,
              }}
            >←</button>

            <button
              className="mlg-arrow"
              onClick={next}
              aria-label="Next gift"
              style={{
                position: "absolute",
                right: "clamp(8px, 3%, 40px)",
                top: "50%", transform: "translateY(-50%)",
                zIndex: 20,
              }}
            >→</button>
          </div>

          {/* ─── Dot Navigation ───────────────────────── */}
          <div
            role="tablist"
            aria-label="Gift navigation"
            style={{
              display: "flex", alignItems: "center",
              justifyContent: "center", gap: "0.5rem",
              marginTop: "2.2rem",
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

          {/* ─── Hairline divider ─────────────────────── */}
          <div className="mlg-divider" />

          {/* ─── Bottom CTA ───────────────────────────── */}
          <div style={{ textAlign: "center", marginTop: "1.6rem" }}>
            <Link
              href="/products"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.85rem",
                fontFamily: "'Inter', sans-serif",
                fontSize: "0.6rem",
                letterSpacing: "0.24em",
                textTransform: "uppercase",
                fontWeight: 600,
                color: TOKEN.textPrimary,
                textDecoration: "none",
                borderBottom: `1px solid rgba(42,16,24,0.20)`,
                paddingBottom: 3,
                transition: "color 0.32s ease, border-color 0.32s ease",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.color = TOKEN.accent;
                (e.currentTarget as HTMLElement).style.borderColor = TOKEN.accent;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.color = TOKEN.textPrimary;
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(42,16,24,0.20)";
              }}
            >
              Explore All Gifts
              <span style={{
                display: "inline-block", width: 26, height: 1,
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