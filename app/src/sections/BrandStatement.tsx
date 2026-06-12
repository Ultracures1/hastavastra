import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Heart } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export default function BrandStatement() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const tween = gsap.from(section.querySelectorAll(".animate-in"), {
      opacity: 0,
      y: 30,
      duration: 0.8,
      stagger: 0.15,
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
    <section ref={sectionRef} className="py-24 md:py-32 bg-beige">
      <div className="max-w-[1400px] mx-auto px-6 text-center">
        <div className="animate-in flex items-center justify-center gap-3 mb-4">
          <Heart size={16} className="text-ochre fill-ochre" />
        </div>
        <h2 className="animate-in font-serif text-3xl md:text-5xl text-charcoal uppercase tracking-[6px] mb-4">
          Dipped in Love
        </h2>
        <p className="animate-in text-softgrey font-sans text-base md:text-lg max-w-xl mx-auto">
          India's most loved Artisanal brand, handcrafted by 17000+ artisans
        </p>
      </div>
    </section>
  );
}
