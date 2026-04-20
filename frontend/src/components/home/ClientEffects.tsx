"use client";

import { useEffect, useRef } from "react";

export default function ClientEffects() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener("resize", resize);

    type Sparkle = {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      alpha: number;
      color: string;
      type: "star" | "dot";
    };

    const sparkles: Sparkle[] = [];
    const colors = [
      "#C97B84",
      "#E8B4BA",
      "#F5DDE0",
      "#C4A882",
      "#D4959C",
      "#ffffff",
    ];

    let lastSparkle = 0;

    const createSparkle = (x: number, y: number, count = 4) => {
      for (let i = 0; i < count; i++) {
        sparkles.push({
          x,
          y,
          vx: (Math.random() - 0.5) * 3,
          vy: (Math.random() - 0.5) * 3 - 1,
          size: Math.random() * 3 + 1,
          alpha: 1,
          color: colors[Math.floor(Math.random() * colors.length)],
          type: Math.random() > 0.5 ? "star" : "dot",
        });
      }
    };

    const onMove = (e: MouseEvent) => {
      const now = Date.now();
      if (now - lastSparkle > 60) {
        createSparkle(e.clientX, e.clientY, 2);
        lastSparkle = now;
      }
    };

    const onClick = (e: MouseEvent) => {
      createSparkle(e.clientX, e.clientY, 10);
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("click", onClick);

    // LIGHT BACKGROUND SPARKLES (optimized)
    const autoInt = setInterval(() => {
      createSparkle(
        Math.random() * window.innerWidth,
        Math.random() * window.innerHeight,
        2
      );
    }, 800);

    const drawStar = (
      x: number,
      y: number,
      r: number,
      color: string,
      alpha: number
    ) => {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = color;
      ctx.beginPath();

      for (let i = 0; i < 4; i++) {
        const a = (i * Math.PI) / 2;
        if (i === 0) {
          ctx.moveTo(x + r * Math.cos(a), y + r * Math.sin(a));
        } else {
          ctx.lineTo(x + r * Math.cos(a), y + r * Math.sin(a));
        }
        const ia = a + Math.PI / 4;
        ctx.lineTo(
          x + r * 0.4 * Math.cos(ia),
          y + r * 0.4 * Math.sin(ia)
        );
      }

      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    let animId: number;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = sparkles.length - 1; i >= 0; i--) {
        const s = sparkles[i];

        s.x += s.vx;
        s.y += s.vy;
        s.vy += 0.05;
        s.alpha -= 0.02;

        if (s.alpha <= 0) {
          sparkles.splice(i, 1);
          continue;
        }

        if (s.type === "star") {
          drawStar(s.x, s.y, s.size + 1, s.color, s.alpha);
        } else {
          ctx.save();
          ctx.globalAlpha = s.alpha;
          ctx.fillStyle = s.color;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      animId = requestAnimationFrame(animate);
    };

    animate();

    // ✅ SCROLL REVEAL (clean)
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

    return () => {
      window.removeEventListener("resize", resize);
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("click", onClick);
      clearInterval(autoInt);
      cancelAnimationFrame(animId);
      observer.disconnect();
    };
  }, []);

  return (
    <>
      {/* ✅ FIXED CANVAS (no UI blocking) */}
      <canvas
        ref={canvasRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />
    </>
  );
}