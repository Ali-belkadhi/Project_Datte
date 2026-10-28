"use client";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerClose, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { FilterPanel } from "./filter-panel";
import type { CatalogueFiltersApi } from "./use-catalogue-filters";

/** Mobile : bouton « Filtres (3) » qui ouvre un Drawer (bottom sheet) avec « Voir N produits ». */
export function FilterSheet({ api, resultats }: { api: CatalogueFiltersApi; resultats: number }) {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline" className="lg:hidden">
          <SlidersHorizontal aria-hidden />
          Filtres{api.nombreActifs > 0 ? ` (${api.nombreActifs})` : ""}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="flex-row items-center justify-between">
          <DrawerTitle className="font-display text-xl">Filtres</DrawerTitle>
          {api.nombreActifs > 0 && (
            <button type="button" onClick={api.reinitialiser} className="text-sm font-semibold text-date">
              Tout effacer
            </button>
          )}
        </DrawerHeader>
        <div className="overflow-y-auto px-4 pb-2">
          <FilterPanel api={api} idPrefix="fm" />
        </div>
        <DrawerFooter className="border-t pb-[calc(1rem+env(safe-area-inset-bottom))]">
          <DrawerClose asChild>
            <Button variant="brand" size="lg">
              Voir {resultats} produit{resultats > 1 ? "s" : ""}
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
