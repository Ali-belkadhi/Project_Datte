"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PalmIcon } from "@/components/layout/logo";
import { ProductCard } from "@/components/products/product-card";
import type { Product } from "@/types";

export function BestSellers({ products }: { products: Product[] }) {
  return (
    <section className="relative w-full py-16 lg:py-24 bg-cream">
      <div className="container-lux">
        {/* Header with Palm Icon and "Voir tout" button */}
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row mb-12">
          <div className="flex flex-col items-center md:items-start text-center md:text-left mx-auto md:mx-0">
            <PalmIcon className="size-7 text-forest" />
            <h2 className="mt-2 font-serif text-3xl sm:text-4xl font-semibold tracking-wide text-forest uppercase">
              Nos Meilleures Ventes
            </h2>
          </div>

          <Link
            href="/produits"
            className="flex items-center gap-1.5 rounded-full border border-forest/20 bg-cream-50 px-5 py-2 text-xs font-semibold uppercase tracking-wider text-forest transition-colors hover:border-gold hover:text-gold-dark"
          >
            Voir tout <ArrowRight className="size-3.5" />
          </Link>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.slice(0, 4).map((product, idx) => (
            <ProductCard key={product.id} product={product} priority={idx === 0} />
          ))}
        </div>
      </div>
    </section>
  );
}
