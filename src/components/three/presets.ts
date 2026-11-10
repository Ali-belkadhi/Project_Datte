/**
 * Préréglages visuels par variété et par produit — MODULE B (Ali Belkathi).
 * Source unique partagée par la 3D (React Three Fiber) et les illustrations SVG.
 * C'est le SEUL fichier autorisé à contenir des couleurs codées en dur (voir docs/design-system.md).
 * Aucune dépendance à three.js ici : le fichier est importé par les illustrations côté serveur.
 */
import type { VarieteSlug } from "@/types/model-source";

export type DateShapePreset = {
  length: number; // demi-hauteur
  radius: number; // rayon max
  taper: number; // affinement vers le haut (0..0.3)
  wrinkle: number; // amplitude des rides (0..0.08)
  wrinkleFreq: number;
};

export type DateMaterialPreset = {
  roughness: number;
  clearcoat: number;
  clearcoatRoughness?: number;
  transmission?: number;
  thickness?: number;
  attenuationColor?: string;
  sheen?: number;
  sheenColor?: string;
};

export type VarietyPreset = {
  nom: string;
  color: string;
  shape: DateShapePreset;
  material: DateMaterialPreset;
};

export const VARIETY_PRESETS: Record<VarieteSlug, VarietyPreset> = {
  "deglet-nour": {
    nom: "Deglet Nour",
    color: "#C98A3E",
    shape: { length: 0.62, radius: 0.25, taper: 0.18, wrinkle: 0.012, wrinkleFreq: 5 },
    material: { roughness: 0.32, clearcoat: 0.9, clearcoatRoughness: 0.25, transmission: 0.18, thickness: 0.6, attenuationColor: "#B8701F", sheen: 0.3, sheenColor: "#E8B670" },
  },
  medjool: {
    nom: "Medjool",
    color: "#5A2E1A",
    shape: { length: 0.7, radius: 0.34, taper: 0.08, wrinkle: 0.06, wrinkleFreq: 4.2 },
    material: { roughness: 0.55, clearcoat: 0.35, clearcoatRoughness: 0.5, sheen: 0.5, sheenColor: "#8A5212" },
  },
  alig: {
    nom: "Alig",
    color: "#3E2016",
    shape: { length: 0.66, radius: 0.24, taper: 0.12, wrinkle: 0.03, wrinkleFreq: 5.5 },
    material: { roughness: 0.45, clearcoat: 0.6, clearcoatRoughness: 0.35 },
  },
  kenta: {
    nom: "Kenta",
    color: "#A86A2E",
    shape: { length: 0.52, radius: 0.24, taper: 0.1, wrinkle: 0.02, wrinkleFreq: 5 },
    material: { roughness: 0.4, clearcoat: 0.7, clearcoatRoughness: 0.3 },
  },
  "khouat-alig": {
    nom: "Khouat Alig",
    color: "#4A2818",
    shape: { length: 0.6, radius: 0.25, taper: 0.12, wrinkle: 0.035, wrinkleFreq: 5.2 },
    material: { roughness: 0.5, clearcoat: 0.5, clearcoatRoughness: 0.35 },
  },
  bessr: {
    nom: "Bessr",
    color: "#D8B04A",
    shape: { length: 0.5, radius: 0.27, taper: 0.06, wrinkle: 0.004, wrinkleFreq: 4 },
    material: { roughness: 0.25, clearcoat: 1, clearcoatRoughness: 0.15 },
  },
  lemsi: {
    nom: "Lemsi",
    color: "#7B4A22",
    shape: { length: 0.55, radius: 0.26, taper: 0.1, wrinkle: 0.03, wrinkleFreq: 5 },
    material: { roughness: 0.5, clearcoat: 0.5, clearcoatRoughness: 0.35 },
  },
  kentichi: {
    nom: "Kentichi",
    color: "#B98B4F",
    shape: { length: 0.5, radius: 0.22, taper: 0.1, wrinkle: 0.025, wrinkleFreq: 6 },
    material: { roughness: 0.75, clearcoat: 0.1, clearcoatRoughness: 0.6 },
  },
};

/** Ordre d'affichage des variétés (vitrine, filtres). */
export const VARIETY_ORDER: VarieteSlug[] = [
  "deglet-nour",
  "medjool",
  "alig",
  "kenta",
  "khouat-alig",
  "bessr",
  "lemsi",
  "kentichi",
];

/** Matières partagées 3D / SVG. */
export const MATERIALS = {
  calyx: "#C9A46A", // calice paille
  stem: "#C98A3E", // tige de régime
  stemDark: "#9C6A2E",
  terracotta: "#B5643C",
  terracottaDark: "#8E4A2B",
  kraft: "#C9A577",
  kraftDark: "#A9865A",
  kraftLight: "#E2C9A0",
  label: "#F7EEDF",
  labelInk: "#2B1A12",
  labelAccent: "#B8701F",
  metal: "#B9B2A6",
  glass: "#FFFFFF",
  floorLight: "#F3EBDD",
  floorDark: "#24150F",
  highlight: "#FFF6E6",
  shadow: "#2B1A12",
  warmLight: "#FFD9A0",
  rimLight: "#E8A04A",
  coolLight: "#BFD3E6",
} as const;

/** Teintes des liquides / contenus des produits dérivés. */
export const PRODUCT_TINTS = {
  jus: "#B8701F",
  confiture: "#7A3A1C",
  pate: "#4A2818",
  rob: "#3A1A0E",
  miel: "#C98A3E",
  cafe: "#4A2E1E",
} as const;

/* --------------------------- Utilitaires couleur -------------------------- */

const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));

/** Éclaircit (amt > 0) ou assombrit (amt < 0) une couleur hex. amt ∈ [-1, 1]. */
export function shade(hex: string, amt: number) {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  const t = amt < 0 ? 0 : 255;
  const p = Math.abs(amt);
  const mix = (c: number) => clamp((t - c) * p + c);
  return `#${((1 << 24) + (mix(r) << 16) + (mix(g) << 8) + mix(b)).toString(16).slice(1)}`;
}

/** Générateur pseudo-aléatoire déterministe (seeds → rendu stable, pas d'erreur d'hydratation). */
export function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Hash d'une chaîne → seed entier stable. */
export function seedFrom(text: string) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Variation déterministe d'une datte dans un ensemble : échelle ±6 %, luminosité ±4 %. */
export function dateVariation(seed: number) {
  const rnd = mulberry32(seed);
  return { scale: 1 + (rnd() - 0.5) * 0.12, light: (rnd() - 0.5) * 0.08, rot: rnd() * Math.PI * 2, tilt: (rnd() - 0.5) * 0.5 };
}
