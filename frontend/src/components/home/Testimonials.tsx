const reviews = [
  {
    stars: "★★★★★",
    text: "The AI gift finder is absolutely magical. It suggested the perfect bouquet for my mother's birthday — she cried happy tears!",
    initials: "PR",
    name: "Priya Rajan",
    city: "Mumbai",
  },
  {
    stars: "★★★★★",
    text: "Used AR to preview the bag before buying — placed it in my living room virtually. Best shopping experience ever!",
    initials: "SM",
    name: "Sana Mirza",
    city: "Delhi",
  },
  {
    stars: "★★★★★",
    text: "Zyvora is Pinterest come to life as a store. Every product feels curated with so much love and care.",
    initials: "AK",
    name: "Ananya Kulkarni",
    city: "Bengaluru",
  },
];

export default function Testimonials() {
  return (
    <section
      className="py-20 md:py-28 px-6 md:px-10"
      style={{ background: "var(--rose-blush)" }}
    >
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="reveal flex justify-between items-end mb-12">
          <div>
            <div className="inline-flex items-center gap-2 text-[0.72rem] uppercase tracking-[0.15em] mb-4"
                 style={{ color: "var(--rose)" }}>
              <span className="w-6 h-px bg-[var(--rose)]" />
              Love Notes
            </div>

            <h2
              className="font-playfair font-bold leading-tight"
              style={{
                fontSize: "clamp(2rem,4vw,3.2rem)",
                color: "var(--text-dark)",
              }}
            >
              What Our <em style={{ color: "var(--rose)" }}>Gifters</em> Say
            </h2>
          </div>
        </div>

        {/* GRID */}
        <div className="grid md:grid-cols-3 gap-6">
          {reviews.map(({ stars, text, initials, name, city }, i) => (
            <div
              key={name}
              className={`reveal reveal-delay-${i + 1}
                bg-white rounded-[20px] p-8
                transition-all duration-300
                hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(201,123,132,0.12)]
              `}
              style={{
                border: "1px solid rgba(201,123,132,0.08)",
              }}
            >
              {/* stars */}
              <div
                className="text-sm tracking-[2px] mb-4"
                style={{ color: "var(--gold)" }}
              >
                {stars}
              </div>

              {/* text */}
              <p
                className="text-sm italic leading-relaxed mb-6"
                style={{ color: "var(--text-mid)" }}
              >
                "{text}"
              </p>

              {/* user */}
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold"
                  style={{
                    background: "var(--rose-pale)",
                    color: "var(--rose-deep)",
                  }}
                >
                  {initials}
                </div>

                <div>
                  <p
                    className="text-sm font-semibold"
                    style={{ color: "var(--text-dark)" }}
                  >
                    {name}
                  </p>

                  <p
                    className="text-xs"
                    style={{ color: "var(--text-light)" }}
                  >
                    {city}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}