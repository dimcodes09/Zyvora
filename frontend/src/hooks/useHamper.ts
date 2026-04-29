// hooks/useHamper.ts
// ─── All hamper state + debounced backend sync in one hook ────────────────────
import { useState, useEffect, useCallback, useRef } from "react";
import { fetchHamper, saveHamper } from "@/lib/hamperApi";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Product {
  _id:      string;
  name:     string;
  price:    number;
  image:    string;
  category: string;
}

export interface HamperItem extends Product {
  qty: number;
}

type SyncStatus = "idle" | "saving" | "saved" | "error";

// ── Debounce delay (ms) ───────────────────────────────────────────────────────
const DEBOUNCE_MS = 800;

// ─────────────────────────────────────────────────────────────────────────────

export function useHamper() {
  const [items,      setItems]      = useState<HamperItem[]>([]);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle");

  // Track whether the initial load has completed so we don't
  // fire a save() call for the load itself.
  const initialised = useRef(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Load hamper on mount ──────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const { data } = await fetchHamper();

        if (cancelled) return;

        // The API returns { productId: { _id, name, … }, quantity }
        // Map that back to the flat HamperItem shape used in the UI.
        const mapped: HamperItem[] = (data.items || []).map((entry: any) => {
          const p = entry.productId; // populated product object
          return {
            _id:      p._id,
            name:     p.name,
            price:    p.price,
            image:    p.image,
            category: p.category,
            qty:      entry.quantity,
          };
        });

        setItems(mapped);
      } catch (err) {
        // If fetch fails (e.g. user not logged in yet), start with empty hamper
        console.warn("[useHamper] Could not load hamper:", err);
      } finally {
        if (!cancelled) initialised.current = true;
      }
    };

    load();
    return () => { cancelled = true; };
  }, []);

  // ── Debounced sync to backend whenever items change ───────────────────────
  useEffect(() => {
    // Skip the sync triggered by the initial load
    if (!initialised.current) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);

    setSyncStatus("saving");

    debounceRef.current = setTimeout(async () => {
      try {
        await saveHamper(
          items.map((i) => ({ productId: i._id, quantity: i.qty }))
        );
        setSyncStatus("saved");
        // Reset to idle after a short moment so UI can show "Saved ✓"
        setTimeout(() => setSyncStatus("idle"), 1500);
      } catch (err) {
        console.error("[useHamper] Save failed:", err);
        setSyncStatus("error");
      }
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [items]);

  // ── Actions ───────────────────────────────────────────────────────────────

  const addItem = useCallback((product: Product) => {
    setItems((prev) => {
      const existing = prev.find((i) => i._id === product._id);
      if (existing) {
        return prev.map((i) =>
          i._id === product._id ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
  }, []);

  const changeQty = useCallback((id: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((i) => (i._id === id ? { ...i, qty: i.qty + delta } : i))
        .filter((i) => i.qty > 0)
    );
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i._id !== id));
  }, []);

  const clearHamper = useCallback(() => setItems([]), []);

  // ── Derived values ────────────────────────────────────────────────────────

  const itemCount = items.reduce((s, i) => s + i.qty, 0);
  const subtotal  = items.reduce((s, i) => s + i.price * i.qty, 0);
  const packaging = itemCount > 0 ? 199 : 0;
  const total     = subtotal + packaging;

  return {
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
  };
}