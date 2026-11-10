"use client";
/**
 * Panier de DÉMONSTRATION — en mémoire uniquement (aucune persistance).
 * Hydraté une fois par <CartHydrator> avec le panier renvoyé par le service (module C).
 * TODO(module C) : remplacer par le panier serveur (LignePanier) + Server Actions.
 */
import { create } from "zustand";
import type { LignePanier } from "@/types/domain";

type CartState = {
  lignes: LignePanier[];
  hydrate: boolean;
  /** Incrémenté à chaque ajout : déclenche l'animation de l'icône panier. */
  pulse: number;
  initialiser: (lignes: LignePanier[]) => void;
  ajouter: (ligne: Omit<LignePanier, "id">) => void;
  majQuantite: (id: string, q: { quantiteGrammes?: number; quantiteUnites?: number }) => void;
  retirer: (id: string) => void;
  vider: () => void;
};

export const useCartStore = create<CartState>((set, get) => ({
  lignes: [],
  hydrate: false,
  pulse: 0,
  initialiser: (lignes) => {
    if (get().hydrate) return;
    set({ lignes, hydrate: true });
  },
  ajouter: (ligne) =>
    set((s) => {
      const existante = s.lignes.find((l) => l.produitId === ligne.produitId);
      if (existante) {
        return {
          pulse: s.pulse + 1,
          lignes: s.lignes.map((l) =>
            l.id === existante.id
              ? {
                  ...l,
                  quantiteGrammes: l.quantiteGrammes !== undefined ? l.quantiteGrammes + (ligne.quantiteGrammes ?? 0) : undefined,
                  quantiteUnites: l.quantiteUnites !== undefined ? l.quantiteUnites + (ligne.quantiteUnites ?? 0) : undefined,
                }
              : l,
          ),
        };
      }
      return { pulse: s.pulse + 1, lignes: [...s.lignes, { ...ligne, id: `lp-${ligne.produitId}-${s.pulse + 1}` }] };
    }),
  majQuantite: (id, q) => set((s) => ({ lignes: s.lignes.map((l) => (l.id === id ? { ...l, ...q } : l)) })),
  retirer: (id) => set((s) => ({ lignes: s.lignes.filter((l) => l.id !== id) })),
  vider: () => set({ lignes: [] }),
}));

/** Nombre d'articles (une ligne = un article). */
export const useCartCount = () => useCartStore((s) => s.lignes.length);
