"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useCartStore } from "@/store/cart.store";
import { useAuthStore } from "@/store/auth.store";

/* ─── Nav items ───────────────────────────────── */
const navItems = [
  { href: "#new-arrivals", label: "New Arrivals" },
  { href: "#floral",       label: "Floral Stories" },
  { href: "#ai-finder",    label: "AI Finder" },
  { href: "#ar-demo",      label: "AR Demo" },
  { href: "#collections",  label: "Collections" },
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

  /* Gender links */
  .nb-gender {
    font-family: 'Inter', sans-serif;
    font-size: 0.65rem;
    font-weight: 400;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: #8A6060;
    text-decoration: none;
    transition: color 0.18s ease;
  }
  .nb-gender:hover { color: #7B1728; }

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
`;

export default function Navbar() {
  const router   = useRouter();
  const pathname = usePathname();

  const [activeHash, setActiveHash] = useState("");
  const [scrolled,   setScrolled]   = useState(false);

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
            gridTemplateColumns: "1fr auto 1fr",
            alignItems: "center",
            gap: "1rem",
          }}
        >

          {/* ── LEFT: Gender ─────────────────────── */}
          <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
            <a href="#men"   className="nb-gender">Men</a>
            <span className="nb-divider" />
            <a href="#women" className="nb-gender">Women</a>
          </div>

          {/* ── CENTER: Wordmark ──────────────────── */}
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

          {/* ── RIGHT: Nav + Auth + Cart ──────────── */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: "2rem",
            }}
          >
            {/* Nav links */}
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
                {/* Pulsing live dot */}
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