"use client";
import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProduitAvecVendeur } from "@/types/domain";
import { ProductCard } from "@/components/shared/product-card";

/** Carrousel horizontal (scroll-snap) de ProductCard, flèches sur desktop. */
export function ProductCarousel({ items, className, label = "Produits" }: { items: ProduitAvecVendeur[]; className?: string; label?: string }) {
  const ref = useRef<HTMLUListElement>(null);
  const defiler = (sens: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    const dir = getComputedStyle(el).direction === "rtl" ? -1 : 1;
    el.scrollBy({ left: sens * dir * el.clientWidth * 0.8, behavior: "smooth" });
  };
  return (
    <div className={cn("relative", className)}>
      <ul
        ref={ref}
        aria-label={label}
        className="scrollbar-none -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-4 pb-2 md:-mx-6 md:gap-4 md:px-6"
      >
        {items.map((item) => (
          <li key={item.produit.id} className="flex w-[46%] shrink-0 snap-start sm:w-[32%] lg:w-[23.5%]">
            <ProductCard item={item} className="w-full" />
          </li>
        ))}
      </ul>
      <div className="pointer-events-none absolute inset-y-0 -inset-x-5 hidden items-center justify-between lg:flex">
        {[-1, 1].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => defiler(s as 1 | -1)}
            className="pointer-events-auto grid size-11 place-items-center rounded-full border bg-card shadow-soft transition-colors hover:bg-accent"
            aria-label={s < 0 ? "Précédent" : "Suivant"}
          >
            {s < 0 ? <ChevronLeft className="size-5 rtl:rotate-180" /> : <ChevronRight className="size-5 rtl:rotate-180" />}
          </button>
        ))}
      </div>
    </div>
  );
}
