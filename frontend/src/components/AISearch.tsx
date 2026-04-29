"use client";

import { useState, useCallback, useEffect, useRef, KeyboardEvent } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Product {
  _id: string;
  name: string;
  category: string;
  price: number;
  image?: string;
}

interface SearchFilters {
  category: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  keywords: string[];
}

interface SearchResponse {
  success: boolean;
  filters: SearchFilters;
  products: Product[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ShimmerCard() {
  return (
    <div className="zy-card shimmer-card">
      <div className="shimmer-img" />
      <div className="shimmer-line long" />
      <div className="shimmer-line short" />
      <div className="shimmer-line price" />
    </div>
  );
}

const BACKEND_URL = "http://localhost:5000";
const FALLBACK_IMG = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80";

function getImageSrc(image?: string): string {
  if (!image) return FALLBACK_IMG;
  // Already an absolute URL (http/https)
  if (image.startsWith("http")) return image;
  // Relative path — prepend backend origin
  return `${BACKEND_URL}${image.startsWith("/") ? "" : "/"}${image}`;
}

function ProductCard({ product }: { product: Product }) {
  return (
    <article className="zy-card product-card">
      <div className="card-img-wrap">
        <img
          src={getImageSrc(product.image)}
          alt={product.name}
          className="card-img"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = FALLBACK_IMG;
          }}
        />
        <span className="card-badge">{product.category}</span>
      </div>
      <div className="card-body">
        <p className="card-name">{product.name}</p>
        <p className="card-price">{formatPrice(product.price)}</p>
      </div>
    </article>
  );
}

