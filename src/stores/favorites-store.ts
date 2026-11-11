"use client";
/** État des cœurs, synchronisé avec les favoris MongoDB et les mutations en cours. */
import { create } from "zustand";

type FavoritesState = {
  ids: string[];
  hydrate: boolean;
  enCours: string[];
  initialiser: (ids: string[]) => void;
  basculer: (id: string) => boolean;
  definir: (id: string, actif: boolean) => void;
  commencer: (id: string) => boolean;
  terminer: (id: string) => void;
};

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  ids: [],
  hydrate: false,
  enCours: [],
  initialiser: (ids) =>
    set((s) => ({
      ids: [
        ...new Set([
          ...ids.filter((id) => !s.enCours.includes(id)),
          ...s.ids.filter((id) => s.enCours.includes(id)),
        ]),
      ],
      hydrate: true,
    })),
  basculer: (id) => {
    const present = get().ids.includes(id);
    set({ ids: present ? get().ids.filter((x) => x !== id) : [...get().ids, id] });
    return !present;
  },
  definir: (id, actif) =>
    set((s) => ({
      ids: actif ? [...new Set([...s.ids, id])] : s.ids.filter((x) => x !== id),
    })),
  commencer: (id) => {
    if (get().enCours.includes(id)) return false;
    set((s) => ({ enCours: [...s.enCours, id] }));
    return true;
  },
  terminer: (id) => set((s) => ({ enCours: s.enCours.filter((x) => x !== id) })),
}));
