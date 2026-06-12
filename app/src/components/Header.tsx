import { useState, useEffect } from "react";
import { Search, User, Heart, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";

const navLinks = [
  { label: "SAREE", href: "#sarees" },
  { label: "BLOUSE", href: "#blouses" },
  { label: "WOMEN", href: "#women" },
  { label: "MEN", href: "#men" },
  { label: "ACCESSORIES", href: "#accessories" },
  { label: "MORE", href: "#more" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const { itemCount, setIsOpen } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 60);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 bg-beige transition-all duration-300 ${
        scrolled ? "border-b border-softgrey/30" : ""
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-6 h-[60px] flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="font-serif italic text-[28px] text-charcoal tracking-tight">
          Suta
        </a>

        {/* Navigation */}
        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-charcoal text-xs uppercase tracking-[2px] font-sans font-medium link-underline py-1"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Utilities */}
        <div className="flex items-center gap-5">
          <button className="text-charcoal hover:text-ochre transition-colors">
            <Search size={20} strokeWidth={1.5} />
          </button>
          <button className="text-charcoal hover:text-ochre transition-colors hidden sm:block">
            <User size={20} strokeWidth={1.5} />
          </button>
          <button className="text-charcoal hover:text-ochre transition-colors hidden sm:block">
            <Heart size={20} strokeWidth={1.5} />
          </button>
          <button
            className="text-charcoal hover:text-ochre transition-colors relative"
            onClick={() => setIsOpen(true)}
          >
            <ShoppingBag size={20} strokeWidth={1.5} />
            {itemCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-ochre text-paper text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
