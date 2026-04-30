import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AuthProvider from "@/components/AuthProvider";
import ClientEffects from "@/components/home/ClientEffects";
import FloatingChat from "@/components/FloatingChat";
import { HamperProvider } from "@/context/HamperContext";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Zyvora — Your Choice",
  description: "Premium Gift Curation",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
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

            {/* Floating AI chat (bottom-right, z-9999) */}
            <FloatingChat />
          </HamperProvider>
        </AuthProvider>

      </body>
    </html>
  );
}