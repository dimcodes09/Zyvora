"use client";

// context/HamperContext.tsx
// Single source of truth — wrap your layout with <HamperProvider>
// Product cards call: const { addItem } = useHamperContext()

import { createContext, useContext, useState, type ReactNode } from "react";
import { useHamper, type HamperItem, type Product } from "@/hooks/useHamper";

// ── Types ─────────────────────────────────────────────────────────────────────

interface HamperContextValue {
  // Drawer open/close
  isOpen:    boolean;
  openHamper:  () => void;
  closeHamper: () => void;
  // Forwarded from useHamper
  items:       HamperItem[];
  syncStatus:  "idle" | "saving" | "saved" | "error";
  itemCount:   number;
  subtotal:    number;
  packaging:   number;
  total:       number;
  addItem:     (product: Product) => void;
  changeQty:   (id: string, delta: number) => void;
  removeItem:  (id: string) => void;
  clearHamper: () => void;
}

// ── Context ───────────────────────────────────────────────────────────────────

const HamperContext = createContext<HamperContextValue | null>(null);

// ── Provider ──────────────────────────────────────────────────────────────────

export function HamperProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const hamper = useHamper();

  return (
    <HamperContext.Provider
      value={{
        isOpen,
        openHamper:  () => setIsOpen(true),
        closeHamper: () => setIsOpen(false),
        ...hamper,
      }}
    >
      {children}
    </HamperContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useHamperContext() {
  const ctx = useContext(HamperContext);
  if (!ctx) throw new Error("useHamperContext must be used inside <HamperProvider>");
  return ctx;
}