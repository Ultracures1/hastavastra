import { useState } from "react";
import { sizeOptions } from "@/data/products";
import SectionTitle from "@/components/SectionTitle";

export default function SizeSelector() {
  const [activeSize, setActiveSize] = useState("M");

  return (
    <section className="py-16 bg-beige">
      <div className="max-w-[1400px] mx-auto px-6">
        <SectionTitle title="BLOUSES BY SIZE" />

        <div className="flex items-center justify-center gap-3 md:gap-4 flex-wrap">
          {sizeOptions.map((size) => (
            <button
              key={size.label}
              onClick={() => setActiveSize(size.label)}
              className={`w-[120px] md:w-[140px] h-[70px] md:h-[80px] border flex items-center justify-center gap-1 transition-all duration-300 ${
                activeSize === size.label
                  ? "border-ochre bg-paper"
                  : "border-softgrey/30 hover:border-ochre hover:bg-paper"
              }`}
            >
              <span
                className={`font-serif text-2xl md:text-3xl ${
                  activeSize === size.label ? "text-ochre" : "text-charcoal"
                }`}
              >
                {size.label}
              </span>
              <span className="text-softgrey text-xs font-sans">
                ({size.measurement})
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
