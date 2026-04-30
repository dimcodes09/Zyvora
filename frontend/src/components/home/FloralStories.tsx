"use client";
import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
// ✅ THREE is imported dynamically inside useEffect to avoid SSR crashes on Vercel

const florals = [
  {
    tag: "Romantic",
    name: "Crimson Romance Bouquet",
    price: "From ₹1,299",
    tall: false,
    img: "/floral/rose.jpeg",
    href: "/products",
  },
  {
    tag: "Fresh",
    name: "Garden Whisper Hamper",
    price: "From ₹899",
    tall: false,
    img: "/floral/garden.jpeg",
    href: "/products",
  },
  {
    tag: "Dreamy",
    name: "Lavender Dusk Set",
    price: "From ₹1,099",
    tall: false,
    img: "/floral/lavender.jpeg",
    href: "/products",
  },
  {
    tag: "Sunshine",
    name: "Golden Hour Gift Box",
    price: "From ₹799",
    tall: false,
    img: "/floral/sun.jpeg",
    href: "/products",
  },
];

/* ─── Three.js ambient orb ─────────────────────────────── */
function useThreeOrb(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // ✅ Guard: skip if canvas has no dimensions yet
    if (canvas.clientWidth === 0 || canvas.clientHeight === 0) return;

    let raf: number;
    let cleanup: (() => void) | undefined;

    (async () => {
      try {
        const THREE = await import("three"); // ✅ dynamic import — browser only

        const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: "low-power" });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(50, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
        camera.position.z = 4;

        /* Soft blob geometry */
        const geo = new THREE.IcosahedronGeometry(1.2, 4);
        const mat = new THREE.MeshStandardMaterial({
          color: 0xD4909C,
          roughness: 0.55,
          metalness: 0.1,
          transparent: true,
          opacity: 0.55,
          wireframe: false,
        });
        const mesh = new THREE.Mesh(geo, mat);
        scene.add(mesh);

        /* Petal-like floating rings */
        const ring1 = new THREE.Mesh(
          new THREE.TorusGeometry(1.9, 0.018, 8, 80),
          new THREE.MeshBasicMaterial({ color: 0xE8B4BA, transparent: true, opacity: 0.22 })
        );
        ring1.rotation.x = Math.PI / 3;
        scene.add(ring1);

        const ring2 = new THREE.Mesh(
          new THREE.TorusGeometry(2.35, 0.012, 8, 80),
          new THREE.MeshBasicMaterial({ color: 0xC4A882, transparent: true, opacity: 0.14 })
        );
        ring2.rotation.x = -Math.PI / 4;
        ring2.rotation.z = Math.PI / 6;
        scene.add(ring2);

        /* Lights */
        scene.add(new THREE.AmbientLight(0xfff0f0, 1.2));
        const point = new THREE.PointLight(0xffc0cc, 2.5, 10);
        point.position.set(2, 3, 3);
        scene.add(point);
        const point2 = new THREE.PointLight(0xC4A882, 1.5, 10);
        point2.position.set(-3, -2, 2);
        scene.add(point2);

        /* Animate */
        let frame = 0;

        const tick = () => {
          frame += 0.005;
          mesh.rotation.x = Math.sin(frame * 0.7) * 0.4;
          mesh.rotation.y = frame * 0.5;
          mesh.position.y = Math.sin(frame * 0.9) * 0.12;
          ring1.rotation.y = frame * 0.3;
          ring2.rotation.y = -frame * 0.2;
          ring2.rotation.x = Math.sin(frame * 0.4) * 0.3 - Math.PI / 4;
          renderer.render(scene, camera);
          raf = requestAnimationFrame(tick);
        };
        tick();

        /* Resize */
        const onResize = () => {
          const w = canvas.clientWidth;
          const h = canvas.clientHeight;
          if (!w || !h) return;
          renderer.setSize(w, h, false);
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
        };
        window.addEventListener("resize", onResize);

        cleanup = () => {
          cancelAnimationFrame(raf);
          window.removeEventListener("resize", onResize);
          renderer.dispose();
          geo.dispose();
          mat.dispose();
        };
      } catch (e) {
        console.warn("Three.js init failed (FloralStories)", e);
      }
    })();

    return () => cleanup?.();
  }, [canvasRef]);
}