function FilterPills({ filters }: { filters: SearchFilters }) {
  const pills: string[] = [];
  if (filters.category) pills.push(filters.category);
  if (filters.minPrice !== null) pills.push(`From ${formatPrice(filters.minPrice)}`);
  if (filters.maxPrice !== null) pills.push(`Up to ${formatPrice(filters.maxPrice)}`);
  filters.keywords.forEach((k) => pills.push(k));

  if (pills.length === 0) return null;

  return (
    <div className="filter-pills">
      <span className="pills-label">AI detected</span>
      {pills.map((pill) => (
        <span key={pill} className="pill">{pill}</span>
      ))}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function AISearch() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<SearchFilters | null>(null);
  const [products, setProducts] = useState<Product[] | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // ── Suggestions state ──────────────────────────────────────────────────────
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Fetch suggestions with 300ms debounce whenever query changes
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const q = query.trim();
    if (!q) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/ai/suggestions?q=${encodeURIComponent(q)}`
        );
        if (!res.ok) throw new Error();
        const data: string[] = await res.json();
        setSuggestions(data);
        setShowSuggestions(data.length > 0);
      } catch {
        // Fallback hardcoded suggestions so the UI is always testable
        const fallback = [
          "luxury watches",
          "gift for her",
          "birthday gifts",
          "premium handbags",
          "perfumes for men",
          "watches under 5000",
        ].filter((s) => s.includes(q.toLowerCase()));
        setSuggestions(fallback);
        setShowSuggestions(fallback.length > 0);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const pickSuggestion = (s: string) => {
    setQuery(s);
    setSuggestions([]);
    setShowSuggestions(false);
  };
  // ──────────────────────────────────────────────────────────────────────────

  const handleSearch = useCallback(async () => {
    const trimmed = query.trim();
    if (!trimmed || loading) return;

    // Close suggestions when searching
    setShowSuggestions(false);
    setSuggestions([]);

    setLoading(true);
    setError(null);
    setFilters(null);
    setProducts(null);
    setHasSearched(true);

    try {
      const res = await fetch("http://localhost:5000/api/ai/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: trimmed }),
      });

      if (!res.ok) {
        throw new Error(`Server responded with ${res.status}`);
      }

      const data: SearchResponse = await res.json();

      if (!data.success) {
        throw new Error("Search was unsuccessful. Please try again.");
      }

      setFilters(data.filters);
      setProducts(data.products);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, [query, loading]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") { setShowSuggestions(false); handleSearch(); }
    if (e.key === "Escape") setShowSuggestions(false);
  };

  return (
    <>
      {/* ── Scoped styles ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Jost:wght@300;400;500&display=swap');

        .zy-search-root {
          font-family: 'Jost', sans-serif;
          padding: 72px 40px 80px;
          max-width: 1200px;
          margin: 0 auto;
          color: #3a2020;
        }

        /* ── Hero label ── */
        .zy-eyebrow {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 11px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #9b5c5c;
          margin-bottom: 18px;
          font-weight: 500;
        }
        .zy-eyebrow::before {
          content: '';
          display: block;
          width: 32px;
          height: 1px;
          background: #9b5c5c;
        }

        /* ── Heading ── */
        .zy-heading {
          font-family: 'Playfair Display', serif;
          font-size: clamp(2rem, 4vw, 3rem);
          font-weight: 400;
          line-height: 1.15;
          margin: 0 0 10px;
          color: #2b1414;
        }
        .zy-heading em {
          font-style: italic;
          color: #8b2e2e;
        }

        .zy-sub {
          font-size: 14px;
          color: #9b8080;
          font-weight: 300;
          margin: 0 0 40px;
          letter-spacing: 0.02em;
        }

        /* ── Search bar ── */
        .zy-search-wrap {
          display: flex;
          align-items: center;
          background: #fff8f7;
          border: 1px solid #e5cece;
          border-radius: 60px;
          padding: 8px 8px 8px 28px;
          max-width: 680px;
          box-shadow: 0 4px 24px rgba(139, 46, 46, 0.06);
          transition: border-color 0.25s, box-shadow 0.25s;
        }
        .zy-search-wrap:focus-within {
          border-color: #c47070;
          box-shadow: 0 4px 32px rgba(139, 46, 46, 0.13);
        }

        .zy-input {
          flex: 1;
          border: none;
          background: transparent;
          font-family: 'Jost', sans-serif;
          font-size: 15px;
          font-weight: 300;
          color: #3a2020;
          outline: none;
          letter-spacing: 0.02em;
        }
        .zy-input::placeholder {
          color: #c4a5a5;
        }

        .zy-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #8b2e2e;
          color: #fff8f5;
          border: none;
          border-radius: 48px;
          padding: 13px 26px;
          font-family: 'Jost', sans-serif;
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          cursor: pointer;
          white-space: nowrap;
          transition: background 0.2s, transform 0.15s;
        }
        .zy-btn:hover:not(:disabled) {
          background: #6e2020;
          transform: scale(1.02);
        }
        .zy-btn:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        /* ── Spinner ── */
        .zy-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,248,245,0.35);
          border-top-color: #fff8f5;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── Filter pills ── */
        .filter-pills {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 8px;
          margin-top: 20px;
          animation: fadeUp 0.4s ease both;
        }
        .pills-label {
          font-size: 10px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #b08080;
          margin-right: 4px;
        }
        .pill {
          background: #f5e9e9;
          border: 1px solid #e0c4c4;
          color: #7a3030;
          font-size: 12px;
          padding: 4px 14px;
          border-radius: 40px;
          font-weight: 400;
        }

        /* ── Results header ── */
        .zy-results-header {
          display: flex;
          align-items: baseline;
          gap: 12px;
          margin: 52px 0 28px;
          animation: fadeUp 0.4s ease both;
        }
        .zy-results-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.5rem;
          font-weight: 400;
          color: #2b1414;
          margin: 0;
        }
        .zy-results-count {
          font-size: 12px;
          color: #b08080;
          letter-spacing: 0.08em;
        }

        /* ── Grid ── */
        .zy-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 24px;
          animation: fadeUp 0.5s ease both;
        }

        /* ── Cards ── */
        .zy-card {
          background: #fffaf9;
          border: 1px solid #eedcdc;
          border-radius: 16px;
          overflow: hidden;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .zy-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 36px rgba(139, 46, 46, 0.1);
        }

        .card-img-wrap {
          position: relative;
          background: linear-gradient(135deg, #f9eded 0%, #f0e0e0 100%);
          height: 180px;
          overflow: hidden;
        }
        .card-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.35s ease;
        }
        .zy-card:hover .card-img {
          transform: scale(1.05);
        }
        .card-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          background: rgba(255,250,249,0.9);
          border: 1px solid #e5cece;
          color: #8b2e2e;
          font-size: 9px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          padding: 4px 10px;
          border-radius: 20px;
          font-weight: 500;
        }
        .card-body {
          padding: 18px 20px 20px;
        }
        .card-name {
          font-size: 14px;
          font-weight: 400;
          color: #3a2020;
          margin: 0 0 10px;
          line-height: 1.4;
          letter-spacing: 0.01em;
        }
        .card-price {
          font-family: 'Playfair Display', serif;
          font-size: 17px;
          color: #8b2e2e;
          margin: 0;
          font-weight: 600;
        }

        /* ── Shimmer loading ── */
        .shimmer-card .card-img-wrap {
          height: 180px;
        }
        .shimmer-img {
          width: 100%;
          height: 180px;
          background: linear-gradient(90deg, #f0e0e0 25%, #f9eded 50%, #f0e0e0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.4s infinite;
        }
        .shimmer-line {
          height: 12px;
          border-radius: 6px;
          margin: 0 20px 10px;
          background: linear-gradient(90deg, #f0e0e0 25%, #f9eded 50%, #f0e0e0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.4s infinite;
        }
        .shimmer-line.long  { width: calc(100% - 40px); margin-top: 18px; }
        .shimmer-line.short { width: 55%; }
        .shimmer-line.price { width: 35%; height: 16px; }
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        /* ── Empty / Error states ── */
        .zy-state-box {
          text-align: center;
          padding: 60px 24px;
          animation: fadeUp 0.4s ease both;
        }
        .zy-state-icon {
          font-size: 36px;
          margin-bottom: 16px;
          display: block;
        }
        .zy-state-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.3rem;
          color: #2b1414;
          margin: 0 0 8px;
          font-weight: 400;
        }
        .zy-state-msg {
          font-size: 13px;
          color: #b08080;
          font-weight: 300;
          max-width: 360px;
          margin: 0 auto;
          line-height: 1.7;
        }
        .zy-error-box {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          background: #fff0f0;
          border: 1px solid #f0d0d0;
          border-radius: 12px;
          padding: 16px 20px;
          max-width: 680px;
          margin-top: 20px;
          animation: fadeUp 0.3s ease both;
        }
        .zy-error-box svg { flex-shrink: 0; margin-top: 1px; }
        .zy-error-text { font-size: 13px; color: #8b2e2e; font-weight: 400; line-height: 1.5; }

        /* ── Animations ── */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── Responsive ── */
        @media (max-width: 640px) {
          .zy-search-root { padding: 48px 20px 60px; }
          .zy-search-wrap { padding: 6px 6px 6px 20px; }
          .zy-btn { padding: 11px 18px; font-size: 11px; }
          .zy-grid { grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 16px; }
        }
      `}</style>

      <section className="zy-search-root">
        {/* ── Header ── */}
        <p className="zy-eyebrow">AI Gift Finder</p>
        <h2 className="zy-heading">
          Find what you&apos;re <em>looking for</em>
        </h2>
        <p className="zy-sub">
          Describe it in plain words — our AI handles the rest.
        </p>

        {/* ── Search Bar ── */}
        <div ref={wrapRef} style={{ position: "relative", maxWidth: 680 }}>
          <div className="zy-search-wrap">
            <input
              type="text"
              className="zy-input"
              placeholder="e.g. &quot;elegant handbag under ₹8000&quot;"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              disabled={loading}
              aria-label="AI search query"
              autoComplete="off"
            />
            <button
              className="zy-btn"
              onClick={handleSearch}
              disabled={loading || !query.trim()}
              aria-label="Search"
            >
              {loading ? (
                <><div className="zy-spinner" /> Searching</>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.4"/>
                    <path d="M9.5 9.5l2.5 2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                  </svg>
                  Search
                </>
              )}
            </button>
          </div>

          {/* ── Suggestions Dropdown ── */}
          {showSuggestions && suggestions.length > 0 && (
            <ul style={{
              position: "absolute",
              top: "calc(100% + 6px)",
              left: 0,
              right: 0,
              background: "#fffaf9",
              border: "1px solid #e5cece",
              borderRadius: 14,
              boxShadow: "0 8px 28px rgba(139,46,46,0.10)",
              listStyle: "none",
              margin: 0,
              padding: "6px 0",
              zIndex: 50,
            }}>
              {suggestions.map((s) => (
                <li
                  key={s}
                  onMouseDown={() => pickSuggestion(s)}
                  style={{
                    padding: "10px 20px",
                    fontSize: 14,
                    color: "#3a2020",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#f5e9e9")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0, opacity: 0.5 }}>
                    <circle cx="5" cy="5" r="3.5" stroke="#8b2e2e" strokeWidth="1.2"/>
                    <path d="M8 8l2 2" stroke="#8b2e2e" strokeWidth="1.2" strokeLinecap="round"/>
                  </svg>
                  {s}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="zy-error-box" role="alert">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="7" stroke="#8b2e2e" strokeWidth="1.3"/>
              <path d="M8 4.5v4M8 10.5v1" stroke="#8b2e2e" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            <p className="zy-error-text">{error}</p>
          </div>
        )}

        {/* ── Filter Pills ── */}
        {filters && <FilterPills filters={filters} />}

        {/* ── Results ── */}
        {loading && (
          <>
            <div className="zy-results-header">
              <h3 className="zy-results-title">Curating your picks…</h3>
            </div>
            <div className="zy-grid">
              {[...Array(4)].map((_, i) => <ShimmerCard key={i} />)}
            </div>
          </>
        )}

        {!loading && products !== null && (
          <>
            <div className="zy-results-header">
              <h3 className="zy-results-title">
                {products.length > 0 ? "Your curated picks" : "No results found"}
              </h3>
              {products.length > 0 && (
                <span className="zy-results-count">{products.length} items</span>
              )}
            </div>

            {products.length > 0 ? (
              <div className="zy-grid">
                {products.map((p) => (
                  <ProductCard key={p._id} product={p} />
                ))}
              </div>
            ) : (
              <div className="zy-state-box">
                <span className="zy-state-icon">🔍</span>
                <p className="zy-state-title">Nothing matched your search</p>
                <p className="zy-state-msg">
                  Try different keywords or a broader description — like
                  &quot;luxury gift under ₹5000&quot;.
                </p>
              </div>
            )}
          </>
        )}

        {/* ── Idle hint (before first search) ── */}
        {!hasSearched && !loading && (
          <div className="zy-state-box" style={{ paddingTop: 48 }}>
            <span className="zy-state-icon">✦</span>
            <p className="zy-state-title">What are you searching for?</p>
            <p className="zy-state-msg">
              Try &ldquo;soft pink handbag under ₹10,000&rdquo; or
              &ldquo;luxury gift for her&rdquo; — as natural as you think it.
            </p>
          </div>
        )}
      </section>
    </>
  );
}
