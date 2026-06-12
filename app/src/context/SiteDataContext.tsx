import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { fetchStorefront, type StorefrontData } from "@/lib/api";
import {
  bestsellerSarees,
  bestsellerBlouses,
  newArrivalSarees,
  readyToWear,
  categories as staticCategories,
  featuredCategories as staticFeatured,
  testimonials as staticTestimonials,
  pressLogos,
  announcementMessages,
} from "@/data/products";

// Static data is used as the initial value so the page renders instantly,
// then is replaced by the live API data once it loads.
const fallbackData: StorefrontData = {
  settings: {
    announcement_messages: announcementMessages,
    marquee_text:
      "EARN ON EVERY PURCHASE AND REDEEM POINTS AT 1 POINT = ₹1  |  REDEEM AS MANY POINTS AS YOU LIKE  |  ",
    hero: {
      prefix: "Wear a",
      title: "story",
      mainImage: "/images/hero-saree.jpg",
      fabricImage: "/images/hero-fabric.jpg",
    },
    promo_banner: {
      title: "Designed for the Perfect Fit",
      subtitle: "From size S to XXXL — same comfort, same love.",
      cta: "Shop Now",
      image: "/images/banner-fit.jpg",
    },
    most_loved_banner: {
      title: "Most loved Sarees by all.",
      subtitle: "Chosen again and again.",
      cta: "Shop Now",
      image: "/images/banner-loved.jpg",
    },
    fabric_banner: {
      title: "Fabric as soft as your skin.",
      cta: "Shop Now",
      image: "/images/banner-fabric.jpg",
    },
    press_logos: pressLogos,
    section_titles: {
      "bestseller-sarees": "BESTSELLER SAREES",
      "bestseller-blouses": "BESTSELLER BLOUSES",
      "new-arrivals": "NEW ARRIVAL - SAREES",
      "ready-to-wear": "READY TO WEAR",
    },
  },
  products: {
    "bestseller-sarees": bestsellerSarees,
    "bestseller-blouses": bestsellerBlouses,
    "new-arrivals": newArrivalSarees,
    "ready-to-wear": readyToWear,
  },
  categories: staticCategories.map((c, i) => ({
    id: `static-${i}`,
    name: c.name,
    image: c.image,
    href: c.href,
    kind: "circle" as const,
    sortOrder: i,
    active: true,
  })),
  featuredCategories: staticFeatured.map((c, i) => ({
    id: `static-f-${i}`,
    name: c.name,
    image: c.image,
    href: "#",
    kind: "featured" as const,
    sortOrder: i,
    active: true,
  })),
  testimonials: staticTestimonials.map((t, i) => ({
    ...t,
    sortOrder: i,
    active: true,
  })),
};

const SiteDataContext = createContext<StorefrontData>(fallbackData);

export function SiteDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<StorefrontData>(fallbackData);

  useEffect(() => {
    let cancelled = false;
    fetchStorefront()
      .then((live) => {
        if (cancelled) return;
        // Merge so missing settings keys fall back to defaults
        setData({
          ...live,
          settings: { ...fallbackData.settings, ...live.settings },
        });
      })
      .catch((err) => {
        console.warn("Could not load live site data, using defaults:", err);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <SiteDataContext.Provider value={data}>{children}</SiteDataContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSiteData() {
  return useContext(SiteDataContext);
}
