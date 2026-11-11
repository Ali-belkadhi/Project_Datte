import * as THREE from "three";
import { MATERIALS } from "../presets";

const cache = new Map<string, THREE.CanvasTexture>();

function familleCss(variable: string, repli: string) {
  if (typeof document === "undefined") return repli;
  const v = getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
  return v ? `${v}, ${repli}` : repli;
}

/**
 * Étiquette générée en code (CanvasTexture) : fond crème, logo DEGLA,
 * nom du produit en Fraunces, contenance. Appliquée sur un cylindre ouvert.
 */
export function getLabelTexture(nom: string, sous = "Récolte 2026", largeur = 1024, hauteur = 384) {
  const key = `${nom}|${sous}|${largeur}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const c = document.createElement("canvas");
  c.width = largeur;
  c.height = hauteur;
  const ctx = c.getContext("2d")!;
  const serif = familleCss("--font-fraunces", "Georgia, serif");
  const sans = familleCss("--font-inter", "system-ui, sans-serif");

  ctx.fillStyle = MATERIALS.label;
  ctx.fillRect(0, 0, largeur, hauteur);
  ctx.fillStyle = MATERIALS.labelAccent;
  ctx.fillRect(0, 26, largeur, 8);
  ctx.fillRect(0, hauteur - 34, largeur, 8);

  // zone centrée (face avant du cylindre ≈ 1/3 de la largeur)
  const cx = largeur * 0.5;
  ctx.textAlign = "center";
  ctx.fillStyle = MATERIALS.labelInk;
  ctx.font = `700 ${hauteur * 0.2}px ${serif}`;
  ctx.fillText("DEGLA", cx, hauteur * 0.36);
  ctx.fillStyle = MATERIALS.labelAccent;
  ctx.beginPath();
  ctx.arc(cx + hauteur * 0.36, hauteur * 0.33, hauteur * 0.022, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = MATERIALS.labelInk;
  ctx.font = `600 ${hauteur * 0.15}px ${serif}`;
  ctx.fillText(nom, cx, hauteur * 0.6);
  ctx.globalAlpha = 0.7;
  ctx.font = `500 ${hauteur * 0.085}px ${sans}`;
  ctx.fillText(sous, cx, hauteur * 0.78);
  ctx.globalAlpha = 1;

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  cache.set(key, tex);
  return tex;
}
