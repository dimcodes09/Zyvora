"use client";

import { useEffect } from "react";
import Cookies from "js-cookie";
import { useAuthStore } from "@/store/auth.store";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const fetchMe = useAuthStore((s) => s.fetchMe);

  useEffect(() => {
    const token = Cookies.get("token");

    // ✅ ONLY CALL IF TOKEN EXISTS
    if (token) {
      fetchMe();
    }
  }, []);

  return <>{children}</>;
}