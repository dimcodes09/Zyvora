"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import type { ReelProduct } from "./ReelsFeed";

export default function ReelCard({ product }: { product: ReelProduct }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const cardRef  = useRef<HTMLDivElement>(null);
  const router   = useRouter();

  /* ── Autoplay via IntersectionObserver ───────── */
  useEffect(() => {
    const video = videoRef.current;
    const card  = cardRef.current;
    if (!video || !card) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) video.play().catch(() => {});
        else                      video.pause();
      },
      { threshold: 0.6 }
    );

    observer.observe(card);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={cardRef} className="reel-card">
      {/* Video — src is now product.reelVideo from DB */}
      <video
        ref={videoRef}
        src={product.reelVideo}
        autoPlay
        muted
        loop
        playsInline
        className="reel-video"
      />

      <div className="reel-gradient" />

      <div className="reel-badge">SS 2026</div>

      <div className="reel-overlay">
        <div className="reel-meta">
          <p className="reel-label">NEW ARRIVAL</p>
          <h2 className="reel-name">{product.name}</h2>
          <p className="reel-price">₹{product.price.toLocaleString("en-IN")}</p>
        </div>

        <button
          className="reel-btn"
          onClick={() => router.push(`/products/${product._id}`)}
        >
          View Product →
        </button>
      </div>

      <style jsx>{`
        .reel-card {
          position: relative;
          width: 100%;
          height: 100dvh;
          flex-shrink: 0;
          overflow: hidden;
          background: #f0ddd7;
          scroll-snap-align: start;
        }
        .reel-video {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .reel-gradient {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to bottom,
            transparent 0%,
            transparent 40%,
            rgba(60, 10, 20, 0.55) 80%,
            rgba(60, 10, 20, 0.82) 100%
          );
          pointer-events: none;
        }
        .reel-badge {
          position: absolute;
          top: 1.25rem;
          right: 1.25rem;
          background: #7b1c30;
          color: #f9ece8;
          font-family: "Cormorant Garamond", "Georgia", serif;
          font-size: 0.65rem;
          letter-spacing: 0.22em;
          padding: 0.35rem 0.75rem;
          border-radius: 2px;
          text-transform: uppercase;
        }
        .reel-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 2.5rem 1.75rem 3.5rem;
          display: flex;
          flex-direction: row;
          align-items: flex-end;
          justify-content: space-between;
          gap: 1.25rem;
        }
        .reel-meta { display: flex; flex-direction: column; gap: 0.3rem; }
        .reel-label {
          color: #e8b4b8;
          font-family: "Cormorant Garamond", "Georgia", serif;
          font-size: 0.62rem;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          margin: 0;
        }
        .reel-name {
          color: #fdf5f0;
          font-family: "Cormorant Garamond", "Georgia", serif;
          font-size: clamp(1.4rem, 5vw, 2rem);
          font-weight: 600;
          font-style: italic;
          line-height: 1.15;
          margin: 0;
          text-shadow: 0 2px 12px rgba(0,0,0,0.25);
        }
        .reel-price {
          color: #f2cfc7;
          font-family: "Cormorant Garamond", "Georgia", serif;
          font-size: 1.05rem;
          font-weight: 500;
          margin: 0.2rem 0 0;
        }
        .reel-btn {
          flex-shrink: 0;
          background: #7b1c30;
          color: #fdf5f0;
          border: none;
          padding: 0.75rem 1.35rem;
          font-family: "Cormorant Garamond", "Georgia", serif;
          font-size: 0.78rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          border-radius: 3px;
          cursor: pointer;
          white-space: nowrap;
          transition: background 0.25s ease, transform 0.18s ease;
        }
        .reel-btn:hover  { background: #5e1423; transform: translateY(-2px); }
        .reel-btn:active { transform: translateY(0); }

        @media (max-width: 480px) {
          .reel-overlay {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
            padding: 2rem 1.25rem 3rem;
          }
          .reel-btn { width: 100%; text-align: center; padding: 0.85rem 1rem; }
        }
      `}</style>
    </div>
  );
}