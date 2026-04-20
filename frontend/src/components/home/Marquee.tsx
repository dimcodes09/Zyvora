const items = [
  "New Arrivals",
  "Floral Stories",
  "AI Gift Finder",
  "AR Preview",
  "Same Day Delivery",
  "Curated Collections",
];

export default function Marquee() {
  return (
    <div className="w-full overflow-hidden py-4"
      style={{ background: "var(--rose)" }}
    >
      <div className="flex gap-12 whitespace-nowrap animate-marquee px-4">
        
        {[...items, ...items].map((item, i) => (
          <span
            key={i}
            className="font-playfair text-base md:text-lg inline-flex items-center gap-4 text-white/80"
          >
            {item}
            <span className="text-white/30">✦</span>
          </span>
        ))}

      </div>
    </div>
  );
}