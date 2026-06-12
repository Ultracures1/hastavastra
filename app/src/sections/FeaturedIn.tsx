import { pressLogos } from "@/data/products";
import SectionTitle from "@/components/SectionTitle";

export default function FeaturedIn() {
  return (
    <section className="py-16 bg-beige">
      <div className="max-w-[1400px] mx-auto px-6">
        <SectionTitle title="FEATURED IN" />

        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 lg:gap-16">
          {pressLogos.map((logo) => (
            <span
              key={logo}
              className="text-charcoal/30 font-serif text-lg md:text-xl lg:text-2xl tracking-wider hover:text-charcoal/70 transition-opacity duration-300 cursor-pointer select-none"
            >
              {logo}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
