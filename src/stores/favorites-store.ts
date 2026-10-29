"use client";
/** Favoris de DÉMONSTRATION — en mémoire uniquement. TODO(module B) : Favori + basculerFavori(). */
import { create } from "zustand";

type FavoritesState = {
  ids: string[];
  hydrate: boolean;
  initialiser: (ids: string[]) => void;
  basculer: (id: string) => boolean;
};

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  ids: [],
  hydrate: false,
  initialiser: (ids) => {
    if (!get().hydrate) set({ ids, hydrate: true });
  },
  basculer: (id) => {
    const present = get().ids.includes(id);
    set({ ids: present ? get().ids.filter((x) => x !== id) : [...get().ids, id] });
    return !present;
  },
}));
