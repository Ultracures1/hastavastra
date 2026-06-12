import { useState } from "react";
import { Star, Eye } from "lucide-react";
import { Heart } from "lucide-react";
import type { Product } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();

  const badgeColors = {
    BESTSELLER: "bg-charcoal text-paper",
    TOP_RATED: "bg-ochre text-paper",
    NEW: "bg-sage text-paper",
  };

  return (
    <div
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative overflow-hidden rounded-[20px] bg-paper aspect-[3/4]">
        <img
          src={product.image}
          alt={product.name}
          className={`w-full h-full object-cover transition-transform duration-500 ${
            isHovered ? "scale-105" : "scale-100"
          }`}
          loading="lazy"
        />

        {/* Badge */}
        {product.badge && (
          <span
            className={`absolute top-3 left-3 px-2.5 py-1 text-[10px] uppercase tracking-[1px] font-sans font-medium ${
              badgeColors[product.badge]
            }`}
          >
            {product.badge.replace("_", " ")}
          </span>
        )}

        {/* Wishlist */}
        <button
          onClick={() => toggleWishlist(product.id)}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-paper/80 flex items-center justify-center transition-all duration-300 hover:bg-paper"
        >
          <Heart
            size={16}
            className={`transition-colors ${
              isWishlisted(product.id)
                ? "fill-red-500 text-red-500"
                : "text-charcoal"
            }`}
          />
        </button>

        {/* Rating Overlay */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-paper/90 px-2 py-1 rounded-full">
          <Star size={12} className="fill-ochre text-ochre" />
          <span className="text-[11px] font-sans font-medium text-charcoal">
            {product.rating}
          </span>
          <span className="text-[11px] font-sans text-softgrey">
            ({product.reviews})
          </span>
        </div>

        {/* Quick View */}
        <div
          className={`absolute bottom-3 right-3 flex items-center gap-1 bg-paper/90 px-2 py-1 rounded-full transition-opacity duration-300 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        >
          <Eye size={12} className="text-charcoal" />
          <span className="text-[11px] font-sans text-charcoal">view</span>
        </div>

        {/* Shop Now Button */}
        <div
          className={`absolute bottom-0 left-0 right-0 transition-transform duration-300 ${
            isHovered ? "translate-y-0" : "translate-y-full"
          }`}
        >
          <button
            onClick={() => addToCart(product)}
            className="w-full bg-charcoal text-paper py-3 text-xs uppercase tracking-[2px] font-sans font-medium hover:bg-ochre transition-colors"
          >
            Shop Now
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="mt-3 space-y-1.5">
        <h3 className="text-charcoal text-sm uppercase font-sans font-medium tracking-wide">
          {product.name}
        </h3>
        <span className="inline-block text-[11px] text-softgrey font-sans border border-softgrey/30 px-2 py-0.5">
          {product.type}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-ochre text-sm font-sans font-semibold">
            &#x20B9; {product.price.toLocaleString("en-IN")}.00
          </span>
          {product.originalPrice && (
            <span className="text-softgrey text-sm font-sans line-through">
              &#x20B9; {product.originalPrice.toLocaleString("en-IN")}.00
            </span>
          )}
        </div>
        {product.sizes && (
          <div className="flex items-center gap-1 flex-wrap">
            {product.sizes.map((size, i) => (
              <span key={size} className="text-[11px] text-softgrey font-sans">
                {size}
                {i < product.sizes!.length - 1 && (
                  <span className="mx-1 text-softgrey/50">|</span>
                )}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
