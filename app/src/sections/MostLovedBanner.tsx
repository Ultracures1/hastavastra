import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Star } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export default function MostLovedBanner() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const tween = gsap.from(section.querySelectorAll(".banner-text"), {
      opacity: 0,
      x: -40,
      duration: 0.8,
      stagger: 0.15,
      scrollTrigger: {
        trigger: section,
        start: "top 70%",
        toggleActions: "play none none none",
      },
    });

    return () => {
      tween.kill();
    };
  }, []);

  return (
    <section ref={sectionRef} className="relative h-[450px] md:h-[550px] overflow-hidden">
      {/* Background Image */}
      <img
        src="/images/banner-loved.jpg"
        alt="Most loved Sarees"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-charcoal/80 via-charcoal/50 to-transparent" />

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-[1400px] mx-auto px-6 md:px-16 w-full">
          <div className="max-w-lg">
            {/* Stars */}
            <div className="banner-text flex items-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} className="fill-ochre text-ochre" />
              ))}
            </div>

            <h2 className="banner-text font-serif text-3xl md:text-5xl lg:text-[52px] text-paper mb-4">
              Most loved Sarees by all.
            </h2>
            <p className="banner-text text-paper/70 font-sans text-base md:text-lg mb-8">
              Chosen again and again.
            </p>
            <button className="banner-text btn-primary">
              <span>Shop Now</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
