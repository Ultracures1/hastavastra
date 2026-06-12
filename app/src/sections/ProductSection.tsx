import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Product } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import SectionTitle from "@/components/SectionTitle";

gsap.registerPlugin(ScrollTrigger);

interface ProductSectionProps {
  id: string;
  title: string;
  products: Product[];
}

export default function ProductSection({ id, title, products }: ProductSectionProps) {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    const cards = grid.querySelectorAll(".product-card");
    const tween = gsap.from(cards, {
      opacity: 0,
      y: 50,
      duration: 0.6,
      stagger: 0.1,
      scrollTrigger: {
        trigger: grid,
        start: "top 80%",
        toggleActions: "play none none none",
      },
    });

    return () => {
      tween.kill();
    };
  }, []);

  return (
    <section id={id} className="py-16 md:py-24 bg-beige">
      <div className="max-w-[1400px] mx-auto px-6">
        <SectionTitle title={title} />

        <div
          ref={gridRef}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {products.map((product) => (
            <div key={product.id} className="product-card">
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <button className="inline-block border border-charcoal text-charcoal px-10 py-3 text-xs uppercase tracking-[2px] font-sans font-medium hover:bg-charcoal hover:text-paper transition-colors duration-300">
            View All
          </button>
        </div>
      </div>
    </section>
  );
}
