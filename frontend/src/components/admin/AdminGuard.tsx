"use client";

import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, hydrated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!hydrated) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    if (user.role !== "admin") {
      router.replace("/");
    }
  }, [user, hydrated, router]);

  if (!hydrated || !user || user.role !== "admin") {
    return (
      <p className="p-6 text-sm text-gray-500 text-center">
        Checking access...
      </p>
    );
  }

  return <>{children}</>;
}