const florals = [
  {
    tag: "Romantic",
    name: "Crimson Romance\nBouquet",
    price: "From ₹1,299",
    bg: "linear-gradient(145deg,#d4828c,#c05a66,#8b3a46)",
    tall: true,
    svg: (
      <svg viewBox="0 0 200 300" className="w-[150px] md:w-[170px] drop-shadow-[0_10px_30px_rgba(0,0,0,0.2)]">
        <path d="M100 280 Q95 220 98 180" stroke="#4a7c59" strokeWidth="4" fill="none"/>
        <circle cx="100" cy="130" r="28" fill="#c05a66"/>
      </svg>
    ),
  },
  {
    tag: "Fresh",
    name: "Garden Whisper",
    price: "From ₹899",
    bg: "linear-gradient(135deg,#c4e0d0,#a0c8b8,#6fa898)",
    tall: false,
    svg: (
      <svg viewBox="0 0 160 200" className="w-[110px] drop-shadow-[0_8px_20px_rgba(0,0,0,0.15)]">
        <circle cx="80" cy="80" r="25" fill="#7fc4a0"/>
      </svg>
    ),
  },
  {
    tag: "Dreamy",
    name: "Lavender Dusk",
    price: "From ₹1,099",
    bg: "linear-gradient(135deg,#e8d0f0,#d0a8e4,#b880d0)",
    tall: false,
    svg: (
      <svg viewBox="0 0 160 200" className="w-[110px] drop-shadow-[0_8px_20px_rgba(0,0,0,0.15)]">
        <circle cx="80" cy="85" r="24" fill="#c090d8"/>
      </svg>
    ),
  },
  {
    tag: "Sunshine",
    name: "Golden Hour",
    price: "From ₹799",
    bg: "linear-gradient(135deg,#fff0d0,#f8d88a,#e8b850)",
    tall: false,
    svg: (
      <svg viewBox="0 0 160 200" className="w-[110px] drop-shadow-[0_8px_20px_rgba(0,0,0,0.15)]">
        <circle cx="80" cy="82" r="26" fill="#f0c050"/>
      </svg>
    ),
  },
];

export default function FloralStories() {
  return (
    <section
      id="floral"
      className="py-20 md:py-28 px-6 md:px-10"
      style={{ background: "var(--cream)" }}
    >
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="text-center mb-16 reveal">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-[var(--rose)] mb-4">
            <span className="w-6 h-[1px] bg-[var(--rose)]" />
            Floral Stories
          </div>

          <h2 className="font-playfair text-[2.2rem] md:text-[3rem] font-bold leading-tight text-[var(--text-dark)]">
            Every Bloom <br />
            Tells a <em style={{ color: "var(--rose)" }}>Story</em>
          </h2>
        </div>

        {/* GRID */}
        <div className="grid md:grid-cols-4 gap-5">
          {florals.map((item, i) => (
            <div
              key={item.tag}
              className={`floral-card-item reveal reveal-delay-${i + 1} rounded-2xl overflow-hidden relative cursor-pointer`}
              style={{
                gridRow: item.tall ? "span 2" : undefined,
              }}
            >
              {/* CARD */}
              <div
                className="relative w-full flex items-end justify-center overflow-hidden"
                style={{
                  background: item.bg,
                  aspectRatio: item.tall ? undefined : "3/4",
                  height: item.tall ? "100%" : undefined,
                }}
              >
                {/* SVG */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {item.svg}
                </div>

                {/* OVERLAY */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70" />

                {/* CONTENT */}
                <div className="relative z-10 p-5 text-white w-full">
                  <span className="inline-block text-[10px] px-2 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 uppercase tracking-wide mb-2">
                    {item.tag}
                  </span>

                  <div className="font-playfair text-[1.2rem] leading-tight whitespace-pre-line">
                    {item.name}
                  </div>

                  <div className="text-sm text-white/70 mt-1">
                    {item.price}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}