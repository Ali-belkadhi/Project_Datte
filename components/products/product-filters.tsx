"use client";

import { useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { allCategories } from "@/data/products";
import type { CategorySlug, SortOption } from "@/types";
import { cn } from "@/lib/utils";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "pertinence", label: "Pertinence" },
  { value: "prix-asc", label: "Prix croissant" },
  { value: "prix-desc", label: "Prix décroissant" },
  { value: "nouveautes", label: "Nouveautés" },
  { value: "note", label: "Meilleures notes" },
];

export function ProductFiltersBar({
  currentCategory,
  currentSort,
  totalCount,
}: {
  currentCategory?: string;
  currentSort?: string;
  totalCount: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const handleCategoryChange = (slug: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (slug === "all") {
      params.delete("categorie");
    } else {
      params.set("categorie", slug);
    }
    startTransition(() => {
      router.push(`/produits?${params.toString()}`);
    });
  };

  const handleSortChange = (sort: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tri", sort);
    startTransition(() => {
      router.push(`/produits?${params.toString()}`);
    });
  };

  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between border-b border-forest/10 pb-6 mb-8">
      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 md:pb-0">
        <button
          type="button"
          onClick={() => handleCategoryChange("all")}
          className={cn(
            "rounded-full px-4 py-2 text-xs font-semibold whitespace-nowrap transition-colors",
            !currentCategory
              ? "bg-forest text-cream shadow-sm"
              : "bg-cream-50/80 text-forest border border-forest/15 hover:border-gold"
          )}
        >
          Tous les produits ({totalCount})
        </button>

        {allCategories.map((c) => (
          <button
            key={c.slug}
            type="button"
            onClick={() => handleCategoryChange(c.slug)}
            className={cn(
              "rounded-full px-4 py-2 text-xs font-semibold whitespace-nowrap transition-colors",
              currentCategory === c.slug
                ? "bg-forest text-cream shadow-sm"
                : "bg-cream-50/80 text-forest border border-forest/15 hover:border-gold"
            )}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Sort Select */}
      <div className="flex items-center gap-2 self-end md:self-auto">
        <label htmlFor="sort-select" className="text-xs font-medium text-muted whitespace-nowrap">
          Trier par :
        </label>
        <select
          id="sort-select"
          value={currentSort || "pertinence"}
          onChange={(e) => handleSortChange(e.target.value)}
          className="rounded-full border border-forest/20 bg-cream-50 px-3.5 py-1.5 text-xs font-medium text-forest focus:border-gold focus:outline-none"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
