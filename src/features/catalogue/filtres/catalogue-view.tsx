"use client";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { NoResults } from "@/components/illustrations/empty-illustrations";
import { applyFiltres } from "@/lib/filtres-catalogue";
import type { ProduitAvecVendeur } from "@/types/domain";
import { ProductGrid } from "../produits/product-grid";
import { ActiveFilters } from "./active-filters";
import { FilterPanel } from "./filter-panel";
import { FilterSheet } from "./filter-sheet";
import { SortSelect } from "./sort-select";
import { useCatalogueFilters } from "./use-catalogue-filters";

const PAGE = 12;

/** Catalogue : filtres + tri en mémoire via l'URL, grille, « Charger plus », état vide illustré. */
export function CatalogueView({ items }: { items: ProduitAvecVendeur[] }) {
  const api = useCatalogueFilters();
  const [visibles, setVisibles] = useState(PAGE);
  const resultats = useMemo(() => {
    const parId = new Map(items.map((i) => [i.produit.id, i]));
    const filtres = applyFiltres(items.map((i) => i.produit), api.filtres).flatMap((p) => parId.get(p.id) ?? []);
    return api.filtres.vendeurVerifie ? filtres.filter((i) => i.vendeur.verifie) : filtres;
  }, [items, api.filtres]);

  return (
    <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
      <aside className="hidden lg:block" aria-label="Filtres">
        <div className="sticky top-24 max-h-[calc(100dvh-7rem)] overflow-y-auto pe-2">
          <FilterPanel api={api} />
        </div>
      </aside>
      <div className="min-w-0 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <FilterSheet api={api} resultats={resultats.length} />
          <p className="hidden text-sm text-muted-foreground lg:block" aria-live="polite">
            {resultats.length} produit{resultats.length > 1 ? "s" : ""}
          </p>
          <SortSelect value={api.filtres.tri} onChange={(v) => api.definir("tri", v)} />
        </div>
        <ActiveFilters api={api} />
        {resultats.length === 0 ? (
          <EmptyState
            illustration={<NoResults />}
            titre="Aucune datte ne correspond"
            texte="Élargissez la fourchette de prix ou retirez un filtre : nos palmeraies ont sûrement ce qu'il vous faut."
            action={<Button onClick={api.reinitialiser}>Réinitialiser les filtres</Button>}
          />
        ) : (
          <>
            <ProductGrid items={resultats.slice(0, visibles)} colonnes={3} />
            {visibles < resultats.length && (
              <div className="flex justify-center pt-4">
                <Button variant="outline" size="lg" onClick={() => setVisibles((v) => v + PAGE)}>
                  Charger plus ({resultats.length - visibles})
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
