import { Suspense } from "react";
import ZyvoraAuthPanel from "@/components/auth/ZyvoraAuthPanel";

export default function RegisterPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#FDF8F5]" />}>
      <ZyvoraAuthPanel mode="register" />
    </Suspense>
  );
}
