"use client";
import { useEffect } from "react";
import type { LignePanier } from "@/types/domain";
import { useCartStore } from "@/stores/cart-store";
import { useFavoritesStore } from "@/stores/favorites-store";

/** Hydrate une seule fois les stores de démo avec les données renvoyées par les services. */
export function DemoHydrator({ panier, favoris }: { panier: LignePanier[]; favoris: string[] }) {
  const initPanier = useCartStore((s) => s.initialiser);
  const initFavoris = useFavoritesStore((s) => s.initialiser);
  useEffect(() => {
    initPanier(panier);
    initFavoris(favoris);
  }, [panier, favoris, initPanier, initFavoris]);
  return null;
}