/* ─── Card component ────────────────────────────────────── */
function FloralCard({ item, index }: { item: typeof florals[0]; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLSpanElement>(null);

  /* Hover */
  const onEnter = () => {
    gsap.to(imgRef.current, { scale: 1.06, duration: 0.75, ease: "power2.out" });
    gsap.to(cardRef.current, { boxShadow: "0 32px 64px rgba(26,16,10,0.22)", duration: 0.5 });
    gsap.to(contentRef.current, { y: -10, duration: 0.5, ease: "power2.out" });
    gsap.to(ctaRef.current, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" });
  };
  const onLeave = () => {
    gsap.to(imgRef.current, { scale: 1, duration: 0.75, ease: "power2.out" });
    gsap.to(cardRef.current, { boxShadow: "0 12px 32px rgba(26,16,10,0.10)", duration: 0.5 });
    gsap.to(contentRef.current, { y: 0, duration: 0.5, ease: "power2.out" });
    gsap.to(ctaRef.current, { opacity: 0, y: 8, duration: 0.3 });
  };

  return (
    <Link href={item.href} style={{ textDecoration: "none", display: "block", gridRow: item.tall ? "span 2" : undefined }}>
      <div
        ref={cardRef}
        className={`floral-card relative overflow-hidden cursor-pointer`}
        style={{
          borderRadius: 20,
          height: item.tall ? "100%" : undefined,
          minHeight: item.tall ? 600 : 280,
          boxShadow: "0 12px 32px rgba(26,16,10,0.10)",
          transition: "box-shadow 0.5s ease",
        }}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
        data-index={index}
      >
        {/* Image */}
        <div ref={imgRef} className="absolute inset-0 will-change-transform">
          <Image
            src={item.img}
            alt={item.name}
            fill
            sizes="(max-width:768px) 100vw, (max-width:1200px) 50vw, 25vw"
            className="object-cover object-center"
          />
        </div>

        {/* Overlays */}
        <div className="absolute inset-0"
          style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.04) 0%, rgba(0,0,0,0.0) 35%, rgba(0,0,0,0.72) 100%)" }} />
        {/* Hover darkener */}
        <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors duration-500" />

        {/* Tag */}
        <div className="absolute top-4 left-4 z-10">
          <span style={{
            fontSize: "0.58rem",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "white",
            background: "rgba(255,255,255,0.15)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.25)",
            padding: "0.3rem 0.75rem",
            borderRadius: 50,
          }}>
            {item.tag}
          </span>
        </div>

        {/* Bottom content */}
        <div ref={contentRef} className="absolute bottom-0 left-0 right-0 z-10 p-5">
          <h3
            className="font-playfair text-white leading-tight mb-1"
            style={{ fontSize: item.tall ? "1.45rem" : "1.15rem", fontWeight: 500 }}
          >
            {item.name}
          </h3>
          <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.6)", letterSpacing: "0.04em" }}>
            {item.price}
          </p>
          {/* CTA */}
          <span
            ref={ctaRef}
            style={{
              display: "inline-block",
              marginTop: "0.75rem",
              fontSize: "0.6rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.7)",
              borderBottom: "1px solid rgba(255,255,255,0.3)",
              paddingBottom: 2,
              opacity: 0,
              transform: "translateY(8px)",
            }}
          >
            Explore →
          </span>
        </div>
      </div>
    </Link>
  );
}

