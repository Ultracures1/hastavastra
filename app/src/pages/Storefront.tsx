import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { SiteDataProvider, useSiteData } from "@/context/SiteDataContext";
import AnnouncementBar from "@/components/AnnouncementBar";
import Header from "@/components/Header";
import CategoryTabs from "@/components/CategoryTabs";
import CartDrawer from "@/components/CartDrawer";
import Footer from "@/components/Footer";
import HeroSection from "@/sections/HeroSection";
import Marquee from "@/sections/Marquee";
import BrandStatement from "@/sections/BrandStatement";
import CategoryCircles from "@/sections/CategoryCircles";
import ProductSection from "@/sections/ProductSection";
import PromoBanner from "@/sections/PromoBanner";
import SizeSelector from "@/sections/SizeSelector";
import MostLovedBanner from "@/sections/MostLovedBanner";
import FeaturedCategories from "@/sections/FeaturedCategories";
import FabricBanner from "@/sections/FabricBanner";
import Testimonials from "@/sections/Testimonials";
import FeaturedIn from "@/sections/FeaturedIn";

function StorefrontContent() {
  const { products, settings } = useSiteData();
  const titles = settings.section_titles;

  return (
    <div className="min-h-screen bg-beige font-sans text-charcoal">
      <AnnouncementBar />
      <Header />
      <CategoryTabs />

      <main>
        <HeroSection />
        <Marquee />
        <BrandStatement />
        <CategoryCircles />

        <ProductSection
          id="bestseller-sarees"
          title={titles["bestseller-sarees"] || "BESTSELLER SAREES"}
          products={products["bestseller-sarees"] || []}
        />

        <PromoBanner />
        <SizeSelector />
        <MostLovedBanner />

        <ProductSection
          id="bestseller-blouses"
          title={titles["bestseller-blouses"] || "BESTSELLER BLOUSES"}
          products={products["bestseller-blouses"] || []}
        />

        <FeaturedCategories />

        <ProductSection
          id="new-arrivals"
          title={titles["new-arrivals"] || "NEW ARRIVAL - SAREES"}
          products={products["new-arrivals"] || []}
        />

        <FabricBanner />

        <ProductSection
          id="ready-to-wear"
          title={titles["ready-to-wear"] || "READY TO WEAR"}
          products={products["ready-to-wear"] || []}
        />

        <Testimonials />
        <FeaturedIn />
      </main>

      <Footer />
      <CartDrawer />
    </div>
  );
}

export default function Storefront() {
  return (
    <SiteDataProvider>
      <CartProvider>
        <WishlistProvider>
          <StorefrontContent />
        </WishlistProvider>
      </CartProvider>
    </SiteDataProvider>
  );
}
