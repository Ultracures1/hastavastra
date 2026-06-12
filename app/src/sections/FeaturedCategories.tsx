import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useSiteData } from "@/context/SiteDataContext";

gsap.registerPlugin(ScrollTrigger);

export default function FeaturedCategories() {
  const { featuredCategories } = useSiteData();
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const cards = section.querySelectorAll(".feat-card");
    const tween = gsap.from(cards, {
      opacity: 0,
      y: 50,
      scale: 0.95,
      duration: 0.6,
      stagger: 0.1,
      scrollTrigger: {
        trigger: section,
        start: "top 80%",
        toggleActions: "play none none none",
      },
    });

    return () => {
      tween.kill();
    };
  }, []);

  return (
    <section ref={sectionRef} className="py-16 bg-beige">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {featuredCategories.map((cat) => (
            <a
              key={cat.id}
              href={cat.href || "#"}
              className="feat-card group relative h-[280px] md:h-[320px] overflow-hidden rounded-[20px]"
            >
              {/* Image */}
              <img
                src={cat.image}
                alt={cat.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-charcoal/30 to-transparent transition-opacity duration-300 group-hover:from-charcoal/60" />

              {/* Label */}
              <div className="absolute inset-0 flex items-center justify-center">
                <h3 className="font-serif text-xl md:text-2xl text-paper uppercase tracking-[3px] text-center px-4 group-hover:underline decoration-ochre underline-offset-4">
                  {cat.name}
                </h3>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
