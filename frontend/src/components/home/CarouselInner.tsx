"use client";

import { useState, useEffect } from "react";

const items = [
  { emoji:"💐", label:"Rose Bouquet",   sub:"Limited Edition", price:"₹1,299", bg:"linear-gradient(135deg,#FDE8EA,#F5DDE0)" },
  { emoji:"👜", label:"Mauve Bag",      sub:"New Arrival",     price:"₹5,500", bg:"linear-gradient(135deg,#F5DDE0,#E8C4C8)" },
  { emoji:"🕯️", label:"Rose Candle",    sub:"Bestseller",      price:"₹899",   bg:"linear-gradient(135deg,#FDF8F0,#F5E8D0)" },
  { emoji:"💎", label:"Pearl Earrings", sub:"Trending",        price:"₹2,200", bg:"linear-gradient(135deg,#F0F4F8,#E0ECF8)" },
  { emoji:"🍫", label:"Truffle Box",    sub:"Seasonal",        price:"₹699",   bg:"linear-gradient(135deg,#F8EEE0,#EEDDC0)" },
];

const STEP = 360 / items.length;
const R = 280;

export default function CarouselInner() {
  const [cur, setCur] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setCur((c) => (c + 1) % items.length), 3500);
    return () => clearInterval(t);
  }, []);

  return (
    <section style={{ padding:"6rem 4rem",overflow:"hidden",background:"var(--warm-white)" }}>
      <div style={{ maxWidth:1200,margin:"0 auto" }}>

        {/* HEADER */}
        <div style={{ textAlign:"center",marginBottom:"3rem" }}>
          <h2 style={{ fontSize:"2.2rem",fontWeight:700 }}>
            Most Loved <span style={{ color:"var(--rose)" }}>Gifts</span>
          </h2>
        </div>

        {/* CAROUSEL */}
        <div style={{ position:"relative",height:360,perspective:"1200px" }}>
          <div
            style={{
              position:"absolute",
              width:"100%",
              height:"100%",
              transformStyle:"preserve-3d",
            }}
          >
            {items.map((item,i) => {

              // ✅ FIX: rotation applied here ONLY
              const angle = ((i - cur) * STEP * Math.PI) / 180;

              const x = Math.sin(angle) * R;
              const z = Math.cos(angle) * R;

              return (
                <div
                  key={i}
                  onClick={() => setCur(i)}
                  style={{
                    position:"absolute",
                    width:240,
                    height:300,
                    left:"50%",
                    top:"50%",

                    // ✅ PERFECT POSITIONING
                    transform: `
                      translate(-50%, -50%)
                      translateX(${x}px)
                      translateZ(${z}px)
                      scale(${(z + R) / (2 * R)})
                    `,

                    zIndex: Math.round(z),

                    borderRadius:20,
                    overflow:"hidden",
                    cursor:"pointer",
                    border:"1px solid rgba(201,123,132,0.15)",
                    transition:"all 0.6s ease",
                  }}
                >
                  <div
                    style={{
                      width:"100%",
                      height:"100%",
                      background:item.bg,
                      display:"flex",
                      flexDirection:"column",
                      alignItems:"center",
                      justifyContent:"center"
                    }}
                  >
                    <span style={{ fontSize:"4rem" }}>
                      {item.emoji}
                    </span>

                    <p style={{ fontWeight:600,marginTop:"1rem" }}>
                      {item.label}
                    </p>

                    <p style={{ fontSize:"0.75rem",opacity:0.6 }}>
                      {item.sub}
                    </p>

                    <p style={{ fontWeight:600,color:"var(--rose)" }}>
                      {item.price}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CONTROLS */}
        <div style={{ display:"flex",justifyContent:"center",alignItems:"center",gap:"1rem",marginTop:"2rem" }}>
          <button onClick={() => setCur(c => (c-1+items.length)%items.length)}>←</button>

          {items.map((_,i) => (
            <span key={i} onClick={() => setCur(i)} style={{ cursor:"pointer" }}>
              {i === cur ? "●" : "○"}
            </span>
          ))}

          <button onClick={() => setCur(c => (c+1)%items.length)}>→</button>
        </div>

      </div>
    </section>
  );
}