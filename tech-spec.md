# Suta E-Commerce — Technical Specification

## Dependencies

| Package | Version | Purpose |
|---|---|---|
| react | ^18.3.0 | UI framework |
| react-dom | ^18.3.0 | DOM renderer |
| typescript | ^5.6.0 | Type safety |
| vite | ^6.0.0 | Build tool |
| tailwindcss | ^3.4.0 | Utility CSS |
| gsap | ^3.12.0 | Animation engine + ScrollTrigger plugin |
| lenis | ^1.1.0 | Smooth inertia scrolling |
| lucide-react | ^0.460.0 | Icon library (heart, search, cart, arrows, etc.) |
| clsx | ^2.1.0 | Conditional class names |
| tailwind-merge | ^2.6.0 | Tailwind class deduplication |

**Dev dependencies:** @types/react, @types/react-dom, autoprefixer, postcss

**Fonts (Google Fonts CDN in index.html):** Playfair Display, Inter, Space Mono

---

## Component Inventory

### Layout Components
| Component | Source | Notes |
|---|---|---|
| AnnouncementBar | Custom | Rotating text strip, auto-crossfade |
| Header | Custom | Sticky nav with logo, links, utility icons |
| CategoryTabs | Custom | Secondary sticky tab bar |
| Footer | Custom | 4-column grid, newsletter, social links |

### Section Components
| Component | Source | Notes |
|---|---|---|
| HeroSection | Custom | Split layout, 3D parallax image, fabric scroll rotation |
| Marquee | Custom | Infinite CSS scroll ticker |
| BrandStatement | Custom | Centered "Dipped in Love" text |
| CategoryCircles | Custom | Horizontal row of 7 circular image links |
| ProductSection | Custom | Reusable for Bestseller Sarees, Blouses, New Arrivals, Ready to Wear |
| PromoBanner | Custom | Full-width image banner with overlay text + CTA |
| SizeSelector | Custom | Horizontal scrollable size cards |
| FeaturedCategories | Custom | 3x2 image grid with overlay labels |
| Testimonials | Custom | Carousel with 4 visible cards |
| FeaturedIn | Custom | Media logo row |

### Reusable Components
| Component | Source | Used By |
|---|---|---|
| ProductCard | Custom | ProductSection (all instances) |
| SectionTitle | Custom | All product sections |
| ScrollReveal | Custom | Wrapper for GSAP scroll-triggered fade-in |

### Hooks
| Hook | Purpose |
|---|---|
| useMousePosition | Tracks normalized mouse coords for hero parallax |
| useScrollProgress | Returns 0-1 scroll progress for a ref target |
| useLenis | Initializes and exposes Lenis instance globally |

---

## Animation Implementation Table

| Animation | Library | Approach | Complexity |
|---|---|---|---|
| Announcement bar crossfade | CSS + React state | opacity transition, setInterval rotation | Low |
| Nav underline hover | CSS | `scaleX(0→1)` transform-origin transition | Low |
| Category tab active border | CSS | Bottom border + font-weight toggle | Low |
| **Hero 3D image parallax** | **GSAP + custom rAF** | rAF loop with lerp, transform: translate + rotateX/Y | **High** |
| **Hero fabric scroll rotation** | **GSAP ScrollTrigger** | scrub-linked rotateY: 0→360 | **High** |
| Marquee infinite scroll | CSS animation | translateX keyframes, duplicated content for seamless loop | Medium |
| Section title fade-in | GSAP ScrollTrigger | batch staggered opacity+y tween on scroll enter | Medium |
| Product card stagger | GSAP ScrollTrigger | staggered opacity+y on grid children | Medium |
| Product card hover (image scale + button) | CSS | transform: scale + translateY transitions | Low |
| Category circle hover | CSS | transform: scale + border-width transition | Low |
| Size card hover/active | CSS | border-color + background-color transition | Low |
| Featured category hover | CSS | image scale + overlay lighten | Low |
| Testimonial carousel | React state | translateX container, prev/next buttons | Medium |
| Featured In logo hover | CSS | opacity transition 50%→100% | Low |
| Button dual-hover | CSS | ::before + ::after pseudo-elements slide up | Medium |
| Page load hero entrance | GSAP | scale+opacity timeline with stagger | Medium |
| Lenis smooth scroll | Lenis | Global instance, integrate with GSAP ticker | Medium |

---

## State & Logic Plan

### Global State (React Context)
- **CartContext**: Cart items array, add/remove/update quantity, item count badge
- **WishlistContext**: Wishlist product IDs array, toggle, heart icon state

### Local Component State
- **AnnouncementBar**: Current message index, hover pause flag
- **Header**: Scrolled flag (adds bottom border after scroll > 60px)
- **CategoryTabs**: Active tab index
- **Testimonials**: Current slide index, translateX offset
- **SizeSelector**: Active size
- **ProductCard**: Hover state, quick-view toggle

### Data Flow
- Product data lives in a static TypeScript array (no backend)
- Cart/wishlist contexts wrap the app at root level
- All sections read from shared product data, filtered by category/tag

---

## Other Key Decisions

### Image Strategy
- All product/category/testimonial images generated via AI image generation
- Stored in `/public/images/` with descriptive filenames
- Hero images use CSS `perspective: 1000px` on container for 3D effect

### No Backend
- Pure frontend e-commerce showcase
- Cart/wishlist stored in React state (volatile — resets on refresh, acceptable for demo)
- Product data hardcoded in a data file

### Mobile Breakpoints
- Desktop: > 1024px (full layout)
- Tablet: 768px–1024px (2-col grids, simplified hero)
- Mobile: < 768px (single col, hamburger nav, hidden fabric rotation)

### Performance
- `gsap.ticker.lagSmoothing(0)` set for Lenis + ScrollTrigger compatibility
- Images lazy-loaded via `loading="lazy"` attribute
- CSS `will-change: transform` on parallax elements
