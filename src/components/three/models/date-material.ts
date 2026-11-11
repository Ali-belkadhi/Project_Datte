import * as THREE from "three";
import { MATERIALS, VARIETY_PRESETS, shade } from "../presets";
import type { VarieteSlug } from "@/types/model-source";
import { createCalyxGeometry } from "../geometry/create-date-geometry";

const materials = new Map<string, THREE.MeshPhysicalMaterial>();

/** Matériau physique d'une variété, avec une variation de luminosité (±4 %) en 5 paliers partagés. */
export function getDateMaterial(variete: VarieteSlug, light = 0) {
  const palier = Math.round(light * 50) / 50; // ≈ 0.02
  const key = `${variete}|${palier}`;
  let m = materials.get(key);
  if (!m) {
    const p = VARIETY_PRESETS[variete];
    m = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(shade(p.color, palier)),
      roughness: p.material.roughness,
      clearcoat: p.material.clearcoat,
      clearcoatRoughness: p.material.clearcoatRoughness ?? 0.3,
      transmission: p.material.transmission ?? 0,
      thickness: p.material.thickness ?? 0,
      attenuationColor: new THREE.Color(p.material.attenuationColor ?? p.color),
      attenuationDistance: 0.6,
      sheen: p.material.sheen ?? 0,
      sheenColor: new THREE.Color(p.material.sheenColor ?? p.color),
      sheenRoughness: 0.6,
      ior: 1.45,
    });
    materials.set(key, m);
  }
  return m;
}

let calyxMat: THREE.MeshStandardMaterial | null = null;
export function getCalyxMaterial() {
  if (!calyxMat) calyxMat = new THREE.MeshStandardMaterial({ color: MATERIALS.calyx, roughness: 0.8 });
  return calyxMat;
}

const calyxGeos = new Map<number, THREE.BufferGeometry>();
export function getCalyxGeometry(radius: number) {
  const k = Math.round(radius * 100);
  let g = calyxGeos.get(k);
  if (!g) {
    g = createCalyxGeometry(radius * 0.26);
    calyxGeos.set(k, g);
  }
  return g;
}
