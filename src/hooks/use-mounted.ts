"use client";
import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/** true après l'hydratation (évite les écarts serveur / client). */
export function useMounted() {
  return useSyncExternalStore(subscribe, () => true, () => false);
}
