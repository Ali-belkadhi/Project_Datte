import { cn } from "@/lib/utils";
import type { ProduitAvecVendeur } from "@/types/domain";
import { ProductCard } from "@/components/shared/product-card";

/** Grille : 2 colonnes sur mobile, 3 sur tablette, 4 sur desktop. */
export function ProductGrid({ items, className, colonnes = 4 }: { items: ProduitAvecVendeur[]; className?: string; colonnes?: 3 | 4 }) {
  return (
    <ul className={cn("grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4", colonnes === 4 && "xl:grid-cols-4", className)}>
      {items.map((item) => (
        <li key={item.produit.id} className="flex">
          <ProductCard item={item} className="w-full" />
        </li>
      ))}
    </ul>
  );
}
