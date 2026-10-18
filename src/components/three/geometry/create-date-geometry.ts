import * as THREE from "three";
import { createNoise3D } from "simplex-noise";
import { mulberry32 } from "../presets";

export type DateShape = {
  length: number; // demi-hauteur
  radius: number; // rayon max
  taper: number; // affinement vers le haut (0..0.3)
  wrinkle: number; // amplitude des rides (0..0.08)
  wrinkleFreq: number; // fréquence des rides
  seed: number;
};

/**
 * Datte : profil de révolution (LatheGeometry) puis déformation par bruit
 * (rides allongées dans le sens de la hauteur + micro-relief).
 */
export function createDateGeometry(s: DateShape) {
  const pts: THREE.Vector2[] = [];
  const N = 64;
  for (let i = 0; i <= N; i++) {
    const t = i / N; // 0 = base, 1 = sommet
    const r = s.radius * Math.pow(Math.sin(Math.PI * t), 0.52) * (1 - s.taper * t);
    pts.push(new THREE.Vector2(Math.max(r, 1e-4), (t - 0.5) * 2 * s.length));
  }
  const geo = new THREE.LatheGeometry(pts, 96);
  const noise = createNoise3D(mulberry32(s.seed));
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const n =
      noise(v.x * s.wrinkleFreq, v.y * s.wrinkleFreq * 0.35, v.z * s.wrinkleFreq) * 0.75 +
      noise(v.x * 18, v.y * 9, v.z * 18) * 0.25;
    const k = 1 + s.wrinkle * n;
    pos.setXYZ(i, v.x * k, v.y, v.z * k);
  }
  geo.computeVertexNormals();
  return geo;
}

/** Calice : petite collerette en LatheGeometry posée au sommet de la datte. */
export function createCalyxGeometry(radius: number) {
  const pts = [
    new THREE.Vector2(0.0001, 0.05),
    new THREE.Vector2(radius * 0.55, 0.04),
    new THREE.Vector2(radius * 0.95, 0.0),
    new THREE.Vector2(radius * 1.05, -0.03),
    new THREE.Vector2(radius * 0.7, -0.012),
    new THREE.Vector2(0.0001, 0.0),
  ];
  const geo = new THREE.LatheGeometry(pts, 24);
  // festons du calice (4 lobes)
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const a = Math.atan2(v.z, v.x);
    const lobe = 1 + Math.cos(a * 4) * 0.12;
    pos.setXYZ(i, v.x * lobe, v.y - (1 - lobe) * 0.08, v.z * lobe);
  }
  geo.computeVertexNormals();
  return geo;
}

/* Cache module : quelques variantes par forme, partagées par toutes les dattes d'une scène. */
const cache = new Map<string, THREE.BufferGeometry>();

export function getDateGeometry(shape: Omit<DateShape, "seed">, variant: number) {
  const key = `${shape.length}|${shape.radius}|${shape.taper}|${shape.wrinkle}|${variant % 4}`;
  let g = cache.get(key);
  if (!g) {
    g = createDateGeometry({ ...shape, seed: 1013 + (variant % 4) * 7919 });
    cache.set(key, g);
  }
  return g;
}
