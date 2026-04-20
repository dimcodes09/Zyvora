import Link from "next/link";

const cols = [
  {
    title: "Shop",
    links: ["New Arrivals", "Floral Stories", "Collections", "Sale"],
  },
  {
    title: "Company",
    links: ["About", "Careers", "Press", "Blog"],
  },
  {
    title: "Support",
    links: ["FAQ", "Shipping", "Returns", "Contact"],
  },
];

export default function Footer() {
  return (
    <footer className="bg-[var(--text-dark)] text-white mt-auto">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-16">

        {/* TOP GRID */}
        <div className="grid md:grid-cols-4 gap-10 border-b border-white/10 pb-10">

          {/* BRAND */}
          <div>
            <h2 className="font-playfair text-2xl font-bold text-[var(--rose-light)] mb-4">
              Zyvora
            </h2>
            <p className="text-sm text-white/50 leading-relaxed max-w-xs">
              Curated gifts for magical moments. AI-powered curation meets
              artisanal beauty.
            </p>
          </div>

          {/* LINKS */}
          {cols.map((col) => (
            <div key={col.title}>
              <h3 className="text-xs uppercase tracking-widest text-[var(--rose-light)] mb-4">
                {col.title}
              </h3>

              <div className="flex flex-col gap-2">
                {col.links.map((link) => (
                  <Link
                    key={link}
                    href="#"
                    className="text-sm text-white/50 hover:text-[var(--rose-light)] transition-colors"
                  >
                    {link}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* BOTTOM */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-6 text-xs text-white/40">
          <span>© {new Date().getFullYear()} Zyvora. All rights reserved.</span>

          <span>
            Made with{" "}
            <span className="text-[var(--rose)]">♥</span> in India
          </span>
        </div>

      </div>
    </footer>
  );
}