/* ─── Main section ─────────────────────────────────────── */
export default function FloralStories() {
  const sectionRef = useRef<HTMLElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useThreeOrb(canvasRef);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger); // ✅ register client-side only
    const ctx = gsap.context(() => {
      /* Header reveal */
      gsap.from(headRef.current, {
        opacity: 0,
        y: 40,
        duration: 1.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: headRef.current,
          start: "top 85%",
          toggleActions: "play none none none",
        },
      });

      /* Cards stagger */
      const cards = gridRef.current?.querySelectorAll(".floral-card");
      if (cards) {
        gsap.from(cards, {
          opacity: 0,
          y: 55,
          scale: 0.97,
          duration: 1,
          ease: "power3.out",
          stagger: 0.12,
          scrollTrigger: {
            trigger: gridRef.current,
            start: "top 80%",
            toggleActions: "play none none none",
          },
        });
      }

      /* Canvas orb parallax */
      if (canvasRef.current) {
        gsap.to(canvasRef.current, {
          y: -80,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="floral"
      style={{ position: "relative", padding: "7rem 3rem 8rem", overflow: "hidden", background: "linear-gradient(160deg, #F9F5F0 0%, #F2EBE3 60%, #F7EEF0 100%)" }}
    >
      {/* Grain texture overlay */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`, opacity: 0.03, pointerEvents: "none", zIndex: 0 }} />

      {/* Three.js orb — positioned behind cards */}
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          top: "50%",
          right: "-6%",
          transform: "translateY(-50%)",
          width: 380,
          height: 380,
          opacity: 0.55,
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <div style={{ maxWidth: 1240, margin: "0 auto", position: "relative", zIndex: 1 }}>

        {/* Header */}
        <div ref={headRef} style={{ textAlign: "center", marginBottom: "4.5rem" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.6rem", fontSize: "0.62rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#C97B84", marginBottom: "1.2rem" }}>
            <span style={{ display: "block", width: 28, height: 1, background: "#C97B84" }} />
            Curated Stories
            <span style={{ display: "block", width: 28, height: 1, background: "#C97B84" }} />
          </div>

          <h2
            className="font-playfair"
            style={{ fontSize: "clamp(2.2rem, 4.5vw, 3.5rem)", fontWeight: 500, lineHeight: 1.15, color: "#2A1810" }}
          >
            Every Bloom<br />
            Tells a <em style={{ color: "#C97B84", fontStyle: "italic" }}>Story</em>
          </h2>

          <p style={{ marginTop: "1rem", fontSize: "0.82rem", color: "#8A6A58", letterSpacing: "0.04em", maxWidth: 360, margin: "1rem auto 0" }}>
            Handcrafted gift experiences, designed to move hearts.
          </p>
        </div>

        {/* Grid */}
        <div
          ref={gridRef}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gridTemplateRows: "auto auto",
            gap: "1.25rem",
          }}
          className="floral-grid"
        >
          {florals.map((item, i) => (
            <FloralCard key={item.tag} item={item} index={i} />
          ))}
        </div>

        {/* Bottom CTA */}
        <div style={{ textAlign: "center", marginTop: "3.5rem" }}>
          <Link
            href="/products"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.75rem",
              fontSize: "0.65rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#2A1810",
              textDecoration: "none",
              borderBottom: "1px solid rgba(42,24,16,0.2)",
              paddingBottom: 3,
              transition: "border-color 0.3s, color 0.3s",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#C97B84"; (e.currentTarget as HTMLElement).style.borderColor = "#C97B84"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "#2A1810"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(42,24,16,0.2)"; }}
          >
            View All Collections →
          </Link>
        </div>
      </div>

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 1024px) {
          .floral-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 640px) {
          .floral-grid { grid-template-columns: 1fr !important; }
        }
        .floral-grid > a:first-child { grid-row: span 2; }
        @media (max-width: 640px) {
          .floral-grid > a:first-child { grid-row: span 1; }
        }
      `}</style>
    </section>
  );
}