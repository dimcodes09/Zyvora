"use client";

import { useState, useRef, KeyboardEvent } from "react";
import api from "@/lib/axios";
import { resolveProductImage } from "@/lib/productImage";
import Link from "next/link";

// ── Types ──────────────────────────────────────────────────────────────────────

interface Product {
  _id: string;
  name: string;
  price: number;
  image?: string;
  category?: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
}

const FALLBACK =
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80";

const getImg = (image?: string) => image ? resolveProductImage(image) : FALLBACK;

// ── Fetch helpers (search → random fallback) ──────────────────────────────────

async function fetchSearchResults(q: string): Promise<Product[]> {
  try {
    // 1️⃣ Try the dedicated search endpoint (regex on name, limit 3)
    const res = await api.get(`/products/search?q=${encodeURIComponent(q)}`);
    const data: Product[] = res.data?.data ?? [];
    if (data.length > 0) return data.slice(0, 3);
  } catch {
    // search endpoint failed — fall through to random
  }

  // 2️⃣ Fallback: return 3 random/recent products from the main list
  try {
    const res = await api.get(`/products?limit=3&page=1`);
    const data: Product[] = res.data?.data ?? [];
    return data.slice(0, 3);
  } catch {
    return [];
  }
}

// ── Shimmer ────────────────────────────────────────────────────────────────────

function ShimmerCard() {
  return (
    <div className="sr-card" style={{ pointerEvents: "none" }}>
      <div className="sr-shimmer-img" />
      <div className="sr-card-body">
        <div className="sr-shimmer-line" style={{ width: "80%", marginTop: 18 }} />
        <div className="sr-shimmer-line" style={{ width: "50%" }} />
        <div className="sr-shimmer-line" style={{ width: "35%", height: 16 }} />
      </div>
    </div>
  );
}

// ── Product Card ───────────────────────────────────────────────────────────────

