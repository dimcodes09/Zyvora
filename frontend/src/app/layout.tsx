import type { Metadata } from "next";
import "./globals.css";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AuthProvider from "@/components/AuthProvider";
import ClientEffects from "@/components/home/ClientEffects";
import FloatingChat from "@/components/FloatingChat";
import { HamperProvider } from "@/context/HamperContext";
import GamificationCard from '@/components/GamificationCard';


export const metadata: Metadata = {
  title: "Zyvora — Your Choice",
  description: "Premium Gift Curation",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-screen flex flex-col bg-white text-gray-900">

        <ClientEffects />

        <AuthProvider>
          {/*
           * HamperProvider wraps everything so ANY product card in the tree
           * can call: const { addItem } = useHamperContext()
           */}
          <HamperProvider>
            <Navbar />

            <main className="flex-1">
              {children}
            </main>

            <Footer />

            {/* Floating overlays */}
            <GamificationCard />
            <FloatingChat />
          </HamperProvider>
        </AuthProvider>

      </body>
    </html>
  );
}
