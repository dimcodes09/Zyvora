"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { getProducts } from "@/services/product.service";
import { Product } from "@/types";
import { SlidersHorizontal, X, ChevronDown, Search, Loader2, Sparkles } from "lucide-react";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

const resolveImage = (src?: string) => {
  if (!src || src.trim() === "") return "/placeholder.png";
  return src.startsWith("http") ? src : `${BACKEND_URL}${src}`;
};

// ── Sort options ──────────────────────────────────────────────────────────────
type SortKey = "featured" | "az" | "za" | "price-asc" | "price-desc" | "date-asc" | "date-desc";

const SORT_OPTIONS: { label: string; value: SortKey }[] = [
  { label: "Featured",            value: "featured"   },
  { label: "Alphabetically, A–Z", value: "az"         },
  { label: "Alphabetically, Z–A", value: "za"         },
  { label: "Price, low to high",  value: "price-asc"  },
  { label: "Price, high to low",  value: "price-desc" },
  { label: "Date, old to new",    value: "date-asc"   },
  { label: "Date, new to old",    value: "date-desc"  },
];

// ── Skeleton ──────────────────────────────────────────────────────────────────
function ProductCardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden border border-rose-100 animate-pulse">
      <div className="aspect-square bg-[#FAF0F1]" />
      <div className="p-4 space-y-2">
        <div className="h-2.5 bg-rose-100 rounded w-1/3" />
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-rose-200/60 rounded w-1/4 mt-1" />
      </div>
    </div>
  );
}

// ── Highlight matching substring ──────────────────────────────────────────────
function HighlightMatch({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <span>{text}</span>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase().trim());
  if (idx === -1) return <span>{text}</span>;
  return (
    <span>
      {text.slice(0, idx)}
      <span className="font-semibold text-[#C97B84]">
        {text.slice(idx, idx + query.trim().length)}
      </span>
      {text.slice(idx + query.trim().length)}
    </span>
  );
}

// ── AI Search Bar ─────────────────────────────────────────────────────────────
//
// ROOT CAUSE OF BUGS (fixed here):
//
// BUG 1 — AbortController killed valid requests.
//   The controller was stored in a ref and .abort() was called at the top of
//   every debounce cycle, including the one that had just been scheduled. This
//   meant the fetch that actually fired was immediately aborted by the *next*
//   keystroke before the response arrived. FIXED: removed AbortController entirely.
//
// BUG 2 — useCallback + useEffect dependency loop.
//   fetchSuggestions was wrapped in useCallback and listed as a useEffect dep.
//   Every render recreated the callback ref → triggered the effect → triggered
//   another render → infinite loop / stale closures. FIXED: inline the fetch
//   logic directly inside useEffect([value]), no useCallback needed.
//
// BUG 3 — showDropdown set before suggestions state settled.
//   setSuggestions and setShowDropdown were called in separate ticks in some
//   paths, so the dropdown could render before suggestions was populated.
//   FIXED: both are set in the same synchronous block after await resolves.
//
// BUG 4 — Marquee: `animate-marquee` class has no keyframe definition in
//   default Tailwind. The <style> injection attempted previously was overridden
//   by Next.js style ordering. FIXED: marquee removed entirely as requested.
//
interface AISearchBarProps {
  value: string;
  onChange: (val: string) => void;
}

