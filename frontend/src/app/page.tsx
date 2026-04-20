import Hero          from "@/components/home/Hero";
import Marquee       from "@/components/home/Marquee";
import NewArrivals   from "@/components/home/NewArrivals";
import FloralStories from "@/components/home/FloralStories";
import Carousel3D    from "@/components/home/Carousel3D";
import AIGiftFinder  from "@/components/home/AIGiftFinder";
import ARDemo        from "@/components/home/ARDemo";
import Categories    from "@/components/home/Categories";
import Testimonials  from "@/components/home/Testimonials";

export default function HomePage() {
  return (
    <main className="bg-[var(--warm-white)]">

      <Hero />

      <Marquee />

      <NewArrivals />

      <FloralStories />

      <Carousel3D />

      <AIGiftFinder />

      <ARDemo />

      <Categories />

      <Testimonials />

    </main>
  );
}