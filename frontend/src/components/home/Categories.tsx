import Link from "next/link";

const categories = [
  { emoji: "💐", name: "Florals",   count: "48 items" },
  { emoji: "👜", name: "Handbags",  count: "32 items" },
  { emoji: "🕯️", name: "Candles",   count: "24 items" },
  { emoji: "🍫", name: "Gourmet",   count: "19 items" },
  { emoji: "💎", name: "Jewellery", count: "56 items" },
];

export default function Categories() {
  return (
    <section
      className="py-20 md:py-28 px-6 md:px-10"
      style={{ background: "var(--cream)" }}
    >
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="reveal flex justify-between items-end">
          <div>
            <div className="inline-flex items-center gap-2 text-[0.72rem] uppercase tracking-[0.15em] mb-4"
                 style={{ color: "var(--rose)" }}>
              <span className="w-6 h-px bg-[var(--rose)]" />
              Browse By
            </div>

            <h2 className="font-playfair font-bold leading-tight"
                style={{
                  fontSize: "clamp(2rem,4vw,3.2rem)",
                  color: "var(--text-dark)",
                }}>
              Shop by <em style={{ color: "var(--rose)" }}>Category</em>
            </h2>
          </div>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mt-12">
          {categories.map(({ emoji, name, count }, i) => (
            <Link
              key={name}
              href={`/products?category=${name.toLowerCase()}`}
              className={`group reveal reveal-delay-${(i % 4) + 1}
                bg-white rounded-[20px] py-7 px-4 text-center
                transition-all duration-300
                hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(201,123,132,0.12)]
              `}
              style={{
                border: "1px solid rgba(201,123,132,0.08)",
              }}
            >
              <span className="text-[2rem] mb-3 block">{emoji}</span>

              <p className="text-[0.8rem] font-medium"
                 style={{ color: "var(--text-dark)" }}>
                {name}
              </p>

              <p className="text-[0.7rem] mt-1"
                 style={{ color: "var(--text-light)" }}>
                {count}
              </p>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}