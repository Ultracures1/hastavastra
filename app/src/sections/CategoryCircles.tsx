import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useSiteData } from "@/context/SiteDataContext";

gsap.registerPlugin(ScrollTrigger);

export default function CategoryCircles() {
  const { categories } = useSiteData();
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const items = section.querySelectorAll(".cat-item");
    const tween = gsap.from(items, {
      opacity: 0,
      y: 40,
      scale: 0.9,
      duration: 0.6,
      stagger: 0.08,
      scrollTrigger: {
        trigger: section,
        start: "top 85%",
        toggleActions: "play none none none",
      },
    });

    return () => {
      tween.kill();
    };
  }, []);

  return (
    <section ref={sectionRef} className="pb-16 bg-beige">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="flex flex-wrap justify-center gap-6 md:gap-10">
          {categories.map((cat) => (
            <a
              key={cat.id}
              href={cat.href}
              className="cat-item group flex flex-col items-center gap-3"
            >
              <div className="w-28 h-28 md:w-36 md:h-36 rounded-full border-2 border-ochre overflow-hidden transition-all duration-300 group-hover:scale-105 group-hover:border-[3px]">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
              </div>
              <span className="text-charcoal text-xs md:text-sm uppercase tracking-[2px] font-sans font-medium transition-colors group-hover:text-ochre">
                {cat.name}
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
