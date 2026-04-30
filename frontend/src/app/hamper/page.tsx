"use client";

// app/hamper/page.tsx
// ─── Full split-panel hamper page ─────────────────────────────────────────────
// FIX: was managing its own selectedItems / saveHamper / debounce locally.
//      All hamper state now comes from useHamperContext() so the floating
//      drawer and this page always stay in sync.

import { useState, useEffect, useCallback } from "react";
import { useHamperContext } from "@/context/HamperContext";
import FloatingHamperButton from "@/components/FloatingHamperButton";
import HamperDrawer from "@/components/HamperDrawer";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Product {
  _id: string;
  name: string;
  price: number;
  image: string;
  category: string;
}

// ─── Fallback placeholder ─────────────────────────────────────────────────────

const PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='130'%3E" +
  "%3Crect width='200' height='130' fill='%23fdf4f4'/%3E" +
  "%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' " +
  "font-size='40' font-family='serif'%3E%F0%9F%8E%81%3C/text%3E%3C/svg%3E";

const API_BASE = "http://localhost:5000/api";

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", backgroundColor: "#fdf0f0", fontFamily: "'Georgia', 'Times New Roman', serif", display: "flex", flexDirection: "column" },
  banner: { backgroundColor: "#8B1A2F", color: "#fdf0f0", textAlign: "center", padding: "10px 24px", fontSize: "11px", letterSpacing: "0.18em" },
  header: { backgroundColor: "#fdf0f0", borderBottom: "1px solid #e8c8c8", padding: "28px 48px 24px" },
  headerLabel: { fontSize: "10px", letterSpacing: "0.22em", color: "#8B1A2F", textTransform: "uppercase" as const, marginBottom: "6px", display: "flex", alignItems: "center", gap: "8px" },
  headerLabelLine: { width: "28px", height: "1px", backgroundColor: "#8B1A2F", display: "inline-block" },
  headerTitle: { fontSize: "clamp(28px, 4vw, 44px)", color: "#3d1010", fontWeight: "400", margin: "0 0 6px", lineHeight: "1.1" },
  headerTitleAccent: { color: "#8B1A2F", fontStyle: "italic" },
  headerSub: { fontSize: "13px", color: "#a07070", letterSpacing: "0.04em", marginTop: "4px" },
  main: { display: "flex", flex: "1", maxWidth: "1400px", margin: "0 auto", width: "100%", paddingBottom: "60px" },
  leftPanel: { flex: "1", padding: "36px 40px 36px 48px", overflowY: "auto" as const },
  gridHeader: { display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "24px" },
  gridTitle: { fontSize: "11px", letterSpacing: "0.2em", color: "#8B1A2F", textTransform: "uppercase" as const },
  gridCount: { fontSize: "11px", color: "#c09090", letterSpacing: "0.08em" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: "20px" },
  card: { backgroundColor: "#fff", borderRadius: "16px", boxShadow: "0 2px 16px rgba(139,26,47,0.06)", overflow: "hidden", display: "flex", flexDirection: "column" as const, transition: "box-shadow 0.25s ease, transform 0.25s ease", border: "1px solid #f0dada" },
  cardImageBlock: { backgroundColor: "#fdf4f4", height: "130px", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" as const },
  cardTag: { position: "absolute" as const, top: "10px", right: "10px", backgroundColor: "#3d1010", color: "#fff", fontSize: "9px", letterSpacing: "0.12em", padding: "3px 8px", borderRadius: "20px", textTransform: "uppercase" as const },
  cardBody: { padding: "14px 16px 16px", display: "flex", flexDirection: "column" as const, flex: "1" },
  cardCategory: { fontSize: "9px", letterSpacing: "0.18em", color: "#c09090", textTransform: "uppercase" as const, marginBottom: "4px" },
  cardName: { fontSize: "14px", color: "#3d1010", fontWeight: "600", marginBottom: "4px", lineHeight: "1.3" },
  cardFooter: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto" },
  cardPrice: { fontSize: "15px", color: "#8B1A2F", fontWeight: "700" },
  addBtn: { backgroundColor: "#8B1A2F", color: "#fff", border: "none", borderRadius: "8px", padding: "7px 12px", fontSize: "10px", letterSpacing: "0.1em", cursor: "pointer", transition: "background 0.2s ease, transform 0.15s ease", fontFamily: "'Georgia', serif" },
  addBtnAdded: { backgroundColor: "#3d1010", color: "#fce8e8" },
  cardImg: { width: "100%", height: "100%", objectFit: "cover" as const, display: "block" },
  divider: { width: "1px", backgroundColor: "#e8c8c8", flexShrink: 0 },
  rightPanel: { width: "340px", flexShrink: 0, padding: "36px 40px 36px 32px", position: "sticky" as const, top: "0", height: "100vh", overflowY: "auto" as const, display: "flex", flexDirection: "column" as const },
  hamperLabel: { fontSize: "10px", letterSpacing: "0.22em", color: "#c09090", textTransform: "uppercase" as const, marginBottom: "4px" },
  hamperTitle: { fontSize: "26px", color: "#3d1010", fontWeight: "400", margin: "0 0 16px", lineHeight: "1.2" },
  hamperTitleAccent: { color: "#8B1A2F", fontStyle: "italic" },
  hamperDivider: { height: "1px", backgroundColor: "#e8c8c8", marginBottom: "16px" },
  syncBar: { display: "flex", alignItems: "center", gap: "6px", fontSize: "10px", letterSpacing: "0.1em", marginBottom: "12px", minHeight: "16px", transition: "opacity 0.3s" },
  syncDot: { width: "6px", height: "6px", borderRadius: "50%", flexShrink: 0 },
  emptyState: { flex: "1", display: "flex", flexDirection: "column" as const, alignItems: "center", justifyContent: "center", textAlign: "center" as const, padding: "40px 20px", color: "#c09090" },
  emptyEmoji: { fontSize: "48px", marginBottom: "12px", opacity: 0.6 },
  emptyText: { fontSize: "13px", lineHeight: "1.7", color: "#c09090" },
  itemList: { flex: "1", overflowY: "auto" as const, display: "flex", flexDirection: "column" as const },
  itemRow: { display: "flex", alignItems: "center", gap: "12px", padding: "12px 0", borderBottom: "1px solid #f0dada" },
  itemThumb: { flexShrink: 0, width: "38px", height: "38px", borderRadius: "10px", overflow: "hidden", backgroundColor: "#fdf4f4" },
  itemThumbImg: { width: "100%", height: "100%", objectFit: "cover" as const, display: "block" },
  itemInfo: { flex: "1", minWidth: 0 },
  itemName: { fontSize: "12px", color: "#3d1010", fontWeight: "600", whiteSpace: "nowrap" as const, overflow: "hidden", textOverflow: "ellipsis", marginBottom: "2px" },
  itemCategory: { fontSize: "9px", color: "#c09090", letterSpacing: "0.1em", textTransform: "uppercase" as const },
  qtyRow: { display: "flex", alignItems: "center", gap: "6px", marginTop: "5px" },
  qtyBtn: { width: "20px", height: "20px", borderRadius: "50%", border: "1px solid #e0b8b8", backgroundColor: "transparent", color: "#8B1A2F", fontSize: "14px", lineHeight: "1", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: "0", transition: "background 0.15s" },
  qtyNum: { fontSize: "12px", color: "#3d1010", width: "16px", textAlign: "center" as const, fontWeight: "700" },
  itemRight: { display: "flex", flexDirection: "column" as const, alignItems: "flex-end", gap: "4px", flexShrink: 0 },
  itemPrice: { fontSize: "13px", color: "#8B1A2F", fontWeight: "700" },
  removeBtn: { background: "none", border: "none", color: "#d4a0a0", cursor: "pointer", fontSize: "11px", padding: "0", lineHeight: "1", transition: "color 0.15s" },
  summaryBox: { backgroundColor: "#fff", borderRadius: "14px", border: "1px solid #e8c8c8", padding: "18px", marginTop: "20px" },
  summaryRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" },
  summaryLabel: { fontSize: "10px", color: "#c09090", letterSpacing: "0.1em", textTransform: "uppercase" as const },
  summaryValue: { fontSize: "11px", color: "#a07070" },
  totalDivider: { height: "1px", backgroundColor: "#f0dada", margin: "12px 0" },
  totalRow: { display: "flex", justifyContent: "space-between", alignItems: "baseline" },
  totalLabel: { fontSize: "11px", letterSpacing: "0.16em", color: "#3d1010", textTransform: "uppercase" as const, fontWeight: "600" },
  totalPrice: { fontSize: "22px", color: "#8B1A2F", fontWeight: "700" },
  checkoutBtn: { width: "100%", marginTop: "14px", backgroundColor: "#8B1A2F", color: "#fff", border: "none", borderRadius: "10px", padding: "13px 20px", fontSize: "10px", letterSpacing: "0.18em", textTransform: "uppercase" as const, cursor: "pointer", fontFamily: "'Georgia', serif", transition: "background 0.2s ease" },
  clearBtn: { width: "100%", marginTop: "9px", backgroundColor: "transparent", color: "#c09090", border: "1px solid #e8c8c8", borderRadius: "10px", padding: "10px 20px", fontSize: "10px", letterSpacing: "0.16em", textTransform: "uppercase" as const, cursor: "pointer", fontFamily: "'Georgia', serif", transition: "border-color 0.2s, color 0.2s" },
  skeletonCard: { backgroundColor: "#fff", borderRadius: "16px", border: "1px solid #f0dada", overflow: "hidden" },
  skeletonImg: { height: "130px", backgroundColor: "#fceaea" },
  skeletonBody: { padding: "14px 16px 16px" },
  skeletonLine: { borderRadius: "6px", backgroundColor: "#fceaea", marginBottom: "8px" },
  errorBox: { display: "flex", flexDirection: "column" as const, alignItems: "center", justifyContent: "center", gap: "12px", padding: "60px 20px", textAlign: "center" as const },
  errorEmoji: { fontSize: "40px" },
  errorText: { fontSize: "13px", color: "#b07070", lineHeight: "1.6" },
  retryBtn: { backgroundColor: "transparent", border: "1px solid #d4839a", color: "#8B1A2F", borderRadius: "8px", padding: "8px 20px", fontSize: "10px", letterSpacing: "0.14em", textTransform: "uppercase" as const, cursor: "pointer", fontFamily: "'Georgia', serif" },
};

