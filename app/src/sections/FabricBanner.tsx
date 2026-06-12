import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { useSiteData } from "@/context/SiteDataContext";

gsap.registerPlugin(ScrollTrigger);

export default function FabricBanner() {
  const banner = useSiteData().settings.fabric_banner;
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const tween = gsap.from(section.querySelectorAll(".banner-text"), {
      opacity: 0,
      y: 30,
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
    <section ref={sectionRef} className="relative h-[350px] md:h-[400px] overflow-hidden">
      {/* Background Image */}
      <img
        src={banner.image}
        alt={banner.title}
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-charcoal/30" />

      {/* Content */}
      <div className="relative z-10 h-full flex items-center justify-center">
        <div className="text-center">
          <h2 className="banner-text font-serif text-3xl md:text-[42px] text-paper mb-6">
            {banner.title}
          </h2>
          <button className="banner-text btn-primary">
            <span>{banner.cta || "Shop Now"}</span>
          </button>
        </div>
      </div>
    </section>
  );
}
