"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const check = async () => {
      try {
        const { data } = await api.get("/auth/me");
        if (data?.data?.role === "admin") {
          setAuthorized(true);
        } else {
          router.replace("/");
        }
      } catch {
        router.replace("/");
      }
    };
    check();
  }, []);

  if (!authorized) return null; // or a spinner

  return <>{children}</>;
}