function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/products/${product._id}`} className="sr-card-link">
      <article className="sr-card">
        <div className="sr-card-img-wrap">
          <img
            src={getImg(product.image)}
            alt={product.name}
            className="sr-card-img"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = FALLBACK;
            }}
          />
          {product.category && (
            <span className="sr-card-badge">{product.category}</span>
          )}
        </div>
        <div className="sr-card-body">
          <p className="sr-card-name">{product.name}</p>
          <p className="sr-card-price">{formatPrice(product.price)}</p>
          <span className="sr-card-cta">View Product →</span>
        </div>
      </article>
    </Link>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [isFallback, setIsFallback] = useState(false);
  const [searched, setSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = async () => {
    const q = query.trim();
    if (!q) return;
    setLoading(true);
    setResults(null);
    setSearched(true);
    setIsFallback(false);

    const searchRes = await (async () => {
      // ── Stage 1: dedicated search (name OR category regex, limit 3) ──
      try {
        const res = await api.get(`/products/search?q=${encodeURIComponent(q)}`);
        const data: Product[] = res.data?.data ?? [];
        if (data.length > 0) return { data: data.slice(0, 3), fallback: false };
      } catch { /* search endpoint error — try next */ }

      // ── Stage 2: exact category filter (category stored lowercase) ──
      try {
        const res = await api.get(
          `/products?category=${encodeURIComponent(q.toLowerCase())}&limit=3&page=1`
        );
        const data: Product[] = res.data?.data ?? [];
        if (data.length > 0) return { data: data.slice(0, 3), fallback: true };
      } catch { /* category filter failed */ }

      // ── Stage 3: nothing matched ──
      return { data: [], fallback: false };
    })();

    setResults(searchRes.data);
    setIsFallback(searchRes.fallback);
    setLoading(false);
  };

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };


  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400;1,600&family=DM+Sans:wght@300;400;500&display=swap');

        .sr-root {
          font-family: 'DM Sans', sans-serif;
          min-height: 100vh;
          background: #fdf8f7;
          color: #3a2020;
          padding: 100px 40px 100px;
          max-width: 1100px;
          margin: 0 auto;
        }

        .sr-eyebrow {
          display: flex; align-items: center; gap: 10px;
          font-size: 11px; letter-spacing: 0.22em;
          text-transform: uppercase; color: #9b5c5c;
          margin-bottom: 18px; font-weight: 500;
        }
        .sr-eyebrow::before {
          content: ''; display: block;
          width: 32px; height: 1px; background: #9b5c5c;
        }
        .sr-heading {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(2rem, 4vw, 3rem);
          font-weight: 400; line-height: 1.15;
          margin: 0 0 8px; color: #2b1414;
        }
        .sr-heading em { font-style: italic; color: #8b2e2e; }
        .sr-sub {
          font-size: 14px; color: #9b8080; font-weight: 300; margin: 0 0 40px;
        }

        /* ── Search bar ── */
        .sr-bar-wrap {
          display: flex; align-items: center;
          background: #fff8f7; border: 1px solid #e5cece;
          border-radius: 60px; padding: 8px 8px 8px 28px;
          max-width: 680px;
          box-shadow: 0 4px 24px rgba(139,46,46,0.06);
          transition: border-color 0.25s, box-shadow 0.25s;
        }
        .sr-bar-wrap:focus-within {
          border-color: #c47070;
          box-shadow: 0 4px 32px rgba(139,46,46,0.13);
        }
        .sr-input {
          flex: 1; border: none; background: transparent;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px; font-weight: 300; color: #3a2020; outline: none;
        }
        .sr-input::placeholder { color: #c4a5a5; }
        .sr-btn {
          display: flex; align-items: center; gap: 8px;
          background: #8b2e2e; color: #fff8f5; border: none;
          border-radius: 48px; padding: 13px 28px;
          font-family: 'DM Sans', sans-serif;
          font-size: 12px; font-weight: 500;
          letter-spacing: 0.14em; text-transform: uppercase;
          cursor: pointer; white-space: nowrap;
          transition: background 0.2s, transform 0.15s;
        }
        .sr-btn:hover:not(:disabled) { background: #6e2020; transform: scale(1.02); }
        .sr-btn:disabled { opacity: 0.65; cursor: not-allowed; }

        /* ── Results header ── */
        .sr-results-header {
          display: flex; align-items: baseline; gap: 12px;
          margin: 52px 0 28px; animation: srFadeUp 0.4s ease both;
        }
        .sr-results-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.5rem; font-weight: 400; color: #2b1414; margin: 0;
        }
        .sr-results-count { font-size: 12px; color: #b08080; letter-spacing: 0.08em; }

        .sr-fallback-note {
          font-size: 11px; color: #c4a5a5; font-style: italic;
          margin-top: 4px; display: block;
        }

        /* ── Grid — always 3 cols ── */
        .sr-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          animation: srFadeUp 0.5s ease both;
        }

        /* ── Cards ── */
        .sr-card-link { text-decoration: none; color: inherit; display: block; }
        .sr-card {
          background: #fffaf9; border: 1px solid #eedcdc;
          border-radius: 16px; overflow: hidden;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .sr-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 14px 40px rgba(139,46,46,0.11);
        }
        .sr-card-img-wrap {
          position: relative;
          background: linear-gradient(135deg, #f9eded, #f0e0e0);
          height: 200px; overflow: hidden;
        }
        .sr-card-img {
          width: 100%; height: 100%; object-fit: cover; display: block;
          transition: transform 0.35s ease;
        }
        .sr-card:hover .sr-card-img { transform: scale(1.06); }
        .sr-card-badge {
          position: absolute; top: 12px; right: 12px;
          background: rgba(255,250,249,0.92); border: 1px solid #e5cece;
          color: #8b2e2e; font-size: 9px; letter-spacing: 0.14em;
          text-transform: uppercase; padding: 4px 10px;
          border-radius: 20px; font-weight: 500;
        }
        .sr-card-body { padding: 18px 20px 22px; }
        .sr-card-name {
          font-size: 14px; font-weight: 400; color: #3a2020;
          margin: 0 0 8px; line-height: 1.45;
        }
        .sr-card-price {
          font-family: 'Cormorant Garamond', serif;
          font-size: 18px; color: #8b2e2e; margin: 0 0 12px; font-weight: 600;
        }
        .sr-card-cta {
          font-size: 11px; letter-spacing: 0.12em;
          text-transform: uppercase; color: #9b5c5c; font-weight: 500;
          transition: color 0.2s;
        }
        .sr-card:hover .sr-card-cta { color: #8b2e2e; }

        /* ── Shimmer ── */
        .sr-shimmer-img {
          width: 100%; height: 200px;
          background: linear-gradient(90deg, #f0e0e0 25%, #f9eded 50%, #f0e0e0 75%);
          background-size: 200% 100%; animation: srShimmer 1.4s infinite;
        }
        .sr-shimmer-line {
          height: 12px; border-radius: 6px; margin-bottom: 10px;
          background: linear-gradient(90deg, #f0e0e0 25%, #f9eded 50%, #f0e0e0 75%);
          background-size: 200% 100%; animation: srShimmer 1.4s infinite;
        }
        @keyframes srShimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        /* ── State boxes ── */
        .sr-state-box {
          text-align: center; padding: 64px 24px;
          animation: srFadeUp 0.4s ease both;
        }
        .sr-state-icon  { font-size: 40px; margin-bottom: 16px; display: block; }
        .sr-state-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.4rem; color: #2b1414; margin: 0 0 8px; font-weight: 400;
        }
        .sr-state-msg {
          font-size: 13px; color: #b08080; font-weight: 300;
          max-width: 380px; margin: 0 auto; line-height: 1.7;
        }

        /* ── Spinner ── */
        .sr-spinner {
          width: 15px; height: 15px;
          border: 2px solid rgba(255,248,245,0.35);
          border-top-color: #fff8f5; border-radius: 50%;
          animation: srSpin 0.7s linear infinite;
        }

        @keyframes srFadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes srSpin { to { transform: rotate(360deg); } }

        @media (max-width: 768px) {
          .sr-root { padding: 90px 20px 72px; }
          .sr-grid  { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 480px) {
          .sr-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <main className="sr-root">
        {/* Header */}
        <p className="sr-eyebrow">Product Search</p>
        <h1 className="sr-heading">
          Find your <em>perfect</em> gift
        </h1>
        <p className="sr-sub">
          Type a product name and press Enter — we&apos;ll show you 3 matches instantly.
        </p>

        {/* Search Bar */}
        <div className="sr-bar-wrap">
          <input
            ref={inputRef}
            type="text"
            className="sr-input"
            placeholder='e.g. "rose perfume" or "silk scarf"'
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKey}
            disabled={loading}
            autoFocus
            aria-label="Product search"
            id="product-search-input"
          />
          <button
            className="sr-btn"
            onClick={handleSearch}
            disabled={loading || !query.trim()}
            id="product-search-btn"
            aria-label="Search products"
          >
            {loading ? (
              <>
                <div className="sr-spinner" />
                Searching
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.4" />
                  <path d="M9.5 9.5l2.5 2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
                Search
              </>
            )}
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <>
            <div className="sr-results-header">
              <h2 className="sr-results-title">Finding matches…</h2>
            </div>
            <div className="sr-grid">
              <ShimmerCard />
              <ShimmerCard />
              <ShimmerCard />
            </div>
          </>
        )}

        {/* Results — always exactly 3 */}
        {!loading && results !== null && results.length > 0 && (
          <>
            <div className="sr-results-header" style={{ flexDirection: "column", alignItems: "flex-start", gap: 4 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
                <h2 className="sr-results-title">
                  {isFallback ? "You might also like" : "Top matches for you"}
                </h2>
                <span className="sr-results-count">
                  {results.length} product{results.length !== 1 ? "s" : ""}
                </span>
              </div>
              {isFallback && (
                <span className="sr-fallback-note">
                  No exact match found for &ldquo;{query}&rdquo; — showing popular picks instead
                </span>
              )}
            </div>
            <div className="sr-grid">
              {results.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </>
        )}

        {/* No results at all */}
        {!loading && results !== null && results.length === 0 && (
          <div className="sr-state-box">
            <span className="sr-state-icon">🔍</span>
            <p className="sr-state-title">Nothing found</p>
            <p className="sr-state-msg">
              Try a broader term — like &ldquo;perfume&rdquo;, &ldquo;candle&rdquo;, or &ldquo;watch&rdquo;.
            </p>
          </div>
        )}

        {/* Idle state */}
        {!searched && !loading && (
          <div className="sr-state-box" style={{ paddingTop: 48 }}>
            <span className="sr-state-icon">✦</span>
            <p className="sr-state-title">What are you looking for?</p>
            <p className="sr-state-msg">
              Type a keyword above and hit Search or Enter —
              we&apos;ll show the 3 best matching products.
            </p>
          </div>
        )}
      </main>
    </>
  );
}
