"use client";

import { useState, useCallback, useEffect, useRef, KeyboardEvent } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useCartStore } from "@/store/cart.store";
import { useAuthStore } from "@/store/auth.store";

/* ─── Nav items ───────────────────────────────── */
const navItems = [
  { href: "#new-arrivals", label: "New Arrivals" },
  { href: "#ar-demo",      label: "AR Demo" },
  { href: "#collections",  label: "Collections" },
];

const FALLBACK_SUGGESTIONS = [
  "luxury watches",
  "gift for her",
  "birthday gifts",
  "premium handbags",
  "perfumes for men",
  "watches under 5000",
];

/* ─── Injected keyframes ──────────────────────── */
const NAV_STYLES = `
  @keyframes nb-fade-down {
    from { opacity: 0; transform: translateY(-6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .nb-root {
    animation: nb-fade-down 0.55s cubic-bezier(0.22,1,0.36,1) both;
  }

  /* Link underline slide */
  .nb-link {
    position: relative;
    text-decoration: none;
    transition: color 0.2s ease;
  }
  .nb-link::after {
    content: '';
    position: absolute;
    bottom: -3px; left: 0;
    width: 0; height: 1px;
    background: #7B1728;
    transition: width 0.25s ease;
  }
  .nb-link:hover::after,
  .nb-link.active::after { width: 100%; }

  /* Cart pill */
  .nb-cart {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 0.68rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    color: #fff;
    background: linear-gradient(135deg, #C96B7A 0%, #9B2D3A 100%);
    padding: 8px 18px;
    border-radius: 999px;
    text-decoration: none;
    box-shadow: 0 4px 14px rgba(155,45,58,0.28);
    transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.18s ease;
    white-space: nowrap;
  }
  .nb-cart:hover {
    transform: translateY(-2px) scale(1.02);
    box-shadow: 0 8px 22px rgba(155,45,58,0.36);
    opacity: 0.92;
  }

  /* Thin divider */
  .nb-divider {
    width: 1px;
    height: 12px;
    background: rgba(100,60,60,0.22);
    display: inline-block;
  }

  /* Scrolled state */
  .nb-scrolled {
    background: rgba(253, 248, 245, 0.97) !important;
    box-shadow: 0 2px 18px rgba(80,30,30,0.07) !important;
  }

  /* ── Reels live dot pulse ────────────────────── */
  @keyframes nb-pulse {
    0%, 100% { opacity: 1;   transform: scale(1); }
    50%       { opacity: 0.4; transform: scale(0.7); }
  }
  .nb-reels-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: #C0334A;
    flex-shrink: 0;
    animation: nb-pulse 1.8s ease-in-out infinite;
  }

  /* Reels link wrapper */
  .nb-reels {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    position: relative;
    text-decoration: none;
    transition: color 0.2s ease;
  }
  .nb-reels::after {
    content: '';
    position: absolute;
    bottom: -3px; left: 0;
    width: 0; height: 1px;
    background: #7B1728;
    transition: width 0.25s ease;
  }
  .nb-reels:hover::after,
  .nb-reels.active::after { width: 100%; }

  /* ── Embedded AI Search ─────────────────────── */
  .nb-search-wrap {
    display: flex;
    align-items: center;
    background: rgba(255,250,248,0.85);
    border: 1px solid rgba(180,120,120,0.28);
    border-radius: 999px;
    padding: 5px 5px 5px 14px;
    width: 200px;
    transition: width 0.35s cubic-bezier(0.22,1,0.36,1), border-color 0.25s, box-shadow 0.25s, background 0.25s;
  }
  .nb-search-wrap:focus-within {
    border-color: #c47070;
    box-shadow: 0 2px 16px rgba(139,46,46,0.13);
    background: #fffaf9;
    width: 260px;
  }
  .nb-search-input {
    flex: 1;
    border: none;
    background: transparent;
    font-family: 'Inter', sans-serif;
    font-size: 11.5px;
    font-weight: 400;
    color: #3a2020;
    outline: none;
    letter-spacing: 0.02em;
    min-width: 0;
  }
  .nb-search-input::placeholder { color: #c4a5a5; }

  .nb-search-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    background: #8b2e2e;
    border: none;
    border-radius: 50%;
    width: 26px;
    height: 26px;
    cursor: pointer;
    flex-shrink: 0;
    transition: background 0.2s, transform 0.15s;
    color: #fff8f5;
  }
  .nb-search-btn:hover:not(:disabled) {
    background: #6e2020;
    transform: scale(1.08);
  }
  .nb-search-btn:disabled { opacity: 0.6; cursor: not-allowed; }

  .nb-ai-label {
    font-size: 8.5px;
    font-weight: 400;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: #9b5c5c;
    padding-left: 14px;
    margin-top: 3px;
    display: block;
    white-space: nowrap;
  }

  /* Suggestions dropdown */
  .nb-suggestions {
    position: absolute;
    top: calc(100% + 6px);
    left: 0;
    right: 0;
    background: #fffaf9;
    border: 1px solid #e5cece;
    border-radius: 14px;
    box-shadow: 0 8px 28px rgba(139,46,46,0.10);
    list-style: none;
    margin: 0;
    padding: 6px 0;
    z-index: 200;
  }
  .nb-suggestion-item {
    padding: 9px 16px;
    font-size: 12px;
    color: #3a2020;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: background 0.15s;
  }
  .nb-suggestion-item:hover { background: #f5e9e9; }

  @keyframes nb-spin { to { transform: rotate(360deg); } }
  .nb-spin { animation: nb-spin 0.7s linear infinite; display: inline-block; }
`;

