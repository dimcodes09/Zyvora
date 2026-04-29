"use client";

import Hero from "@/components/home/Hero";
import Marquee from "@/components/home/Marquee";
import NewArrivals from "@/components/home/NewArrivals";
import FloralStories from "@/components/home/FloralStories";
import Carousel3D from "@/components/home/Carousel3D";
import AIGiftFinder from "@/components/home/AIGiftFinder";
import ARDemo from "@/components/home/ARDemo";
import Categories from "@/components/home/Categories";
import Testimonials from "@/components/home/Testimonials";
import AISearch from "@/components/AISearch";

export default function HomePage() {
  return (
    <main className="bg-[var(--warm-white)]">

      {/* 🔥 IMPORTANT: spacing for fixed navbar */}
      <div className="h-[70px]" />

      {/* HERO */}
      <section>
        <Hero />
      </section>

      {/* MARQUEE */}
      <section>
        <Marquee />
      </section>

      {/* NEW ARRIVALS */}
      <section id="new-arrivals" className="scroll-mt-24">
        <NewArrivals />
      </section>

      {/* FLORAL STORIES */}
      <section id="floral" className="scroll-mt-24">
        <FloralStories />
      </section>

      {/* 3D CAROUSEL */}
      <section className="scroll-mt-24">
        <Carousel3D />
      </section>

      {/* COLLECTIONS */}
            <section id="collections" className="scroll-mt-24">
        <Categories />
      </section>



      {/* AR DEMO */}
      <section id="ar-demo" className="scroll-mt-24">
        <ARDemo />
      </section>

      

      {/* TESTIMONIALS */}
      <section className="scroll-mt-24">
        <Testimonials />
      </section>

        {/* AI SEARCH */}
         <section className="scroll-mt-24">
        <AISearch />
      </section>

    </main>
  );
}