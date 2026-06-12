import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { useSiteData } from "@/context/SiteDataContext";

gsap.registerPlugin(ScrollTrigger);

export default function PromoBanner() {
  const banner = useSiteData().settings.promo_banner;
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const tween = gsap.from(section.querySelectorAll(".banner-text"), {
      opacity: 0,
      y: 40,
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
    <section ref={sectionRef} className="relative h-[400px] md:h-[500px] overflow-hidden">
      {/* Background Image */}
      <img
        src={banner.image}
        alt={banner.title}
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-charcoal/70 via-charcoal/40 to-transparent" />

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-[1400px] mx-auto px-6 w-full">
          <div className="max-w-lg">
            <h2 className="banner-text font-serif text-3xl md:text-5xl text-paper mb-4">
              {banner.title}
            </h2>
            {banner.subtitle && (
              <p className="banner-text text-paper/70 font-sans text-base md:text-lg mb-8">
                {banner.subtitle}
              </p>
            )}
            <button className="banner-text btn-primary">
              <span>{banner.cta || "Shop Now"}</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
