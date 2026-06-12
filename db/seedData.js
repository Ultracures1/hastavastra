// Initial content, ported from the original static frontend data
// (app/src/data/products.ts). Used only to populate empty tables on first run.

const products = [
  // Bestseller sarees
  { name: "Beet And Turnip", type: "Saree with blouse piece", price: 8400, rating: 5.0, reviews: 784, badge: "TOP_RATED", image: "/images/saree-1.jpg", category: "saree", hasBlousePiece: true, section: "bestseller-sarees" },
  { name: "Raga Saama", type: "Saree with blouse piece", price: 7700, rating: 4.8, reviews: 333, badge: "BESTSELLER", image: "/images/saree-2.jpg", category: "saree", hasBlousePiece: true, section: "bestseller-sarees" },
  { name: "Manjaadi", type: "Saree", price: 6500, rating: 4.7, reviews: 249, badge: "TOP_RATED", image: "/images/saree-3.jpg", category: "saree", section: "bestseller-sarees" },
  { name: "Jheel", type: "Saree", price: 6000, rating: 4.9, reviews: 277, badge: "BESTSELLER", image: "/images/saree-4.jpg", category: "saree", section: "bestseller-sarees" },
  { name: "Bossy Caramel", type: "Saree", price: 5700, rating: 4.9, reviews: 247, badge: "BESTSELLER", image: "/images/saree-5.jpg", category: "saree", section: "bestseller-sarees" },
  { name: "Bougainvillea", type: "Saree", price: 5000, rating: 4.8, reviews: 188, badge: "TOP_RATED", image: "/images/saree-6.jpg", category: "saree", section: "bestseller-sarees" },
  { name: "Raga Bhairavi", type: "Saree with blouse piece", price: 7700, rating: 4.9, reviews: 277, badge: "BESTSELLER", image: "/images/saree-7.jpg", category: "saree", hasBlousePiece: true, section: "bestseller-sarees" },
  { name: "Raw Ink Mul", type: "Saree", price: 5000, rating: 4.8, reviews: 237, badge: "BESTSELLER", image: "/images/saree-8.jpg", category: "saree", section: "bestseller-sarees" },
  // Bestseller blouses
  { name: "Wild Rose", type: "Blouse", price: 8400, rating: 5.0, reviews: 1, image: "/images/blouse-1.jpg", category: "blouse", sizes: ["2XS", "XS", "S", "M", "L", "XL", "2XL", "3XL"], section: "bestseller-blouses" },
  { name: "Moody Bindu", type: "Blouse", price: 4800, rating: 5.0, reviews: 1, image: "/images/blouse-2.jpg", category: "blouse", sizes: ["XS", "S", "M", "L", "XL", "2XL"], section: "bestseller-blouses" },
  { name: "Dot Alat Palat", type: "Blouse", price: 5600, rating: 4.9, reviews: 12, badge: "BESTSELLER", image: "/images/blouse-3.jpg", category: "blouse", sizes: ["XS", "S", "M", "L", "XL", "2XL", "3XL"], section: "bestseller-blouses" },
  { name: "Seedha Alat Palat", type: "Blouse", price: 5000, rating: 4.8, reviews: 8, image: "/images/blouse-4.jpg", category: "blouse", sizes: ["XS", "S", "M", "L", "XL", "2XL"], section: "bestseller-blouses" },
  // New arrivals
  { name: "MissYogi", type: "Saree", price: 8580, rating: 4.9, reviews: 45, badge: "NEW", image: "/images/saree-1.jpg", category: "saree", section: "new-arrivals" },
  { name: "Gymwho?", type: "Saree", price: 9300, rating: 5.0, reviews: 23, badge: "NEW", image: "/images/saree-2.jpg", category: "saree", section: "new-arrivals" },
  { name: "Stretchy Si", type: "Saree", price: 8580, rating: 4.8, reviews: 34, badge: "NEW", image: "/images/saree-3.jpg", category: "saree", section: "new-arrivals" },
  { name: "Dhyaan Diva", type: "Saree", price: 8580, rating: 4.9, reviews: 56, badge: "NEW", image: "/images/saree-4.jpg", category: "saree", section: "new-arrivals" },
  // Ready to wear
  { name: "Mehndi Hai Rtw", type: "Ready to Wear", price: 12944, rating: 4.9, reviews: 34, badge: "NEW", image: "/images/saree-5.jpg", category: "ready-to-wear", sizes: ["XS-S", "M-L"], section: "ready-to-wear" },
  { name: "Sangeet Hai Rtw", type: "Ready to Wear", price: 12944, rating: 5.0, reviews: 28, badge: "NEW", image: "/images/saree-6.jpg", category: "ready-to-wear", sizes: ["XS-S", "M-L"], section: "ready-to-wear" },
  { name: "Shadi Hai Rtw", type: "Ready to Wear", price: 12944, rating: 4.8, reviews: 42, badge: "NEW", image: "/images/saree-7.jpg", category: "ready-to-wear", sizes: ["XS-S", "M-L"], section: "ready-to-wear" },
  { name: "Raga Bhairavi Rtw", type: "Ready to Wear", price: 10698, rating: 4.9, reviews: 19, badge: "NEW", image: "/images/saree-8.jpg", category: "ready-to-wear", sizes: ["XL-XXL"], section: "ready-to-wear" },
];

