import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
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
import {
  bestsellerSarees,
  bestsellerBlouses,
  newArrivalSarees,
  readyToWear,
} from "@/data/products";

function App() {
  return (
    <CartProvider>
      <WishlistProvider>
        <div className="min-h-screen bg-beige font-sans text-charcoal">
          <AnnouncementBar />
          <Header />
          <CategoryTabs />

          <main>
            <HeroSection />
            <Marquee />
            <BrandStatement />
            <CategoryCircles />

            {/* Bestseller Sarees */}
            <ProductSection
              id="bestseller-sarees"
              title="BESTSELLER SAREES"
              products={bestsellerSarees}
            />

            {/* Promo Banner - Designed for Perfect Fit */}
            <PromoBanner />

            {/* Blouses by Size */}
            <SizeSelector />

            {/* Most Loved Banner */}
            <MostLovedBanner />

            {/* Bestseller Blouses */}
            <ProductSection
              id="bestseller-blouses"
              title="BESTSELLER BLOUSES"
              products={bestsellerBlouses}
            />

            {/* Featured Categories */}
            <FeaturedCategories />

            {/* New Arrival Sarees */}
            <ProductSection
              id="new-arrivals"
              title="NEW ARRIVAL - SAREES"
              products={newArrivalSarees}
            />

            {/* Fabric Banner */}
            <FabricBanner />

            {/* Ready to Wear */}
            <ProductSection
              id="ready-to-wear"
              title="READY TO WEAR"
              products={readyToWear}
            />

            {/* Testimonials */}
            <Testimonials />

            {/* Featured In */}
            <FeaturedIn />
          </main>

          <Footer />
          <CartDrawer />
        </div>
      </WishlistProvider>
    </CartProvider>
  );
}

export default App;
