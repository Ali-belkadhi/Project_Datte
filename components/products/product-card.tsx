"use client";

import Link from "next/link";
import { Heart, ShoppingBag, Star } from "lucide-react";
import type { Product } from "@/types";
import { formatPrice, cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import { useWishlistStore, useUIStore } from "@/store/ui-store";
import { ProductMedia } from "./product-media";
import { motion } from "motion/react";

interface ProductCardProps {
  product: Product;
  priority?: boolean;
  className?: string;
}

export function ProductCard({ product, priority = false, className }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const { toggle, ids } = useWishlistStore();
  const showToast = useUIStore((s) => s.showToast);
  const isWishlisted = ids.includes(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
    showToast(`${product.name} ajouté au panier`);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(product.id);
  };

  return (
    <motion.article
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl bg-cream-50/70 border border-forest/10 p-4 transition-shadow hover:shadow-card hover:border-gold/30",
        className
      )}
    >
      {/* Top Image area */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-forest/5">
        <Link href={`/produits/${product.slug}`} className="block h-full w-full">
          <ProductMedia
            src={product.images[0]?.src ?? "/images/products/coffret-prestige-open.jpg"}
            alt={product.images[0]?.alt ?? product.name}
            priority={priority}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="h-full w-full"
            imgClassName="group-hover:scale-105 transition-transform duration-500"
          />
        </Link>

        {/* Badges */}
        {product.badges.length > 0 && (
          <span className="absolute left-2.5 top-2.5 rounded-full bg-forest/80 px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wider text-cream backdrop-blur-xs">
            {product.badges[0]}
          </span>
        )}

        {/* Wishlist button */}
        <button
          type="button"
          aria-label={isWishlisted ? "Retirer des favoris" : "Ajouter aux favoris"}
          onClick={handleToggleWishlist}
          className="absolute right-2.5 top-2.5 flex size-8 items-center justify-center rounded-full bg-cream-50/80 text-forest backdrop-blur transition-transform hover:scale-110"
        >
          <Heart className={cn("size-4", isWishlisted && "fill-destructive text-destructive")} />
        </button>
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col pt-4">
        <Link href={`/produits/${product.slug}`} className="group-hover:text-gold-dark transition-colors">
          <h3 className="font-serif text-xl font-medium text-forest">{product.name}</h3>
        </Link>
        <p className="mt-1 text-xs text-muted line-clamp-1">{product.subtitle}</p>

        {/* Rating */}
        <div className="mt-2.5 flex items-center gap-1.5 text-xs text-muted">
          <div className="flex text-gold">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "size-3",
                  i < Math.floor(product.rating.average)
                    ? "fill-gold text-gold"
                    : "text-forest/20"
                )}
              />
            ))}
          </div>
          <span className="font-medium text-forest">({product.rating.count})</span>
        </div>

        {/* Bottom row: Price & Add to Cart button */}
        <div className="mt-auto flex items-center justify-between pt-4">
          <div className="flex flex-col">
            <span className="font-serif text-xl font-semibold text-forest">
              {formatPrice(product.price)}
            </span>
            {product.compareAtPrice && (
              <span className="text-xs text-muted line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </div>

          <button
            type="button"
            aria-label={`Ajouter ${product.name} au panier`}
            onClick={handleAddToCart}
            className="flex size-10 items-center justify-center rounded-full bg-forest text-cream transition-all duration-300 hover:bg-gold hover:scale-105 active:scale-95 shadow-sm"
          >
            <ShoppingBag className="size-4" />
          </button>
        </div>
      </div>
    </motion.article>
  );
}
