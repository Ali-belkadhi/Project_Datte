"use client";
import { useSyncExternalStore } from "react";
import { THEME_STORAGE_KEY as KEY } from "@/config/theme";

export type ThemeChoice = "system" | "light" | "dark";
const listeners = new Set<() => void>();

function lire(): ThemeChoice {
  try {
    const v = localStorage.getItem(KEY);
    return v === "light" || v === "dark" ? v : "system";
  } catch {
    return "system";
  }
}

function appliquer(choice: ThemeChoice) {
  const sombre = choice === "dark" || (choice === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", sombre);
  document.documentElement.style.colorScheme = sombre ? "dark" : "light";
}

export function setTheme(choice: ThemeChoice) {
  try {
    if (choice === "system") localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, choice);
  } catch {
    /* stockage indisponible : le choix vaut pour la session */
  }
  appliquer(choice);
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const mql = window.matchMedia("(prefers-color-scheme: dark)");
  const onChange = () => {
    if (lire() === "system") appliquer("system");
    cb();
  };
  mql.addEventListener("change", onChange);
  return () => {
    listeners.delete(cb);
    mql.removeEventListener("change", onChange);
  };
}

/** Thème choisi (Système / Clair / Sombre) et thème résolu. */
export function useTheme() {
  const theme = useSyncExternalStore(subscribe, lire, () => "system" as ThemeChoice);
  const resolved = useSyncExternalStore(
    subscribe,
    () => (document.documentElement.classList.contains("dark") ? "dark" : "light"),
    () => "light" as const,
  );
  return { theme, resolvedTheme: resolved, setTheme };
}

