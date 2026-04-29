"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/auth.store";
import { useCartStore } from "@/store/cart.store";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const fetchMe = useAuthStore((s) => s.fetchMe);
  const hydrated = useAuthStore((s) => s.hydrated);
  const user = useAuthStore((s) => s.user);

  const fetchCart = useCartStore((s) => s.fetchCart);

  // 🔥 ALWAYS try to restore session
  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  // 🔥 Load cart AFTER user is ready
  useEffect(() => {
    if (user) {
      fetchCart();
    }
  }, [user, fetchCart]);

  // ⛔ prevent UI flicker / broken state
  if (!hydrated) return null;

  return <>{children}</>;
}