import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const mainImageRef = useRef<HTMLDivElement>(null);
  const fabricImageRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const mainImage = mainImageRef.current;
    const fabricImage = fabricImageRef.current;
    const text = textRef.current;
    if (!section || !mainImage || !fabricImage || !text) return;

    // Mouse parallax for main image
    let mouseX = 0, mouseY = 0;
    let currentX = 0, currentY = 0;
    const rotationIntensity = 25;
    const lerpFactor = 0.08;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    let rafId: number;
    const animate = () => {
      currentX += (mouseX - currentX) * lerpFactor;
      currentY += (mouseY - currentY) * lerpFactor;

      const rotateX = -currentY * rotationIntensity;
      const rotateY = currentX * rotationIntensity;

      mainImage.style.transform = `
        translate(${currentX * 30}px, ${currentY * 30}px)
        rotateX(${rotateX}deg)
        rotateY(${rotateY}deg)
      `;

      rafId = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", handleMouseMove);
    rafId = requestAnimationFrame(animate);

    // Scroll rotation for fabric image
    const scrollTween = gsap.to(fabricImage, {
      rotateY: 360,
      ease: "none",
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: "bottom top",
        scrub: 1,
      },
    });

    // Text entrance animation
    gsap.from(text.children, {
      opacity: 0,
      y: 40,
      duration: 0.8,
      stagger: 0.15,
      delay: 0.3,
      ease: "power2.out",
    });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(rafId);
      scrollTween.kill();
      ScrollTrigger.getAll().forEach((t) => {
        if (t.vars.trigger === section) t.kill();
      });
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[90vh] bg-beige overflow-hidden flex items-center"
    >
      {/* Subtle grain texture overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
      }} />

      {/* Gold decorative lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" preserveAspectRatio="none">
        <path d="M0,30% Q25%,20% 50%,35% T100%,25%" stroke="#d4a259" strokeWidth="0.5" fill="none" />
        <path d="M0,60% Q30%,50% 60%,65% T100%,55%" stroke="#d4a259" strokeWidth="0.5" fill="none" />
        <path d="M0,80% Q20%,75% 40%,85% T100%,78%" stroke="#d4a259" strokeWidth="0.5" fill="none" />
      </svg>

      <div className="max-w-[1400px] mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-center relative z-10">
        {/* Left Panel - Typography */}
        <div ref={textRef} className="py-12 lg:py-0">
          <p className="font-serif text-4xl md:text-5xl text-charcoal mb-1">
            Wear a
          </p>
          <h1 className="font-serif italic text-6xl md:text-8xl lg:text-[120px] text-charcoal leading-none mb-8">
            story
          </h1>

          <div className="w-16 h-[1px] bg-charcoal mb-8" />

          <nav className="space-y-3 mb-12">
            {["Categories", "New Arrivals", "Bestsellers", "Heartwork"].map(
              (item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase().replace(" ", "-")}`}
                  className="block text-charcoal text-sm uppercase tracking-[2px] font-sans font-medium link-underline w-fit"
                >
                  {item}
                </a>
              )
            )}
          </nav>

          {/* Temperature Selector */}
          <div className="inline-flex items-center bg-paper rounded-full p-1 border border-softgrey/20">
            {["Hot", "Warm", "Cold"].map((temp, i) => (
              <button
                key={temp}
                className={`px-5 py-2 text-xs uppercase tracking-[1px] font-sans font-medium rounded-full transition-all duration-300 ${
                  i === 1
                    ? "bg-ochre text-paper"
                    : "text-charcoal hover:text-ochre"
                }`}
              >
                {temp}
              </button>
            ))}
          </div>
        </div>

        {/* Right Panel - Images */}
        <div className="relative h-[500px] lg:h-[600px]" style={{ perspective: "1000px" }}>
          {/* Main Saree Image */}
          <div
            ref={mainImageRef}
            className="absolute left-[5%] top-[10%] w-[55%] z-10 will-change-transform"
            style={{ transformStyle: "preserve-3d" }}
          >
            <img
              src="/images/hero-saree.jpg"
              alt="Suta Saree"
              className="w-full h-auto rounded-[20px] shadow-2xl"
            />
          </div>

          {/* Fabric Image */}
          <div
            ref={fabricImageRef}
            className="absolute right-[5%] bottom-[10%] w-[45%] will-change-transform hidden md:block"
            style={{ transformStyle: "preserve-3d" }}
          >
            <img
              src="/images/hero-fabric.jpg"
              alt="Colorful Fabric"
              className="w-full h-auto rounded-[20px] shadow-xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
