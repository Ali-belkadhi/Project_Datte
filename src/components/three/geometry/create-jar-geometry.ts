import * as THREE from "three";

/** Profils de révolution des contenants (bocal, bouteille, coupelle). Unités : ~1 = 10 cm. */

const v2 = (x: number, y: number) => new THREE.Vector2(x, y);

/** Bocal à confiture : épaules arrondies, col court. */
export function createJarGeometry(r = 0.5, h = 1.1, segments = 64) {
  const pts = [
    v2(0.0001, 0),
    v2(r * 0.92, 0),
    v2(r, 0.06),
    v2(r, h * 0.82),
    v2(r * 0.94, h * 0.9),
    v2(r * 0.8, h * 0.95),
    v2(r * 0.8, h),
    v2(0.0001, h),
  ];
  return new THREE.LatheGeometry(pts, segments);
}

/** Contenu du bocal (légèrement plus petit que le verre). */
export function createJarFillGeometry(r = 0.5, h = 1.1, niveau = 0.78) {
  const pts = [v2(0.0001, 0.02), v2(r * 0.9, 0.02), v2(r * 0.94, 0.08), v2(r * 0.94, h * niveau), v2(0.0001, h * niveau + 0.02)];
  return new THREE.LatheGeometry(pts, 48);
}

/** Bouteille : corps, épaule, goulot. */
export function createBottleGeometry(r = 0.36, h = 1.6, segments = 64) {
  const pts: THREE.Vector2[] = [v2(0.0001, 0), v2(r * 0.9, 0), v2(r, 0.05), v2(r, h * 0.6)];
  for (let i = 1; i <= 10; i++) {
    const t = i / 10;
    const y = h * 0.6 + t * h * 0.22;
    const rr = r - (r - r * 0.32) * (0.5 - 0.5 * Math.cos(Math.PI * t));
    pts.push(v2(rr, y));
  }
  pts.push(v2(r * 0.32, h * 0.97), v2(r * 0.36, h * 0.985), v2(r * 0.36, h), v2(0.0001, h));
  return new THREE.LatheGeometry(pts, segments);
}

/** Liquide de la bouteille (rempli jusqu'au début de l'épaule). */
export function createBottleLiquidGeometry(r = 0.36, h = 1.6) {
  const k = 0.92;
  const pts: THREE.Vector2[] = [v2(0.0001, 0.03), v2(r * k * 0.9, 0.03), v2(r * k, 0.08), v2(r * k, h * 0.6)];
  for (let i = 1; i <= 6; i++) {
    const t = i / 10;
    const rr = (r - (r - r * 0.32) * (0.5 - 0.5 * Math.cos(Math.PI * t))) * k;
    pts.push(v2(rr, h * 0.6 + t * h * 0.22));
  }
  pts.push(v2(0.0001, h * 0.6 + 0.6 * h * 0.22));
  return new THREE.LatheGeometry(pts, 48);
}

/** Coupelle en terre cuite (paroi épaisse, ouverte). */
export function createBowlGeometry(r = 1.25, h = 0.42) {
  const pts = [
    v2(0.0001, 0),
    v2(r * 0.42, 0),
    v2(r * 0.46, 0.04),
    v2(r * 0.8, h * 0.45),
    v2(r, h),
    v2(r * 1.02, h * 1.06),
    v2(r * 0.95, h * 1.04),
    v2(r * 0.76, h * 0.55),
    v2(r * 0.44, h * 0.18),
    v2(0.0001, h * 0.16),
  ];
  return new THREE.LatheGeometry(pts, 72);
}
