import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AuthProvider from "@/components/AuthProvider";
import ClientEffects from "@/components/home/ClientEffects";
import FloatingChat from "@/components/FloatingChat"; // ← new

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Zyvora — Your Choice",
  description: "Premium Gift Curation",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-screen flex flex-col bg-white text-gray-900">

        {/* ✅ GLOBAL CLIENT EFFECTS (GSAP / cursor / etc) */}
        <ClientEffects />

        <AuthProvider>
          <Navbar />

          {/* ✅ IMPORTANT: main + flex-1 */}
          <main className="flex-1">
            {children}
          </main>

          <Footer />

          {/* ✅ FLOATING AI CHAT — always visible, every page */}
          <FloatingChat />
        </AuthProvider>

      </body>
    </html>
  );
}