"use client";

import React, { createContext, useContext, useSyncExternalStore } from "react";
import { clearSellerToken } from "@/services/sellerApi";

export interface SellerInfo {
  id: string;
  name: string;
  shopName: string;
  isVerified: boolean;
}

interface AuthState {
  token: string | null;
  seller: SellerInfo | null;
}

// ── External store (localStorage) ─────────────────────────────────────────────

const CHANGE_EVENT = "sellerAuthChanged";
const EMPTY_AUTH: AuthState = { token: null, seller: null };

let cachedToken: string | null = null;
let cachedSellerStr: string | null = null;
let cachedSnapshot: AuthState = EMPTY_AUTH;

/** Read current auth state from localStorage */
function readSnapshot(): AuthState {
  const token      = localStorage.getItem("sellerToken");
  const sellerStr  = localStorage.getItem("sellerInfo");
  if (token === cachedToken && sellerStr === cachedSellerStr) {
    return cachedSnapshot;
  }

  cachedToken = token;
  cachedSellerStr = sellerStr;

  if (token && sellerStr) {
    try {
      cachedSnapshot = { token, seller: JSON.parse(sellerStr) as SellerInfo };
      return cachedSnapshot;
    } catch {
      /* corrupted — fall through */
    }
  }
  cachedSnapshot = EMPTY_AUTH;
  return cachedSnapshot;
}

/** SSR snapshot — no localStorage on server */
function serverSnapshot(): AuthState {
  return EMPTY_AUTH;
}

/** Subscribe to same-tab and cross-tab changes */
function subscribe(cb: () => void): () => void {
  window.addEventListener(CHANGE_EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(CHANGE_EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

/** Notify all subscribers (same tab) */
function notifyStore() {
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

// ── Context ───────────────────────────────────────────────────────────────────

interface SellerContextType extends AuthState {
  isLoading: false;
  login: (token: string, seller: SellerInfo) => void;
  logout: () => void;
}

const SellerContext = createContext<SellerContextType | null>(null);

export const SellerProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // useSyncExternalStore — no setState, no useEffect, no linter warning
  const auth = useSyncExternalStore(subscribe, readSnapshot, serverSnapshot);

  const login = (newToken: string, sellerInfo: SellerInfo) => {
    localStorage.setItem("sellerToken", newToken);
    localStorage.setItem("sellerInfo", JSON.stringify(sellerInfo));
    notifyStore();
  };

  const logout = () => {
    clearSellerToken();
    localStorage.removeItem("sellerInfo");
    notifyStore();
    window.location.href = "/login?role=seller";
  };

  return (
    <SellerContext.Provider
      value={{ ...auth, isLoading: false, login, logout }}
    >
      {children}
    </SellerContext.Provider>
  );
};

export const useSeller = (): SellerContextType => {
  const ctx = useContext(SellerContext);
  if (!ctx) throw new Error("useSeller must be used inside <SellerProvider>");
  return ctx;
};
