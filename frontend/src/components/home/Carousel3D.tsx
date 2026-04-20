"use client";

import dynamic from "next/dynamic";

// 🚨 disable SSR completely
const CarouselInner = dynamic(() => import("./CarouselInner"), {
  ssr: false,
});

export default function Carousel3D() {
  return <CarouselInner />;
}