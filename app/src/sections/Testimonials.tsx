import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { testimonials } from "@/data/products";

gsap.registerPlugin(ScrollTrigger);

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const itemsPerView = typeof window !== "undefined" && window.innerWidth < 768 ? 1 : 4;
  const maxIndex = Math.max(0, testimonials.length - itemsPerView);

  const goNext = () => setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));
  const goPrev = () => setCurrentIndex((prev) => Math.max(prev - 1, 0));

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const tween = gsap.from(section.querySelectorAll(".testimonial-card"), {
      opacity: 0,
      y: 40,
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
    <section ref={sectionRef} className="py-16 md:py-24 bg-beige">
      <div className="max-w-[1400px] mx-auto px-6">
        {/* Title */}
        <div className="text-center mb-10">
          <h2 className="text-charcoal text-sm uppercase tracking-[4px] font-sans font-medium">
            <span className="text-softgrey mr-3">&#8212;</span>
            CUSTOMER TESTIMONIALS
            <span className="text-softgrey ml-3">&#8212;</span>
          </h2>
        </div>

        {/* Carousel */}
        <div className="relative">
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-out gap-6"
              style={{
                transform: `translateX(-${currentIndex * (100 / itemsPerView + 2)}%)`,
              }}
            >
              {testimonials.map((t) => (
                <div
                  key={t.id}
                  className="testimonial-card flex-shrink-0 w-full md:w-[calc(25%-18px)]"
                >
                  {/* Image */}
                  <div className="rounded-[20px] overflow-hidden mb-4 aspect-[3/4]">
                    <img
                      src={t.image}
                      alt={t.customer}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>

                  {/* Content */}
                  <p className="text-charcoal text-sm font-sans mb-2 line-clamp-2">
                    {t.text}
                  </p>
                  <a href="#" className="text-ochre text-xs font-sans hover:underline mb-3 inline-block">
                    read more
                  </a>

                  <p className="text-charcoal text-xs uppercase font-sans font-medium tracking-wider">
                    {t.customer}
                  </p>
                  <p className="text-softgrey text-xs font-sans mt-0.5">
                    {t.date}
                  </p>
                  <p className="text-softgrey text-xs font-sans mt-0.5">
                    {t.product}
                  </p>

                  {/* Stars */}
                  <div className="flex items-center gap-0.5 mt-2">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} size={12} className="fill-ochre text-ochre" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Buttons */}
          <button
            onClick={goPrev}
            disabled={currentIndex === 0}
            className={`absolute left-0 top-1/3 -translate-y-1/2 -translate-x-4 w-10 h-10 rounded-full bg-charcoal text-paper flex items-center justify-center transition-all duration-300 hover:bg-ochre disabled:opacity-30 disabled:cursor-not-allowed z-10`}
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={goNext}
            disabled={currentIndex >= maxIndex}
            className={`absolute right-0 top-1/3 -translate-y-1/2 translate-x-4 w-10 h-10 rounded-full bg-charcoal text-paper flex items-center justify-center transition-all duration-300 hover:bg-ochre disabled:opacity-30 disabled:cursor-not-allowed z-10`}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </section>
  );
}
