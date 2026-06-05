"use client";

import { useState, useCallback, useEffect, useRef, KeyboardEvent } from "react";
import { resolveProductImage } from "@/lib/productImage";

// ── Web Speech API types (not in lib.dom.d.ts by default) ────────────────────
interface SpeechRecognitionResult {
  readonly [index: number]: SpeechRecognitionAlternative;
  readonly length: number;
}
interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}
interface SpeechRecognitionResultList {
  readonly [index: number]: SpeechRecognitionResult;
  readonly length: number;
}
interface SpeechRecognitionEvent extends Event {
  readonly results: SpeechRecognitionResultList;
}
interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
}
interface SpeechRecognitionInstance extends EventTarget {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onstart:  (() => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror:  ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend:    (() => void) | null;
  start(): void;
}
interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionInstance;
}
// ─────────────────────────────────────────────────────────────────────────────

interface Product { _id: string; name: string; category: string; price: number; image?: string; }
interface SearchFilters { category: string | null; minPrice: number | null; maxPrice: number | null; keywords: string[]; }
interface SearchResponse { success: boolean; filters: SearchFilters; products: Product[]; }

function formatPrice(p: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(p);
}

const FALLBACK_IMG = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80";
function getImageSrc(image?: string) { return image ? resolveProductImage(image) : FALLBACK_IMG; }