export default function Navbar() {
  const router   = useRouter();
  const pathname = usePathname();

  const [activeHash, setActiveHash] = useState("");
  const [scrolled,   setScrolled]   = useState(false);

  /* ── AI Search state ──────────────────────────── */
  const [searchQuery,   setSearchQuery]   = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [suggestions,   setSuggestions]   = useState<string[]>([]);
  const [showSugg,      setShowSugg]      = useState(false);
  const debounceRef   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchWrapRef = useRef<HTMLDivElement>(null);

  const cart = useCartStore((s) => s.cart);
  const { user, logout, hydrated } = useAuthStore();

  const count = cart?.items?.reduce((s, i) => s + i.quantity, 0) ?? 0;
  const reelsActive = pathname === "/reels";

  /* ── Scroll spy ────────────────────────────────── */
  useEffect(() => {
    const sections = navItems.map((item) => document.querySelector(item.href));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveHash(`#${entry.target.id}`);
        });
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: 0 }
    );

    sections.forEach((s) => s && observer.observe(s));
    return () => observer.disconnect();
  }, []);

  /* ── Scrolled shadow ───────────────────────────── */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ── Suggestions debounce ─────────────────────── */
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const q = searchQuery.trim();
    if (!q) { setSuggestions([]); setShowSugg(false); return; }

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/ai/suggestions?q=${encodeURIComponent(q)}`
        );
        if (!res.ok) throw new Error();
        const data: string[] = await res.json();
        setSuggestions(data);
        setShowSugg(data.length > 0);
      } catch {
        const fb = FALLBACK_SUGGESTIONS.filter((s) => s.includes(q.toLowerCase()));
        setSuggestions(fb);
        setShowSugg(fb.length > 0);
      }
    }, 300);

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchQuery]);

  /* Close suggestions on outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target as Node))
        setShowSugg(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const pickSuggestion = (s: string) => {
    setSearchQuery(s);
    setSuggestions([]);
    setShowSugg(false);
  };

  /* ── AI Search submit ─────────────────────────── */
  const handleSearch = useCallback(async () => {
    const trimmed = searchQuery.trim();
    if (!trimmed || searchLoading) return;
    setShowSugg(false);
    setSuggestions([]);
    setSearchLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/ai/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: trimmed }),
      });
      if (!res.ok) throw new Error();
      window.dispatchEvent(new CustomEvent("navbar-ai-search", { detail: { query: trimmed } }));
    } catch {
      window.dispatchEvent(new CustomEvent("navbar-ai-search", { detail: { query: trimmed } }));
    } finally {
      setSearchLoading(false);
      const el = document.getElementById("ai-search");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  }, [searchQuery, searchLoading]);

  const handleSearchKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") { setShowSugg(false); handleSearch(); }
    if (e.key === "Escape") setShowSugg(false);
  };

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  if (!hydrated) return null;

  return (
    <>
      <style>{NAV_STYLES}</style>

      <header
        className={`nb-root ${scrolled ? "nb-scrolled" : ""}`}
        style={{
          position: "fixed",
          top: 0, left: 0, right: 0,
          zIndex: 100,
          backdropFilter: "blur(18px) saturate(180%)",
          background: "rgba(253, 248, 245, 0.92)",
          borderBottom: "1px solid rgba(180,120,120,0.1)",
          transition: "background 0.3s ease, box-shadow 0.3s ease",
        }}
      >
        <div
          style={{
            maxWidth: 1320,
            margin: "0 auto",
            padding: "0 2.5rem",
            height: 70,
            display: "grid",
            gridTemplateColumns: "auto 1fr auto",
            alignItems: "center",
            gap: "1rem",
          }}
        >

          {/* ── LEFT: Wordmark ────────────────────── */}
          <Link
            href="/"
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: "clamp(1.45rem, 2.2vw, 1.8rem)",
              fontWeight: 800,
              fontStyle: "italic",
              letterSpacing: "0.06em",
              color: "#7B1728",
              textDecoration: "none",
              whiteSpace: "nowrap",
              lineHeight: 1,
              textAlign: "center",
              userSelect: "none",
            }}
          >
            Zyvora
          </Link>

          {/* ── CENTER: Nav + AI Search ───────────── */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1.8rem" }}>

            <nav style={{ display: "flex", alignItems: "center", gap: "1.8rem" }}>

              {navItems.map(({ href, label }) => {
                const active = activeHash === href;
                return (
                  <a
                    key={label}
                    href={href}
                    onClick={() => setActiveHash(href)}
                    className={`nb-link ${active ? "active" : ""}`}
                    style={{
                      fontSize: "0.65rem",
                      fontWeight: 600,
                      letterSpacing: "0.13em",
                      textTransform: "uppercase",
                      color: active ? "#7B1728" : "#5C3A3A",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {label}
                  </a>
                );
              })}

              {/* ── Reels — separated by a thin rule ── */}
              <span className="nb-divider" style={{ height: 14, margin: "0 0.1rem" }} />

              <Link
                href="/reels"
                className={`nb-reels ${reelsActive ? "active" : ""}`}
                style={{
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  letterSpacing: "0.13em",
                  textTransform: "uppercase",
                  color: reelsActive ? "#7B1728" : "#5C3A3A",
                  whiteSpace: "nowrap",
                }}
              >
                <span className="nb-reels-dot" />
                Reels
              </Link>

              {/* Admin nav link */}
              {user?.role === "admin" && (
                <Link
                  href="/admin/products"
                  className="nb-link"
                  style={{
                    fontSize: "0.65rem",
                    fontWeight: 600,
                    letterSpacing: "0.13em",
                    textTransform: "uppercase",
                    color: "#7B1728",
                    whiteSpace: "nowrap",
                  }}
                >
                  Admin
                </Link>
              )}
            </nav>

            {/* ── AI Search Bar ──────────────────── */}
            <span className="nb-divider" style={{ height: 14 }} />

            <div ref={searchWrapRef} style={{ position: "relative" }}>
              <div className="nb-search-wrap">
                <input
                  type="text"
                  className="nb-search-input"
                  placeholder="Find gifts with AI…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchKey}
                  onFocus={() => suggestions.length > 0 && setShowSugg(true)}
                  disabled={searchLoading}
                  autoComplete="off"
                  aria-label="AI gift search"
                />
                <button
                  className="nb-search-btn"
                  onClick={handleSearch}
                  disabled={searchLoading || !searchQuery.trim()}
                  aria-label="Search"
                >
                  {searchLoading ? (
                    <span className="nb-spin">
                      <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                        <circle cx="6" cy="6" r="4.5" stroke="rgba(255,248,245,0.35)" strokeWidth="1.5"/>
                        <path d="M6 1.5A4.5 4.5 0 0 1 10.5 6" stroke="#fff8f5" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    </span>
                  ) : (
                    <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                      <circle cx="5.5" cy="5.5" r="3.5" stroke="#fff8f5" strokeWidth="1.3"/>
                      <path d="M8.5 8.5l2 2" stroke="#fff8f5" strokeWidth="1.3" strokeLinecap="round"/>
                    </svg>
                  )}
                </button>
              </div>
              <span className="nb-ai-label">✦ AI Finder</span>

              {/* Suggestions dropdown */}
              {showSugg && suggestions.length > 0 && (
                <ul className="nb-suggestions">
                  {suggestions.map((s) => (
                    <li
                      key={s}
                      className="nb-suggestion-item"
                      onMouseDown={() => pickSuggestion(s)}
                    >
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ opacity: 0.45, flexShrink: 0 }}>
                        <circle cx="4.5" cy="4.5" r="3" stroke="#8b2e2e" strokeWidth="1.1"/>
                        <path d="M7 7l1.5 1.5" stroke="#8b2e2e" strokeWidth="1.1" strokeLinecap="round"/>
                      </svg>
                      {s}
                    </li>
                  ))}
                </ul>
              )}
            </div>

          </div>

          {/* ── RIGHT: Auth + Cart ────────────────── */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: "2rem",
            }}
          >
            {/* Thin separator */}
            <span className="nb-divider" style={{ height: 16 }} />

            {/* Auth */}
            {user ? (
              <>
                <span style={{ fontSize: "0.68rem", color: "#8A6060", letterSpacing: "0.03em" }}>
                  Hi, {user.name.split(" ")[0]}
                </span>

                {user.role === "admin" && (
                  <Link
                    href="/admin/products"
                    style={{
                      fontSize: "0.68rem",
                      fontWeight: 600,
                      color: "#8A6060",
                      letterSpacing: "0.05em",
                      textDecoration: "none",
                      transition: "color 0.18s ease",
                    }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#7B1728")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#8A6060")}
                  >
                    Admin
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "0.68rem",
                    fontWeight: 600,
                    color: "#8A6060",
                    letterSpacing: "0.05em",
                    padding: 0,
                    transition: "color 0.18s ease",
                  }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#7B1728")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#8A6060")}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="nb-link"
                  style={{
                    fontSize: "0.68rem",
                    fontWeight: 500,
                    color: "#5C3A3A",
                    letterSpacing: "0.05em",
                  }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#7B1728")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#5C3A3A")}
                >
                  Login
                </Link>
                <span className="nb-divider" />
                <Link
                  href="/register"
                  className="nb-link"
                  style={{
                    fontSize: "0.68rem",
                    fontWeight: 500,
                    color: "#5C3A3A",
                    letterSpacing: "0.05em",
                  }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#7B1728")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#5C3A3A")}
                >
                  Register
                </Link>
              </>
            )}

            {/* Cart pill */}
            <Link href="/cart" className="nb-cart">
              <span style={{ fontWeight: 400, opacity: 0.8 }}>+</span>
              Cart ({count})
            </Link>
          </div>

        </div>
      </header>
    </>
  );
}