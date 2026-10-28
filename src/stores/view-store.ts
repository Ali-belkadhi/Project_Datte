"use client";
/** État du DevViewSwitcher (démo) — à supprimer quand l'authentification sera branchée. */
import { create } from "zustand";

type ViewState = { ouvert: boolean; basculer: () => void; fermer: () => void };

export const useViewStore = create<ViewState>((set) => ({
  ouvert: false,
  basculer: () => set((s) => ({ ouvert: !s.ouvert })),
  fermer: () => set({ ouvert: false }),
}));