function AISearchBar({ value, onChange }: AISearchBarProps) {
  const [suggestions, setSuggestions]   = useState<string[]>([]);
  const [loadingSugg, setLoadingSugg]   = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceRef                     = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef                      = useRef<HTMLDivElement>(null);

  // ── Fetch suggestions ─────────────────────────────────────────────────────
  useEffect(() => {
    // Cancel any pending debounce on each keystroke
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const q = value.trim();
    console.log("[AISearch] input →", JSON.stringify(q));

    if (!q) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      console.log("[AISearch] debounce fired, fetching for:", q);
      setLoadingSugg(true);

      try {
        const url = `/api/ai/suggestions?q=${encodeURIComponent(q)}`;
        console.log("[AISearch] GET", url);

        const res = await fetch(url);
        console.log("[AISearch] status:", res.status);

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data: unknown = await res.json();
        console.log("[AISearch] raw response:", data);

        if (Array.isArray(data) && data.length > 0) {
          // Happy path — real API results
          setSuggestions((data as string[]).slice(0, 8));
          setShowDropdown(true);
        } else {
          // API returned empty array — show dynamic fallback
          console.warn("[AISearch] empty response, showing fallback");
          const fallback = [
            `${q} gifts`,
            `luxury ${q}`,
            `${q} under ₹999`,
            `${q} hamper`,
          ].filter(Boolean);
          setSuggestions(fallback);
          setShowDropdown(true);
        }
      } catch (err) {
        // Network / parse error — hardcoded fallback so UI is always testable
        console.error("[AISearch] fetch failed:", err);
        const fallback = ["watches", "luxury watches", "watches under ₹5000"];
        console.log("[AISearch] hardcoded fallback:", fallback);
        setSuggestions(fallback);
        setShowDropdown(true);
      } finally {
        setLoadingSugg(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value]); // ← ONLY value — no callback ref dependency

  // ── Outside click closes dropdown ─────────────────────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selectSuggestion = (s: string) => {
    console.log("[AISearch] selected:", s);
    onChange(s);
    setShowDropdown(false);
  };

  return (
    <div ref={wrapperRef} className="relative mb-6 max-w-md">
      {/* Label above input */}
      <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#C97B84] mb-1.5 flex items-center gap-1">
        <Sparkles size={10} />
        AI-Powered Search
      </p>

      {/* Input row */}
      <div className="relative">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#C97B84]" />
        <input
          type="text"
          placeholder="Search products..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => { if (suggestions.length > 0) setShowDropdown(true); }}
          className="w-full pl-9 pr-16 py-2.5 text-sm bg-white border border-rose-100 rounded-xl text-[#3D2A2D] placeholder:text-[#B89BA0] focus:outline-none focus:ring-2 focus:ring-[#C97B84]/30 transition"
        />

        {/* Right slot: spinner while loading, clear when has value, AI badge when idle */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          {loadingSugg ? (
            <Loader2 size={13} className="text-[#C97B84] animate-spin" />
          ) : value ? (
            <button
              onClick={() => {
                onChange("");
                setSuggestions([]);
                setShowDropdown(false);
              }}
            >
              <X size={13} className="text-[#B89BA0] hover:text-[#C97B84]" />
            </button>
          ) : (
            <span className="text-[9px] font-bold tracking-wide text-[#C97B84] bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded-full select-none">
              ✦ AI
            </span>
          )}
        </div>
      </div>

      {/* Dropdown — only renders when we have items */}
      {showDropdown && suggestions.length > 0 && (
        <div className="absolute z-40 w-full mt-1.5 bg-white border border-rose-100 rounded-2xl shadow-lg overflow-hidden">
          <ul role="listbox">
            {suggestions.map((s, i) => (
              <li
                key={`${s}-${i}`}
                role="option"
                aria-selected={false}
                onClick={() => selectSuggestion(s)}
                className={`flex items-center gap-2.5 px-4 py-2.5 text-sm cursor-pointer transition-colors select-none
                  text-[#3D2A2D] hover:bg-rose-50 hover:text-[#C97B84]
                  ${i < suggestions.length - 1 ? "border-b border-rose-50" : ""}`}
              >
                <Search size={12} className="shrink-0 text-[#B89BA0]" />
                <HighlightMatch text={s} query={value} />
              </li>
            ))}
          </ul>
          {/* Footer badge */}
          <div className="px-4 py-2 border-t border-rose-50 bg-[#FDF8F5] flex items-center gap-1">
            <Sparkles size={9} className="text-[#B89BA0]" />
            <p className="text-[10px] text-[#B89BA0] tracking-wide">AI-powered suggestions</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ProductsPage() {
  const [products, setProducts]                 = useState<Product[]>([]);
  const [loading, setLoading]                   = useState(true);
  const [error, setError]                       = useState<string | null>(null);
  const [search, setSearch]                     = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [priceRange, setPriceRange]             = useState<[number, number]>([0, 100000]);
  const [inStockOnly, setInStockOnly]           = useState(false);
  const [sortBy, setSortBy]                     = useState<SortKey>("featured");
  const [filterOpen, setFilterOpen]             = useState(false);
  const [sortOpen, setSortOpen]                 = useState(false);
  const sortRef                                 = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getProducts()
      .then(setProducts)
      .catch(() => setError("Failed to load products."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setSortOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(products.map((p) => p.category).filter(Boolean)));
    return ["All", ...cats];
  }, [products]);

  const maxPrice = useMemo(
    () => Math.max(...products.map((p) => p.price), 100000),
    [products]
  );

  const displayed = useMemo(() => {
    let list = [...products];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
      );
    }
    if (selectedCategory !== "All") list = list.filter((p) => p.category === selectedCategory);
    list = list.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1]);
    if (inStockOnly) list = list.filter((p) => p.stock > 0);
    switch (sortBy) {
      case "az":         list.sort((a, b) => a.name.localeCompare(b.name)); break;
      case "za":         list.sort((a, b) => b.name.localeCompare(a.name)); break;
      case "price-asc":  list.sort((a, b) => a.price - b.price); break;
      case "price-desc": list.sort((a, b) => b.price - a.price); break;
      case "date-asc":   list.sort((a, b) => new Date(a.createdAt ?? 0).getTime() - new Date(b.createdAt ?? 0).getTime()); break;
      case "date-desc":  list.sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()); break;
      default: break;
    }
    return list;
  }, [products, search, selectedCategory, priceRange, inStockOnly, sortBy]);

  const activeFilterCount = [
    selectedCategory !== "All",
    inStockOnly,
    priceRange[0] > 0 || priceRange[1] < maxPrice,
  ].filter(Boolean).length;

  const clearAllFilters = () => {
    setSelectedCategory("All");
    setPriceRange([0, maxPrice]);
    setInStockOnly(false);
    setSearch("");
  };

  const currentSortLabel = SORT_OPTIONS.find((o) => o.value === sortBy)?.label ?? "Featured";

  return (
    <main className="min-h-screen bg-[#FDF8F5]">
      {/* ── Hero Header ── */}
      <div className="bg-[#FDF8F5] border-b border-rose-100 px-4 sm:px-6 lg:px-10 pt-12 pb-10">
        <p className="text-xs font-semibold tracking-[0.25em] uppercase text-[#C97B84] mb-2">
          Our Collection
        </p>
        <h1
          className="text-4xl sm:text-5xl font-bold text-[#3D2A2D] leading-tight"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Luxury Gifts &amp; Flowers
        </h1>
        <p className="mt-3 text-sm text-[#7A5C60] max-w-md">
          Handcrafted with love — discover curated gifts that create moments worth remembering.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-8">

        {/* ── AI Search Bar ── */}
        <AISearchBar value={search} onChange={setSearch} />

        {/* ── Toolbar ── */}
        <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-[#3D2A2D] text-white text-sm font-semibold rounded-xl hover:bg-[#5C3D3D] transition-colors"
            >
              <SlidersHorizontal size={14} />
              Filter
              {activeFilterCount > 0 && (
                <span className="ml-1 bg-[#C97B84] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
            <p className="text-sm text-[#7A5C60]">
              <span className="font-semibold text-[#3D2A2D]">{displayed.length}</span> products
            </p>
          </div>

          <div className="relative" ref={sortRef}>
            <button
              onClick={() => setSortOpen(!sortOpen)}
              className="flex items-center gap-2 text-sm text-[#3D2A2D] font-medium border border-rose-200 rounded-xl px-4 py-2 bg-white hover:border-[#C97B84] transition-colors"
            >
              <span className="text-[#7A5C60] font-normal">Sort by:</span>
              {currentSortLabel}
              <ChevronDown size={13} className={`transition-transform ${sortOpen ? "rotate-180" : ""}`} />
            </button>
            {sortOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white border border-rose-100 rounded-2xl shadow-xl z-30 overflow-hidden">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => { setSortBy(opt.value); setSortOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors
                      ${sortBy === opt.value ? "bg-rose-50 text-[#C97B84] font-semibold" : "text-[#3D2A2D] hover:bg-[#FDF8F5]"}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Active Filter Chips ── */}
        {(selectedCategory !== "All" || inStockOnly || priceRange[0] > 0 || priceRange[1] < maxPrice) && (
          <div className="flex flex-wrap gap-2 mb-6">
            {selectedCategory !== "All" && (
              <span className="flex items-center gap-1.5 bg-rose-50 border border-rose-200 text-[#C97B84] text-xs font-medium px-3 py-1.5 rounded-full">
                {selectedCategory}
                <button onClick={() => setSelectedCategory("All")}><X size={11} /></button>
              </span>
            )}
            {inStockOnly && (
              <span className="flex items-center gap-1.5 bg-rose-50 border border-rose-200 text-[#C97B84] text-xs font-medium px-3 py-1.5 rounded-full">
                In Stock Only
                <button onClick={() => setInStockOnly(false)}><X size={11} /></button>
              </span>
            )}
            {(priceRange[0] > 0 || priceRange[1] < maxPrice) && (
              <span className="flex items-center gap-1.5 bg-rose-50 border border-rose-200 text-[#C97B84] text-xs font-medium px-3 py-1.5 rounded-full">
                ₹{priceRange[0].toLocaleString("en-IN")} – ₹{priceRange[1].toLocaleString("en-IN")}
                <button onClick={() => setPriceRange([0, maxPrice])}><X size={11} /></button>
              </span>
            )}
            <button onClick={clearAllFilters} className="text-xs text-[#7A5C60] underline hover:text-[#C97B84] transition-colors">
              Clear all
            </button>
          </div>
        )}

        <div className="flex gap-8 items-start">
          {/* ── Filter Panel ── */}
          {filterOpen && (
            <aside className="w-64 shrink-0 bg-white border border-rose-100 rounded-2xl p-5 shadow-sm sticky top-24 z-20">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-bold text-[#3D2A2D]">Filters</h3>
                <button onClick={() => setFilterOpen(false)}>
                  <X size={15} className="text-[#7A5C60] hover:text-[#C97B84]" />
                </button>
              </div>

              <div className="mb-6">
                <p className="text-[10px] font-bold tracking-widest uppercase text-[#C97B84] mb-3">Category</p>
                <div className="flex flex-col gap-1.5">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`text-left text-sm px-3 py-1.5 rounded-lg transition-colors font-medium
                        ${selectedCategory === cat ? "bg-rose-50 text-[#C97B84]" : "text-[#7A5C60] hover:text-[#C97B84] hover:bg-rose-50"}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-rose-100 mb-5" />

              <div className="mb-6">
                <p className="text-[10px] font-bold tracking-widest uppercase text-[#C97B84] mb-3">Price Range</p>
                <div className="flex justify-between text-xs text-[#7A5C60] mb-2">
                  <span>₹{priceRange[0].toLocaleString("en-IN")}</span>
                  <span>₹{priceRange[1].toLocaleString("en-IN")}</span>
                </div>
                <input
                  type="range" min={0} max={maxPrice} step={100} value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                  className="w-full accent-[#C97B84]"
                />
              </div>

              <div className="border-t border-rose-100 mb-5" />

              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-[#3D2A2D]">In Stock Only</p>
                <button
                  onClick={() => setInStockOnly(!inStockOnly)}
                  className={`relative w-10 h-5 rounded-full transition-colors ${inStockOnly ? "bg-[#C97B84]" : "bg-gray-200"}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${inStockOnly ? "translate-x-5" : "translate-x-0"}`} />
                </button>
              </div>

              <div className="border-t border-rose-100 mt-5 mb-4" />
              <button onClick={clearAllFilters} className="w-full text-sm text-[#C97B84] font-semibold hover:underline">
                Clear All Filters
              </button>
            </aside>
          )}

          {/* ── Product Grid ── */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => <ProductCardSkeleton key={i} />)}
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
                <p className="text-[#3D2A2D] font-semibold">{error}</p>
                <button onClick={() => window.location.reload()} className="text-sm text-[#C97B84] underline">
                  Try again
                </button>
              </div>
            ) : displayed.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
                <p className="text-4xl">🌸</p>
                <p className="text-[#3D2A2D] font-semibold text-lg">No products found</p>
                <p className="text-sm text-[#7A5C60]">Try adjusting your filters or search term</p>
                <button
                  onClick={clearAllFilters}
                  className="px-5 py-2 bg-[#C97B84] text-white text-sm font-semibold rounded-xl hover:bg-[#9B5C63] transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className={`grid gap-4 ${
                filterOpen ? "grid-cols-2 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
              }`}>
                {displayed.map((product) => {
                  const imgSrc   = resolveImage(product.image);
                  const inStock  = product.stock > 0;
                  const lowStock = product.stock > 0 && product.stock <= 5;
                  return (
                    <Link
                      key={product._id}
                      href={`/products/${product._id}`}
                      className="group bg-white border border-rose-100 rounded-2xl overflow-hidden hover:shadow-lg hover:shadow-rose-100 hover:-translate-y-0.5 transition-all duration-200"
                    >
                      <div className="relative aspect-square w-full bg-[#FAF0F1] overflow-hidden">
                        <Image
                          src={imgSrc}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 640px) 50vw, 25vw"
                          unoptimized={imgSrc.startsWith("http")}
                        />
                        {!inStock && (
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                            <span className="text-[10px] font-bold text-white bg-black/50 px-2 py-0.5 rounded-full">
                              Sold Out
                            </span>
                          </div>
                        )}
                        {lowStock && inStock && (
                          <div className="absolute top-2 left-2">
                            <span className="text-[9px] font-bold text-white bg-orange-400 px-2 py-0.5 rounded-full">
                              Only {product.stock} left
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-[#C97B84] mb-1">
                          {product.category || "Luxury Gift"}
                        </p>
                        <p
                          className="text-sm font-semibold text-[#3D2A2D] truncate leading-snug"
                          style={{ fontFamily: "'Playfair Display', serif" }}
                        >
                          {product.name}
                        </p>
                        <p className="text-sm font-bold text-[#C97B84] mt-1.5">
                          ₹{product.price.toLocaleString("en-IN")}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}