// ─── Skeleton card ────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div style={styles.skeletonCard}>
      <div style={{ ...styles.skeletonImg, animation: "shimmer 1.4s infinite" }} />
      <div style={styles.skeletonBody}>
        <div style={{ ...styles.skeletonLine, height: "9px",  width: "40%", animation: "shimmer 1.4s infinite 0.1s"  }} />
        <div style={{ ...styles.skeletonLine, height: "14px", width: "75%", animation: "shimmer 1.4s infinite 0.15s" }} />
        <div style={{ ...styles.skeletonLine, height: "11px", width: "60%", animation: "shimmer 1.4s infinite 0.2s"  }} />
        <div style={{ height: "14px" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ ...styles.skeletonLine, height: "15px", width: "30%", marginBottom: 0, animation: "shimmer 1.4s infinite 0.25s" }} />
          <div style={{ ...styles.skeletonLine, height: "30px", width: "38%", marginBottom: 0, borderRadius: "8px", animation: "shimmer 1.4s infinite 0.3s" }} />
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HamperPage() {
  // ── Product catalogue (local to this page) ────────────────────────────────
  const [products, setProducts] = useState<Product[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(false);

  // Visual flash only — no state significance
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  // Brief skeleton on right panel while context hook fetches from backend
  const [hamperLoading, setHamperLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setHamperLoading(false), 700);
    return () => clearTimeout(t);
  }, []);

  // ── ALL hamper state from context ─────────────────────────────────────────
  // KEY FIX: previously this page kept a local selectedItems state completely
  // disconnected from HamperContext. The drawer read from context and always
  // saw an empty list. Now both the right panel and the drawer share one store.
  const {
    items,
    syncStatus,
    itemCount,
    subtotal,
    packaging,
    total,
    addItem,
    changeQty,
    removeItem,
    clearHamper,
  } = useHamperContext();

  // ── Fetch product catalogue ───────────────────────────────────────────────

  const fetchProducts = useCallback(() => {
    setLoading(true);
    setError(false);
    fetch(`${API_BASE}/products`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        const raw =
          Array.isArray(data)            ? data          :
          Array.isArray(data?.products)  ? data.products :
          Array.isArray(data?.data)      ? data.data     :
          Array.isArray(data?.results)   ? data.results  :
          Array.isArray(data?.result)    ? data.result   :
          Array.isArray(data?.items)     ? data.items    :
          [];
        setProducts(raw);
        setLoading(false);
      })
      .catch(() => { setError(true); setLoading(false); });
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // ── Add to hamper ─────────────────────────────────────────────────────────

  const handleAdd = (product: Product) => {
    addItem(product);  // updates context → triggers debounced backend save
    setAddedIds((prev) => new Set(prev).add(product._id));
    setTimeout(() => {
      setAddedIds((prev) => { const n = new Set(prev); n.delete(product._id); return n; });
    }, 900);
  };

  // ── Sync badge config ─────────────────────────────────────────────────────

  const syncConfig = {
    idle:   { color: "transparent", label: "" },
    saving: { color: "#c09090",     label: "Saving…" },
    saved:  { color: "#7fba7f",     label: "Hamper saved" },
    error:  { color: "#c0504d",     label: "Save failed — will retry" },
  }[syncStatus];

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <>
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0%,100% { opacity: 1; }
          50%      { opacity: 0.45; }
        }
        .zy-card:hover  { box-shadow: 0 6px 28px rgba(139,26,47,0.13) !important; transform: translateY(-2px); }
        .zy-add:hover   { background-color: #6b1224 !important; }
        .zy-qty:hover   { background-color: #fdf0f0 !important; }
        .zy-rm:hover    { color: #8B1A2F !important; }
        .zy-co:hover    { background-color: #6b1224 !important; }
        .zy-clr:hover   { border-color: #c09090 !important; color: #8B1A2F !important; }
        .zy-retry:hover { background-color: #fdf4f4 !important; }
        .hamper-row     { animation: fadeSlideIn 0.25s ease; }
        ::-webkit-scrollbar       { width: 3px; }
        ::-webkit-scrollbar-thumb { background: #e0b8b8; border-radius: 4px; }
      `}</style>

      <div style={styles.page}>

        {/* Banner */}
        <div style={styles.banner}>
          ✦ &nbsp; FREE DELIVERY ABOVE ₹1,499 &nbsp;·&nbsp; PREMIUM PACKAGING &nbsp;·&nbsp; GIFT WRAPPING AVAILABLE &nbsp; ✦
        </div>

        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerLabel}>
            <span style={styles.headerLabelLine} />
            ZYVORA &nbsp;·&nbsp; GIFTING STUDIO
          </div>
          <h1 style={styles.headerTitle}>
            Build your <span style={styles.headerTitleAccent}>own hamper</span>
          </h1>
          <p style={styles.headerSub}>
            Handpick items that speak to the heart — curated into one beautiful gift.
          </p>
        </div>

        {/* Split layout */}
        <div style={styles.main}>

          {/* ──── LEFT: product grid ──── */}
          <div style={styles.leftPanel}>
            <div style={styles.gridHeader}>
              <span style={styles.gridTitle}>✦ Choose Your Items</span>
              <span style={styles.gridCount}>
                {loading ? "Loading…" : error ? "" : `${products.length} products`}
              </span>
            </div>

            {error && (
              <div style={styles.errorBox}>
                <div style={styles.errorEmoji}>🌸</div>
                <p style={styles.errorText}>
                  Failed to load products.<br />
                  Please check your connection and try again.
                </p>
                <button className="zy-retry" style={styles.retryBtn} onClick={fetchProducts}>
                  Try Again
                </button>
              </div>
            )}

            {loading && (
              <div style={styles.grid}>
                {Array.from({ length: 9 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            )}

            {!loading && !error && (
              <div style={styles.grid}>
                {products.map((product) => {
                  const isAdded  = addedIds.has(product._id);
                  const inHamper = items.find((i) => i._id === product._id); // context items
                  return (
                    <div
                      key={product._id}
                      className="zy-card"
                      style={{
                        ...styles.card,
                        ...(inHamper ? { borderColor: "#d4839a", boxShadow: "0 2px 20px rgba(139,26,47,0.10)" } : {}),
                      }}
                    >
                      <div style={styles.cardImageBlock}>
                        <img
                          src={product.image || PLACEHOLDER}
                          alt={product.name}
                          style={styles.cardImg}
                          onError={(e) => { (e.currentTarget as HTMLImageElement).src = PLACEHOLDER; }}
                        />
                        {inHamper && (
                          <span style={styles.cardTag}>×{inHamper.qty}</span>
                        )}
                      </div>
                      <div style={styles.cardBody}>
                        <div style={styles.cardCategory}>{product.category}</div>
                        <div style={styles.cardName}>{product.name}</div>
                        <div style={{ flex: "1" }} />
                        <div style={styles.cardFooter}>
                          <span style={styles.cardPrice}>
                            ₹{product.price.toLocaleString("en-IN")}
                          </span>
                          <button
                            className="zy-add"
                            style={{ ...styles.addBtn, ...(isAdded ? styles.addBtnAdded : {}) }}
                            onClick={() => handleAdd(product)}
                          >
                            {isAdded ? "✓ Added" : "+ Add to Hamper"}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Divider */}
          <div style={styles.divider} />

          {/* ──── RIGHT: hamper panel ──── */}
          <div style={styles.rightPanel}>
            <div style={styles.hamperLabel}>Your Selection</div>
            <h2 style={styles.hamperTitle}>
              Your <span style={styles.hamperTitleAccent}>Hamper</span>
            </h2>

            {/* Sync badge */}
            <div style={{ ...styles.syncBar, opacity: syncStatus === "idle" ? 0 : 1 }}>
              <span style={{ ...styles.syncDot, backgroundColor: syncConfig.color }} />
              <span style={{ color: syncConfig.color, letterSpacing: "0.1em", fontSize: "10px" }}>
                {syncConfig.label}
              </span>
            </div>

            <div style={styles.hamperDivider} />

            {/* Skeleton while context hook hydrates from backend */}
            {hamperLoading ? (
              <div style={{ paddingTop: "8px" }}>
                {[1, 2, 3].map((i) => (
                  <div key={i} style={{ display: "flex", gap: "12px", padding: "12px 0", borderBottom: "1px solid #f0dada" }}>
                    <div style={{ width: "38px", height: "38px", borderRadius: "10px", backgroundColor: "#fceaea", animation: "shimmer 1.4s infinite", flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ height: "12px", width: "70%", backgroundColor: "#fceaea", borderRadius: "6px", marginBottom: "6px", animation: "shimmer 1.4s infinite" }} />
                      <div style={{ height: "10px", width: "40%", backgroundColor: "#fceaea", borderRadius: "6px", animation: "shimmer 1.4s infinite" }} />
                    </div>
                  </div>
                ))}
              </div>

            ) : items.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={styles.emptyEmoji}>🎁</div>
                <p style={styles.emptyText}>
                  Your hamper is empty.<br />
                  Add items from the left to begin curating your gift.
                </p>
              </div>

            ) : (
              <div style={styles.itemList}>
                {items.map((item) => (
                  <div key={item._id} className="hamper-row" style={styles.itemRow}>
                    <div style={styles.itemThumb}>
                      <img
                        src={item.image || PLACEHOLDER}
                        alt={item.name}
                        style={styles.itemThumbImg}
                        onError={(e) => { (e.currentTarget as HTMLImageElement).src = PLACEHOLDER; }}
                      />
                    </div>
                    <div style={styles.itemInfo}>
                      <div style={styles.itemName}>{item.name}</div>
                      <div style={styles.itemCategory}>{item.category}</div>
                      <div style={styles.qtyRow}>
                        <button className="zy-qty" style={styles.qtyBtn} onClick={() => changeQty(item._id, -1)} aria-label="Decrease">−</button>
                        <span style={styles.qtyNum}>{item.qty}</span>
                        <button className="zy-qty" style={styles.qtyBtn} onClick={() => changeQty(item._id, +1)} aria-label="Increase">+</button>
                      </div>
                    </div>
                    <div style={styles.itemRight}>
                      <span style={styles.itemPrice}>₹{(item.price * item.qty).toLocaleString("en-IN")}</span>
                      <button className="zy-rm" style={styles.removeBtn} onClick={() => removeItem(item._id)} title="Remove">✕</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Summary */}
            {items.length > 0 && !hamperLoading && (
              <div style={styles.summaryBox}>
                <div style={styles.summaryRow}>
                  <span style={styles.summaryLabel}>Items</span>
                  <span style={styles.summaryValue}>{itemCount} selected</span>
                </div>
                <div style={styles.summaryRow}>
                  <span style={styles.summaryLabel}>Subtotal</span>
                  <span style={styles.summaryValue}>₹{subtotal.toLocaleString("en-IN")}</span>
                </div>
                <div style={styles.summaryRow}>
                  <span style={styles.summaryLabel}>Premium Packaging</span>
                  <span style={styles.summaryValue}>₹{packaging.toLocaleString("en-IN")}</span>
                </div>
                <div style={styles.totalDivider} />
                <div style={styles.totalRow}>
                  <span style={styles.totalLabel}>Total</span>
                  <span style={styles.totalPrice}>₹{total.toLocaleString("en-IN")}</span>
                </div>
                <button
                  className="zy-co"
                  style={{ ...styles.checkoutBtn, ...(syncStatus === "saving" ? { opacity: 0.6, cursor: "not-allowed" } : {}) }}
                  disabled={syncStatus === "saving"}
                  onClick={() => { window.location.href = "/checkout?type=hamper"; }}
                >
                  {syncStatus === "saving" ? "Saving…" : "Proceed to Checkout →"}
                </button>
                <button className="zy-clr" style={styles.clearBtn} onClick={clearHamper}>
                  Clear Hamper
                </button>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Floating hamper button + drawer — only on this page */}
      <FloatingHamperButton />
      <HamperDrawer />
    </>
  );
}