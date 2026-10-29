import { createNoise2D, createNoise3D } from "simplex-noise";
import { mulberry32 } from "../presets";

/** Bruits déterministes (seed) pour les déformations procédurales. */
export const seededNoise3D = (seed: number) => createNoise3D(mulberry32(seed));
export const seededNoise2D = (seed: number) => createNoise2D(mulberry32(seed));
export { mulberry32 };
