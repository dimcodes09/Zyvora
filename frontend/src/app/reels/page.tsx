import ReelsFeed from "@/components/ReelsFeed";

// No more static reelsData — ReelsFeed fetches live from /api/reels

export default function ReelsPage() {
  return (
    <>
      <style>{`
        :root {
          --zyvora-burgundy: #7b1c30;
          --zyvora-blush:    #f0ddd7;
          --zyvora-cream:    #fdf5f0;
        }
        body { overflow: hidden; }
      `}</style>

      <main
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 50,
          background: "var(--zyvora-blush, #f0ddd7)",
        }}
      >
        {/* Back button */}
        <a
          href="/"
          style={{
            position: "absolute",
            top: "1.1rem",
            left: "1.25rem",
            zIndex: 100,
            color: "#fdf5f0",
            fontFamily: "'Cormorant Garamond', 'Georgia', serif",
            fontSize: "0.72rem",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            textDecoration: "none",
            background: "rgba(123,28,48,0.7)",
            backdropFilter: "blur(6px)",
            padding: "0.4rem 0.85rem",
            borderRadius: "3px",
          }}
        >
          ← Zyvora
        </a>

        {/* Page label */}
        <div
          style={{
            position: "absolute",
            top: "1.1rem",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 100,
            color: "#fdf5f0",
            fontFamily: "'Cormorant Garamond', 'Georgia', serif",
            fontSize: "0.68rem",
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            opacity: 0.8,
          }}
        >
          Reels
        </div>

        {/* Scroll hint */}
        <div
          style={{
            position: "absolute",
            bottom: "1.5rem",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 100,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.3rem",
            animation: "fadeOut 3s ease 2.5s forwards",
            pointerEvents: "none",
          }}
        >
          <svg width="20" height="28" viewBox="0 0 20 28" fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ animation: "bounce 1.4s ease infinite" }}>
            <rect x="1" y="1" width="18" height="26" rx="9"
              stroke="rgba(253,245,240,0.55)" strokeWidth="1.5" />
            <circle cx="10" cy="8" r="2.5" fill="rgba(253,245,240,0.75)"
              style={{ animation: "scrollDot 1.4s ease infinite" }} />
          </svg>
          <span style={{
            color: "rgba(253,245,240,0.6)",
            fontFamily: "'Cormorant Garamond', 'Georgia', serif",
            fontSize: "0.58rem",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
          }}>
            Scroll
          </span>
        </div>

        <style>{`
          @keyframes fadeOut {
            from { opacity: 1; } to { opacity: 0; }
          }
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50%       { transform: translateY(4px); }
          }
          @keyframes scrollDot {
            0%   { cy: 8;  opacity: 1; }
            100% { cy: 18; opacity: 0; }
          }
        `}</style>

        {/* ReelsFeed now self-fetches — no props needed */}
        <ReelsFeed />
      </main>
    </>
  );
}