"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface UIState {
  cartOpen: boolean;
  searchOpen: boolean;
  menuOpen: boolean;
  /** Short-lived toast message (e.g. "Ajouté au panier") */
  toast: { id: number; message: string } | null;
  openCart: () => void;
  closeCart: () => void;
  setSearchOpen: (open: boolean) => void;
  setMenuOpen: (open: boolean) => void;
  showToast: (message: string) => void;
  dismissToast: () => void;
}

export const useUIStore = create<UIState>()((set) => ({
  cartOpen: false,
  searchOpen: false,
  menuOpen: false,
  toast: null,
  openCart: () => set({ cartOpen: true, searchOpen: false, menuOpen: false }),
  closeCart: () => set({ cartOpen: false }),
  setSearchOpen: (searchOpen) => set({ searchOpen, menuOpen: false }),
  setMenuOpen: (menuOpen) => set({ menuOpen }),
  showToast: (message) => set({ toast: { id: Date.now(), message } }),
  dismissToast: () => set({ toast: null }),
}));

interface WishlistState {
  ids: string[];
  toggle: (id: string) => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set) => ({
      ids: [],
      toggle: (id) =>
        set((s) => ({ ids: s.ids.includes(id) ? s.ids.filter((x) => x !== id) : [...s.ids, id] })),
    }),
    { name: "degla-wishlist", storage: createJSONStorage(() => localStorage) },
  ),
);
