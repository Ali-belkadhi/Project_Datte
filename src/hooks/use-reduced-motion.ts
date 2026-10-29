"use client";
import { useMediaQuery } from "./use-media-query";

/** true si l'utilisateur a demandé à réduire les animations (3D comprise). */
export const useReducedMotion = () => useMediaQuery("(prefers-reduced-motion: reduce)");
