import type { Metadata } from "next";
import "./globals.css";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AuthProvider from "@/components/AuthProvider";
import ClientEffects from "@/components/home/ClientEffects";
import FloatingChat from "@/components/FloatingChat";
import { HamperProvider } from "@/context/HamperContext";
import GamificationCard from '@/components/GamificationCard';
import GoogleAuthWrapper from "@/components/GoogleAuthWrapper";


export const metadata: Metadata = {
  title: "Zyvora — Your Choice",
  description: "Premium Gift Curation",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased" data-scroll-behavior="smooth" suppressHydrationWarning>
      {/* Blocking inline script — prevents flash of wrong theme */}
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var stored = localStorage.getItem('zyvora-theme');
                if (stored === 'dark') document.documentElement.classList.add('dark');
              } catch(e) {}
            `,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-brand-lightBg dark:bg-brand-darkBg text-brand-lightText dark:text-brand-darkText transition-colors duration-300">

        <ClientEffects />

        <GoogleAuthWrapper>
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
        </GoogleAuthWrapper>

      </body>
    </html>
  );
}
