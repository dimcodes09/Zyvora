import { useState, useEffect, useCallback, useRef } from "react";
import { fetchHamper, saveHamper } from "@/lib/hamperApi";

export interface Product {
  _id: string;
  name: string;
  price: number;
  image: string;
  category: string;
}

export interface HamperItem extends Product {
  qty: number;
}

type SyncStatus = "idle" | "saving" | "saved" | "error";

const DEBOUNCE_MS = 800;

export function useHamper() {
  const [items, setItems]         = useState<HamperItem[]>([]);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle");

  // Track whether the initial load has completed
  // Use state (not just ref) so the sync effect re-runs after load finishes
  const [loaded, setLoaded]       = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Load hamper on mount ─────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const result = await fetchHamper();
        if (cancelled) return;
        if (!result) {
          // Guest user — nothing to load, mark as loaded anyway
          setLoaded(true);
          return;
        }

        const mapped: HamperItem[] = (result.data.items || [])
          // Skip items where productId wasn't populated (deleted products)
          .filter((entry: any) => entry.productId && typeof entry.productId === "object")
          .map((entry: any) => {
            const p = entry.productId;
            return {
              _id:      p._id,
              name:     p.name,
              price:    p.price,
              image:    p.image,
              category: p.category,
              qty:      entry.quantity,
            };
          });

        if (!cancelled) {
          setItems(mapped);
          setLoaded(true);
        }
      } catch (err) {
        console.warn("[useHamper] Could not load hamper:", err);
        if (!cancelled) setLoaded(true); // still mark loaded so saves work
      }
    };

    load();
    return () => { cancelled = true; };
  }, []);

  // ── Debounced sync — runs whenever items changes AFTER initial load ──
  useEffect(() => {
    // Don't sync until the initial fetch has completed
    if (!loaded) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);

    setSyncStatus("saving");

    debounceRef.current = setTimeout(async () => {
      try {
        const payload = items.map((i) => ({ productId: i._id, quantity: i.qty }));
        const res = await saveHamper(payload);

        if (!res) {
          // Guest — token absent, nothing to save
          setSyncStatus("idle");
          return;
        }

        setSyncStatus("saved");
        setTimeout(() => setSyncStatus("idle"), 1500);
      } catch (err) {
        console.error("[useHamper] Save failed:", err);
        setSyncStatus("error");
      }
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, loaded]);

  // ── Actions ─────────────────────────────────────────────────
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

  // ── Derived ─────────────────────────────────────────────────
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