const categories = [
  { name: "Saree", image: "/images/cat-saree.jpg", href: "#", kind: "circle" },
  { name: "Blouse", image: "/images/cat-blouse.jpg", href: "#", kind: "circle" },
  { name: "Pre Draped", image: "/images/cat-predraped.jpg", href: "#", kind: "circle" },
  { name: "Dresses", image: "/images/cat-dresses.jpg", href: "#", kind: "circle" },
  { name: "Lehenga", image: "/images/cat-lehenga.jpg", href: "#", kind: "circle" },
  { name: "Men", image: "/images/cat-men.jpg", href: "#", kind: "circle" },
  { name: "Combo", image: "/images/cat-combo.jpg", href: "#", kind: "circle" },
  { name: "ETHNIC DAY PICKS", image: "/images/saree-1.jpg", href: "#", kind: "featured" },
  { name: "EVERYDAY", image: "/images/blouse-1.jpg", href: "#", kind: "featured" },
  { name: "NON-PADDED BLOUSE", image: "/images/blouse-2.jpg", href: "#", kind: "featured" },
  { name: "PETTICOATS", image: "/images/saree-3.jpg", href: "#", kind: "featured" },
  { name: "FESTIVE DRAPES", image: "/images/saree-6.jpg", href: "#", kind: "featured" },
  { name: "MENS KURTA", image: "/images/cat-men.jpg", href: "#", kind: "featured" },
];

const testimonials = [
  { text: "This one is sooooo soft and the color is perfect ...", customer: "Kanchan T.", date: "4 November 2025", product: "Love Chess", rating: 5, image: "/images/testimonial-1.jpg" },
  { text: "Beautiful!", customer: "Greta", date: "5 November 2025", product: "Radiant Hunar", rating: 5, image: "/images/testimonial-2.jpg" },
  { text: '"The Saree That Stayed With Me All Day — ...', customer: "Aishwarya Manjalekar", date: "22 November 2025", product: "Oscar", rating: 5, image: "/images/testimonial-3.jpg" },
  { text: "Suta sarees are always comfortable to drape. Elegance and comfort ...", customer: "Jyoti S", date: "9 December 2025", product: "Jaloka", rating: 5, image: "/images/testimonial-4.jpg" },
  { text: "I wore this blouse with one of my old sarees and it completely transformed the look!", customer: "S", date: "11 December 2025", product: "Mukhesh", rating: 5, image: "/images/testimonial-1.jpg" },
  { text: "Lovely fabric. Saree fabric is like Butter it's mul cotton ...", customer: "Rekha Gupta", date: "11 December 2025", product: "Chocolate Frangipani", rating: 5, image: "/images/testimonial-2.jpg" },
];

const settings = {
  announcement_messages: [
    "EASY RETURN AND EXCHANGE",
    "Free shipping on orders above ₹5000",
    "Handcrafted by 17000+ artisans across India",
  ],
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
  press_logos: [
    "VOGUE INDIA",
    "Forbes",
    "FEMINA",
    "YOURSTORY",
    "moneycontrol",
    "LBB",
    "BW BUSINESSWORLD",
  ],
  section_titles: {
    "bestseller-sarees": "BESTSELLER SAREES",
    "bestseller-blouses": "BESTSELLER BLOUSES",
    "new-arrivals": "NEW ARRIVAL - SAREES",
    "ready-to-wear": "READY TO WEAR",
  },
};

module.exports = { products, categories, testimonials, settings };
