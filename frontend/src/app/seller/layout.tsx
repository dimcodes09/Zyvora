"use client";

import React from "react";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { SellerProvider, useSeller } from "@/context/SellerContext";

const SELLER_LOGIN_PATH = "/login?role=seller";

function SellerAuthGuard({ children }: { children: React.ReactNode }) {
  const { seller } = useSeller();
  const router     = useRouter();
  const pathname   = usePathname();

  useEffect(() => {
    if (!seller) {
      router.replace(SELLER_LOGIN_PATH);
    }
  }, [seller, pathname, router]);

  if (!seller) return null;

  return <>{children}</>;
}

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  return (
    <SellerProvider>
      <SellerAuthGuard>{children}</SellerAuthGuard>
    </SellerProvider>
  );
}