function ShimmerCard() {
  return (
    <div className="zy-card shimmer-card">
      <div className="shimmer-img" />
      <div className="shimmer-line long" /><div className="shimmer-line short" /><div className="shimmer-line price" />
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  return (
    <article className="zy-card product-card">
      <div className="card-img-wrap">
        <img src={getImageSrc(product.image)} alt={product.name} className="card-img"
          onError={(e) => { (e.currentTarget as HTMLImageElement).src = FALLBACK_IMG; }} />
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
  if (!pills.length) return null;
  return (
    <div className="filter-pills">
      <span className="pills-label">AI detected</span>
      {pills.map((p) => <span key={p} className="pill">{p}</span>)}
    </div>
  );
}

export default function AISearch() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<SearchFilters | null>(null);
  const [products, setProducts] = useState<Product[] | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);

  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  // ── Core search ──────────────────────────────────────────────────────────
  const runSearch = useCallback(async (q: string) => {
    if (!q) return;
    setShowSuggestions(false);
    setSuggestions([]);
    setLoading(true);
    setError(null);
    setFilters(null);
    setProducts(null);
    setHasSearched(true);
    try {
      const res = await fetch(`${(process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api").replace(/\/api\/?$/, "")}/api/ai/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      });
      if (!res.ok) throw new Error(`Server responded with ${res.status}`);
      const data: SearchResponse = await res.json();
      if (!data.success) throw new Error("Search was unsuccessful. Please try again.");
      setFilters(data.filters);
      setProducts(data.products);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, []); // no deps — stable reference

  // ── Keep a ref to runSearch so voice onresult never has a stale closure ──
  const runSearchRef = useRef(runSearch);
  useEffect(() => { runSearchRef.current = runSearch; }, [runSearch]);

  // ── Navbar events ─────────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: Event) => {
      const { query: q } = (e as CustomEvent<{ query: string }>).detail;
      if (q) { setQuery(q); runSearchRef.current(q); }
    };
    window.addEventListener("navbar-ai-search", handler);
    return () => window.removeEventListener("navbar-ai-search", handler);
  }, []);

  // ── Suggestions debounce ──────────────────────────────────────────────────
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const q = query.trim();
    if (!q) { setSuggestions([]); setShowSuggestions(false); return; }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`${(process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api").replace(/\/api\/?$/, "")}/api/ai/suggestions?q=${encodeURIComponent(q)}`);
        if (!res.ok) throw new Error();
        const data: string[] = await res.json();
        setSuggestions(data); setShowSuggestions(data.length > 0);
      } catch {
        const fb = ["luxury watches","gift for her","birthday gifts","premium handbags","perfumes for men","watches under 5000"]
          .filter((s) => s.includes(q.toLowerCase()));
        setSuggestions(fb); setShowSuggestions(fb.length > 0);
      }
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  // ── Close dropdown on outside click ──────────────────────────────────────
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setShowSuggestions(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const pickSuggestion = (s: string) => { setQuery(s); setSuggestions([]); setShowSuggestions(false); };

  const handleSearch = useCallback(() => {
    const t = query.trim();
    if (t) runSearchRef.current(t);
  }, [query]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") { setShowSuggestions(false); handleSearch(); }
    if (e.key === "Escape") setShowSuggestions(false);
  };

  // ── Voice Search ──────────────────────────────────────────────────────────
  const startListening = () => {
    setVoiceError(null);

    // Resolve the constructor with proper typing — no `any`
    const SRConstructor: SpeechRecognitionConstructor | undefined =
      (window as Window & { SpeechRecognition?: SpeechRecognitionConstructor }).SpeechRecognition ??
      (window as Window & { webkitSpeechRecognition?: SpeechRecognitionConstructor }).webkitSpeechRecognition;

    if (!SRConstructor) {
      setVoiceError("Voice search not supported. Please use Chrome or Edge.");
      return;
    }

    const recognition: SpeechRecognitionInstance = new SRConstructor();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const text: string = event.results[0][0].transcript;
      setQuery(text);
      runSearchRef.current(text); // always calls latest — no stale closure
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      setIsListening(false);
      const msg: Record<string, string> = {
        "not-allowed": "Microphone access denied — click the lock icon in your browser address bar and allow microphone.",
        "no-speech":   "No speech detected. Please speak clearly after clicking the mic.",
        "network":     "Voice recognition needs a secure connection. Open the app via localhost (not a LAN IP like 192.168.x.x) or deploy with HTTPS.",
        "aborted":     "Voice input was cancelled.",
      };
      setVoiceError(msg[event.error] ?? `Voice recognition error: ${event.error}`);
    };

    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const dismissVoiceError = () => setVoiceError(null);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400;1,600&family=DM+Sans:wght@300;400;500&display=swap');
        .zy-search-root { font-family:'DM Sans',sans-serif; padding:72px 40px 80px; max-width:1200px; margin:0 auto; color:#3a2020; }
        .zy-eyebrow { display:flex; align-items:center; gap:10px; font-size:11px; letter-spacing:0.22em; text-transform:uppercase; color:#9b5c5c; margin-bottom:18px; font-weight:500; }
        .zy-eyebrow::before { content:''; display:block; width:32px; height:1px; background:#9b5c5c; }
        .zy-heading { font-family:'Cormorant Garamond',serif; font-size:clamp(2rem,4vw,3rem); font-weight:400; line-height:1.15; margin:0 0 10px; color:#2b1414; }
        .zy-heading em { font-style:italic; color:#8b2e2e; }
        .zy-sub { font-size:14px; color:#9b8080; font-weight:300; margin:0 0 40px; letter-spacing:0.02em; }

        .zy-search-wrap { display:flex; align-items:center; background:#fff8f7; border:1px solid #e5cece; border-radius:60px; padding:8px 8px 8px 28px; max-width:680px; box-shadow:0 4px 24px rgba(139,46,46,0.06); transition:border-color 0.25s,box-shadow 0.25s; }
        .zy-search-wrap:focus-within { border-color:#c47070; box-shadow:0 4px 32px rgba(139,46,46,0.13); }
        .zy-input { flex:1; border:none; background:transparent; font-family:'DM Sans',sans-serif; font-size:15px; font-weight:300; color:#3a2020; outline:none; letter-spacing:0.02em; }
        .zy-input::placeholder { color:#c4a5a5; }

        .zy-mic-btn { display:flex; align-items:center; justify-content:center; width:40px; height:40px; border-radius:50%; border:1.5px solid #e5cece; background:transparent; cursor:pointer; margin-right:6px; flex-shrink:0; transition:border-color 0.2s,background 0.2s,transform 0.15s; }
        .zy-mic-btn:hover:not(:disabled) { border-color:#c47070; background:#f5e9e9; transform:scale(1.07); }
        .zy-mic-btn:disabled { opacity:0.45; cursor:not-allowed; }
        .zy-mic-btn.listening { border-color:#8b2e2e; background:#fff0f0; animation:mic-pulse 1.1s ease-in-out infinite; }
        @keyframes mic-pulse { 0%,100% { box-shadow:0 0 0 0 rgba(139,46,46,0.35); } 50% { box-shadow:0 0 0 7px rgba(139,46,46,0); } }

        .zy-btn { display:flex; align-items:center; gap:8px; background:#8b2e2e; color:#fff8f5; border:none; border-radius:48px; padding:13px 26px; font-family:'DM Sans',sans-serif; font-size:12px; font-weight:500; letter-spacing:0.14em; text-transform:uppercase; cursor:pointer; white-space:nowrap; transition:background 0.2s,transform 0.15s; }
        .zy-btn:hover:not(:disabled) { background:#6e2020; transform:scale(1.02); }
        .zy-btn:disabled { opacity:0.65; cursor:not-allowed; }
        .zy-spinner { width:16px; height:16px; border:2px solid rgba(255,248,245,0.35); border-top-color:#fff8f5; border-radius:50%; animation:spin 0.7s linear infinite; }
        @keyframes spin { to { transform:rotate(360deg); } }

        .filter-pills {
          display: flex; flex-wrap: wrap; align-items: center;
          gap: 8px; margin-top: 20px; animation: fadeUp 0.4s ease both;
        }
        .pills-label { font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase; color: #b08080; margin-right: 4px; }
        .pill { background: #f5e9e9; border: 1px solid #e0c4c4; color: #7a3030; font-size: 12px; padding: 4px 14px; border-radius: 40px; font-weight: 400; }

        .zy-results-header { display: flex; align-items: baseline; gap: 12px; margin: 52px 0 28px; animation: fadeUp 0.4s ease both; }
        .zy-results-title { font-family: 'Cormorant Garamond', serif; font-size: 1.5rem; font-weight: 400; color: #2b1414; margin: 0; }
        .zy-results-count { font-size: 12px; color: #b08080; letter-spacing: 0.08em; }

        .zy-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 24px; animation: fadeUp 0.5s ease both; }

        .zy-card { background: #fffaf9; border: 1px solid #eedcdc; border-radius: 16px; overflow: hidden; transition: transform 0.2s, box-shadow 0.2s; }
        .zy-card:hover { transform: translateY(-4px); box-shadow: 0 12px 36px rgba(139, 46, 46, 0.1); }

        .card-img-wrap { position: relative; background: linear-gradient(135deg, #f9eded 0%, #f0e0e0 100%); height: 180px; overflow: hidden; }
        .card-img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.35s ease; }
        .zy-card:hover .card-img { transform: scale(1.05); }
        .card-badge { position: absolute; top: 12px; right: 12px; background: rgba(255,250,249,0.9); border: 1px solid #e5cece; color: #8b2e2e; font-size: 9px; letter-spacing: 0.14em; text-transform: uppercase; padding: 4px 10px; border-radius: 20px; font-weight: 500; }
        .card-body { padding: 18px 20px 20px; }
        .card-name { font-size: 14px; font-weight: 400; color: #3a2020; margin: 0 0 10px; line-height: 1.4; }
        .card-price { font-family: 'Cormorant Garamond', serif; font-size: 17px; color: #8b2e2e; margin: 0; font-weight: 600; }

        .shimmer-card .card-img-wrap { height: 180px; }
        .shimmer-img { width: 100%; height: 180px; background: linear-gradient(90deg, #f0e0e0 25%, #f9eded 50%, #f0e0e0 75%); background-size: 200% 100%; animation: shimmer 1.4s infinite; }
        .shimmer-line { height: 12px; border-radius: 6px; margin: 0 20px 10px; background: linear-gradient(90deg, #f0e0e0 25%, #f9eded 50%, #f0e0e0 75%); background-size: 200% 100%; animation: shimmer 1.4s infinite; }
        .shimmer-line.long { width: calc(100% - 40px); margin-top: 18px; }
        .shimmer-line.short { width: 55%; }
        .shimmer-line.price { width: 35%; height: 16px; }
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

        .zy-state-box { text-align: center; padding: 60px 24px; animation: fadeUp 0.4s ease both; }
        .zy-state-icon { font-size: 36px; margin-bottom: 16px; display: block; }
        .zy-state-title { font-family: 'Cormorant Garamond', serif; font-size: 1.3rem; color: #2b1414; margin: 0 0 8px; font-weight: 400; }
        .zy-state-msg { font-size: 13px; color: #b08080; font-weight: 300; max-width: 360px; margin: 0 auto; line-height: 1.7; }

        .zy-error-box { display: flex; align-items: flex-start; gap: 12px; background: #fff0f0; border: 1px solid #f0d0d0; border-radius: 12px; padding: 16px 20px; max-width: 680px; margin-top: 20px; animation: fadeUp 0.3s ease both; }
        .zy-error-text { font-size: 13px; color: #8b2e2e; font-weight: 400; line-height: 1.5; }

        @keyframes fadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }

        @media (max-width: 640px) {
          .zy-search-root { padding: 48px 20px 60px; }
          .zy-search-wrap { padding: 6px 6px 6px 20px; }
          .zy-btn { padding: 11px 18px; font-size: 11px; }
          .zy-grid { grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 16px; }
        }
      `}</style>

      <section className="zy-search-root">
        <p className="zy-eyebrow">AI Gift Finder</p>
        <h2 className="zy-heading">Find what you&apos;re <em>looking for</em></h2>
        <p className="zy-sub">Describe it in plain words — or just speak. Our AI handles the rest.</p>

        {/* ── Search Bar ── */}
        <div ref={wrapRef} style={{ position: "relative", maxWidth: 680 }}>
          <div className="zy-search-wrap">
            <input
              type="text" className="zy-input"
              placeholder='e.g. "elegant handbag under ₹8000"'
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              disabled={loading}
              aria-label="AI search query"
              autoComplete="off"
            />

            {/* ── Mic button ── */}
            <button
              className={`zy-mic-btn${isListening ? " listening" : ""}`}
              onClick={startListening}
              disabled={loading || isListening}
              aria-label={isListening ? "Listening…" : "Voice search"}
              title={isListening ? "Listening…" : "Click to search by voice"}
            >
              {isListening ? (
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <rect x="3" y="3" width="10" height="10" rx="2" fill="#8b2e2e" />
                </svg>
              ) : (
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                  <rect x="5.5" y="1" width="5" height="8" rx="2.5" stroke="#8b2e2e" strokeWidth="1.4"/>
                  <path d="M3 7.5A5 5 0 0 0 13 7.5" stroke="#8b2e2e" strokeWidth="1.4" strokeLinecap="round"/>
                  <line x1="8" y1="12.5" x2="8" y2="15" stroke="#8b2e2e" strokeWidth="1.4" strokeLinecap="round"/>
                  <line x1="5.5" y1="15" x2="10.5" y2="15" stroke="#8b2e2e" strokeWidth="1.4" strokeLinecap="round"/>
                </svg>
              )}
            </button>

            <button className="zy-btn" onClick={handleSearch}
              disabled={loading || !query.trim()} aria-label="Search">
              {loading
                ? <><div className="zy-spinner" /> Searching</>
                : <><svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.4"/>
                    <path d="M9.5 9.5l2.5 2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                  </svg> Search</>}
            </button>
          </div>

          {/* Listening / voice error label */}
          {isListening && (
            <p className="zy-mic-status listening">🎤 Listening… speak now</p>
          )}
          {!isListening && voiceError && (
            <div className="zy-mic-status error">
              <span>⚠ {voiceError}</span>
              <button className="zy-mic-retry" onClick={startListening}>Retry</button>
              <button className="zy-mic-dismiss" onClick={dismissVoiceError} aria-label="Dismiss">✕</button>
            </div>
          )}

          {/* Suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <ul style={{ position:"absolute", top:"calc(100% + 6px)", left:0, right:0, background:"#fffaf9", border:"1px solid #e5cece", borderRadius:14, boxShadow:"0 8px 28px rgba(139,46,46,0.10)", listStyle:"none", margin:0, padding:"6px 0", zIndex:50 }}>
              {suggestions.map((s) => (
                <li key={s} onMouseDown={() => pickSuggestion(s)}
                  style={{ padding:"10px 20px", fontSize:14, color:"#3a2020", cursor:"pointer", display:"flex", alignItems:"center", gap:10, fontFamily:"'DM Sans',sans-serif", fontWeight:300 }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#f5e9e9")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink:0, opacity:0.5 }}>
                    <circle cx="5" cy="5" r="3.5" stroke="#8b2e2e" strokeWidth="1.2"/>
                    <path d="M8 8l2 2" stroke="#8b2e2e" strokeWidth="1.2" strokeLinecap="round"/>
                  </svg>
                  {s}
                </li>
              ))}
            </ul>
          )}
        </div>

        {error && (
          <div className="zy-error-box" role="alert">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="7" stroke="#8b2e2e" strokeWidth="1.3"/>
              <path d="M8 4.5v4M8 10.5v1" stroke="#8b2e2e" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            <p className="zy-error-text">{error}</p>
          </div>
        )}

        {filters && <FilterPills filters={filters} />}

        {loading && (
          <>
            <div className="zy-results-header"><h3 className="zy-results-title">Curating your picks…</h3></div>
            <div className="zy-grid">{[...Array(4)].map((_, i) => <ShimmerCard key={i} />)}</div>
          </>
        )}

        {!loading && products !== null && (
          <>
            <div className="zy-results-header">
              <h3 className="zy-results-title">{products.length > 0 ? "Your curated picks" : "No results found"}</h3>
              {products.length > 0 && <span className="zy-results-count">{products.length} items</span>}
            </div>
            {products.length > 0
              ? <div className="zy-grid">{products.map((p) => <ProductCard key={p._id} product={p} />)}</div>
              : <div className="zy-state-box">
                  <span className="zy-state-icon">🔍</span>
                  <p className="zy-state-title">Nothing matched your search</p>
                  <p className="zy-state-msg">Try different keywords — like &quot;luxury gift under ₹5000&quot;.</p>
                </div>}
          </>
        )}

        {!hasSearched && !loading && (
          <div className="zy-state-box" style={{ paddingTop: 48 }}>
            <span className="zy-state-icon">✦</span>
            <p className="zy-state-title">What are you searching for?</p>
            <p className="zy-state-msg">
              Try &ldquo;soft pink handbag under ₹10,000&rdquo; or just tap the mic and speak.
            </p>
          </div>
        )}
      </section>
    </>
  );
}