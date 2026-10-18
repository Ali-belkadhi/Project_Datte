"use client";

import { useState } from "react";
import Image from "next/image";
import { Check, Heart, ShieldCheck, ShoppingBag, Star, Truck } from "lucide-react";
import type { Product } from "@/types";
import { formatPrice, cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import { useWishlistStore, useUIStore } from "@/store/ui-store";
import { QuantityStepper } from "@/components/cart/cart-line-item";
import { Product3DViewer } from "@/components/three/product-3d-viewer";
import { Button } from "@/components/ui/button";

export function ProductDetailClient({ product }: { product: Product }) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [viewMode, setViewMode] = useState<"photos" | "3d">("photos");
  const [quantity, setQuantity] = useState(1);

  const addItem = useCartStore((s) => s.addItem);
  const { toggle, ids } = useWishlistStore();
  const showToast = useUIStore((s) => s.showToast);
  const openCart = useUIStore((s) => s.openCart);

  const isWishlisted = ids.includes(product.id);

  const handleAddToCart = () => {
    addItem(product, quantity);
    showToast(`${quantity} × ${product.name} ajouté au panier`);
    openCart();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
      {/* Left: Gallery / 3D Viewer (7 cols) */}
      <div className="lg:col-span-7 flex flex-col gap-4">
        {/* Toggle between Photos and 3D View */}
        <div className="flex items-center gap-2 self-start rounded-full border border-forest/15 bg-cream-50 p-1">
          <button
            type="button"
            onClick={() => setViewMode("photos")}
            className={cn(
              "rounded-full px-4 py-1.5 text-xs font-semibold transition-colors",
              viewMode === "photos" ? "bg-forest text-cream shadow-xs" : "text-forest hover:bg-beige/40"
            )}
          >
            Galerie Photos
          </button>
          <button
            type="button"
            onClick={() => setViewMode("3d")}
            className={cn(
              "rounded-full px-4 py-1.5 text-xs font-semibold transition-colors",
              viewMode === "3d" ? "bg-forest text-cream shadow-xs" : "text-forest hover:bg-beige/40"
            )}
          >
            Expérience 3D (360°)
          </button>
        </div>

        {/* Main Display Area */}
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl bg-sand/30 border border-forest/10 shadow-sm">
          {viewMode === "photos" ? (
            <div className="relative h-full w-full">
              <Image
                src={product.images[selectedImage]?.src ?? product.images[0]?.src}
                alt={product.images[selectedImage]?.alt ?? product.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover"
              />
            </div>
          ) : (
            <Product3DViewer
              config={product.viewer}
              fallbackImage={product.images[0]?.src}
              fallbackAlt={product.name}
              showPedestal={true}
              showDates={true}
              showGold={true}
              autoRotate={true}
              floating={true}
              className="h-full w-full"
            />
          )}
        </div>

        {/* Thumbnails */}
        {viewMode === "photos" && product.images.length > 1 && (
          <div className="flex items-center gap-3 overflow-x-auto pb-2">
            {product.images.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedImage(idx)}
                className={cn(
                  "relative size-20 shrink-0 overflow-hidden rounded-xl border-2 transition-all",
                  selectedImage === idx ? "border-forest shadow-md scale-105" : "border-forest/15 opacity-70 hover:opacity-100"
                )}
              >
                <Image src={img.src} alt={img.alt} fill sizes="80px" className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right: Product Details & Purchase Actions (5 cols) */}
      <div className="lg:col-span-5 flex flex-col">
        {/* Badges */}
        <div className="flex items-center gap-2">
          {product.badges.map((b) => (
            <span
              key={b}
              className="rounded-full bg-forest/10 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-wider text-forest"
            >
              {b}
            </span>
          ))}
          <span className="text-xs text-muted ml-auto">Poids : {product.weight}</span>
        </div>

        <h1 className="mt-3 font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-forest leading-tight">
          {product.name}
        </h1>
        <p className="mt-1 text-sm text-muted">{product.subtitle}</p>

        {/* Rating */}
        <div className="mt-4 flex items-center gap-2">
          <div className="flex text-gold">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "size-4",
                  i < Math.floor(product.rating.average) ? "fill-gold text-gold" : "text-forest/20"
                )}
              />
            ))}
          </div>
          <span className="text-sm font-semibold text-forest">{product.rating.average}</span>
          <span className="text-xs text-muted">({product.rating.count} avis vérifiés)</span>
        </div>

        {/* Price */}
        <div className="mt-6 flex items-baseline gap-3">
          <span className="font-serif text-3xl sm:text-4xl font-semibold text-forest">
            {formatPrice(product.price)}
          </span>
          {product.compareAtPrice && (
            <span className="text-base text-muted line-through">
              {formatPrice(product.compareAtPrice)}
            </span>
          )}
        </div>

        {/* Long description */}
        <p className="mt-6 text-sm sm:text-base text-ink/80 leading-relaxed">
          {product.description}
        </p>

        {/* Features / Highlights */}
        {product.features.length > 0 && (
          <ul className="mt-6 space-y-2 border-y border-forest/10 py-4">
            {product.features.map((feat) => (
              <li key={feat} className="flex items-center gap-2.5 text-xs sm:text-sm font-medium text-forest">
                <Check className="size-4 text-gold" />
                {feat}
              </li>
            ))}
          </ul>
        )}

        {/* Box contents if present */}
        {product.contents && (
          <div className="mt-4 rounded-2xl bg-sand/30 p-4 border border-forest/10">
            <h4 className="font-serif text-base font-semibold text-forest mb-2">Contenu du coffret :</h4>
            <ul className="list-disc list-inside space-y-1 text-xs text-ink/80">
              {product.contents.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Quantity & Add to Cart */}
        <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">Quantité</span>
            <QuantityStepper
              value={quantity}
              onChange={setQuantity}
              max={product.stock}
              size="lg"
            />
          </div>

          <Button
            size="lg"
            onClick={handleAddToCart}
            className="flex-1 rounded-full bg-forest text-cream hover:bg-forest-700 py-6 text-base font-semibold shadow-md flex items-center justify-center gap-2"
          >
            <ShoppingBag className="size-5" /> Ajouter au panier
          </Button>

          <button
            type="button"
            aria-label={isWishlisted ? "Retirer des favoris" : "Ajouter aux favoris"}
            onClick={() => toggle(product.id)}
            className="flex size-12 shrink-0 items-center justify-center rounded-full border border-forest/20 text-forest hover:bg-beige/40 transition-colors"
          >
            <Heart className={cn("size-5", isWishlisted && "fill-destructive text-destructive")} />
          </button>
        </div>

        {/* Reassurance */}
        <div className="mt-8 grid grid-cols-2 gap-4 border-t border-forest/10 pt-6">
          <div className="flex items-center gap-3">
            <Truck className="size-5 text-gold shrink-0" />
            <span className="text-xs text-ink/75">Livraison rapide partout en Tunisie</span>
          </div>
          <div className="flex items-center gap-3">
            <ShieldCheck className="size-5 text-gold shrink-0" />
            <span className="text-xs text-ink/75">Garantie 100% naturel & authentique</span>
          </div>
        </div>
      </div>
    </div>
  );
}
