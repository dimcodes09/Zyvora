"use client";

import { useEffect, useState } from "react";
import ReelCard from "./ReelCard";

export interface ReelProduct {
  _id: string;
  name: string;
  price: number;
  image: string;
  reelVideo: string;
}

export default function ReelsFeed() {
  const [reels, setReels]       = useState<ReelProduct[]>([]);
  const [loading, setLoading]   = useState(true);
  const [empty, setEmpty]       = useState(false);

  useEffect(() => {
    fetch("/api/reels")
      .then((r) => r.json())
      .then((data) => {
        const list: ReelProduct[] = data?.products ?? [];
        setReels(list);
        setEmpty(list.length === 0);
      })
      .catch((err) => {
        console.error("[ReelsFeed] fetch failed:", err);
        setEmpty(true);
      })
      .finally(() => setLoading(false));
  }, []);

  /* ── Loading skeleton ──────────────────────────── */
  if (loading) {
    return (
      <div style={centerStyle}>
        <div style={dotWrapStyle}>
          <span style={dotStyle(0)} />
          <span style={dotStyle(1)} />
          <span style={dotStyle(2)} />
        </div>
        <style>{`
          @keyframes reel-dot {
            0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
            40%            { opacity: 1;   transform: scale(1); }
          }
        `}</style>
      </div>
    );
  }

  /* ── Empty state ───────────────────────────────── */
  if (empty) {
    return (
      <div style={centerStyle}>
        <p style={{
          color: "rgba(253,245,240,0.6)",
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: "0.9rem",
          letterSpacing: "0.15em",
          textTransform: "uppercase",
        }}>
          No reels yet
        </p>
        <p style={{
          color: "rgba(253,245,240,0.35)",
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: "0.72rem",
          marginTop: "0.5rem",
          letterSpacing: "0.08em",
        }}>
          Add a Reel Video URL to a product in the admin panel
        </p>
      </div>
    );
  }

  return (
    <div className="reels-feed">
      {reels.map((product) => (
        <ReelCard key={product._id} product={product} />
      ))}

      <style jsx>{`
        .reels-feed {
          height: 100dvh;
          overflow-y: scroll;
          scroll-snap-type: y mandatory;
          -webkit-overflow-scrolling: touch;
          overscroll-behavior-y: contain;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .reels-feed::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}

/* ── Inline styles for loading / empty ─────────────────────── */
const centerStyle: React.CSSProperties = {
  height: "100dvh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "1rem",
};

const dotWrapStyle: React.CSSProperties = {
  display: "flex",
  gap: "8px",
  alignItems: "center",
};

const dotStyle = (i: number): React.CSSProperties => ({
  width: 8,
  height: 8,
  borderRadius: "50%",
  background: "#7b1c30",
  display: "inline-block",
  animation: `reel-dot 1.4s ease-in-out ${i * 0.16}s infinite`,
});