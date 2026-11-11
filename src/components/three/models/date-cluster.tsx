"use client";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { VarieteSlug } from "@/types/model-source";
import { MATERIALS, VARIETY_PRESETS, mulberry32 } from "../presets";
import { DateFruit } from "./date-fruit";

type Brin = { curve: THREE.CatmullRomCurve3; dates: { pos: THREE.Vector3; seed: number; tilt: number }[] };

/**
 * Grappe branchée : tige principale (TubeGeometry sur CatmullRomCurve3), 10 rameaux fins,
 * une datte au bout de chaque brin (30 au total), léger balancement (±1,5°).
 */
export function DateCluster({ variete, sway = true, rameaux = 10, wireframe = false }: { variete: VarieteSlug; sway?: boolean; rameaux?: number; wireframe?: boolean }) {
  const ref = useRef<THREE.Group>(null);
  const p = VARIETY_PRESETS[variete];
  const size = (0.62 / p.shape.length) * 0.42;

  const { tige, brins } = useMemo(() => {
    const rnd = mulberry32(7 + rameaux);
    const tigeCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.1, 2.3, -0.1),
      new THREE.Vector3(0.05, 1.7, 0),
      new THREE.Vector3(-0.05, 1.15, 0.04),
      new THREE.Vector3(0, 0.8, 0),
    ]);
    const tige = new THREE.TubeGeometry(tigeCurve, 48, 0.055, 10, false);
    const brins: Brin[] = [];
    for (let i = 0; i < rameaux; i++) {
      const a = (i / rameaux) * Math.PI * 2 + rnd() * 0.4;
      const spread = 0.35 + rnd() * 0.25;
      const start = new THREE.Vector3(0, 0.82 + rnd() * 0.1, 0);
      const mid = new THREE.Vector3(Math.cos(a) * spread * 0.5, 0.55 - rnd() * 0.1, Math.sin(a) * spread * 0.5);
      const end = new THREE.Vector3(Math.cos(a) * spread, -0.25 - rnd() * 0.45, Math.sin(a) * spread);
      const curve = new THREE.CatmullRomCurve3([start, mid, end]);
      const dates = [0.45, 0.72, 1].map((t, j) => {
        const pt = curve.getPoint(t);
        const out = new THREE.Vector3(Math.cos(a), 0, Math.sin(a)).multiplyScalar(0.06 + j * 0.02);
        return { pos: pt.add(out).add(new THREE.Vector3(0, -p.shape.length * size * 0.9, 0)), seed: i * 3 + j + 1, tilt: (rnd() - 0.5) * 0.5 };
      });
      brins.push({ curve, dates });
    }
    return { tige, brins };
  }, [rameaux, p.shape.length, size]);

  const brinGeos = useMemo(() => brins.map((b) => new THREE.TubeGeometry(b.curve, 20, 0.012, 5, false)), [brins]);

  useFrame(({ clock, invalidate }) => {
    if (!sway || !ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.rotation.z = Math.sin(t * 0.8) * THREE.MathUtils.degToRad(1.5);
    ref.current.rotation.x = Math.sin(t * 0.55 + 1) * THREE.MathUtils.degToRad(0.8);
    invalidate();
  });

  return (
    <group ref={ref}>
      <mesh geometry={tige} castShadow>
        <meshStandardMaterial color={MATERIALS.stemDark} roughness={0.85} wireframe={wireframe} />
      </mesh>
      {brinGeos.map((g, i) => (
        <mesh key={i} geometry={g} castShadow>
          <meshStandardMaterial color={MATERIALS.stem} roughness={0.8} wireframe={wireframe} />
        </mesh>
      ))}
      {brins.flatMap((b, i) =>
        b.dates.map((d, j) => (
          <DateFruit key={`${i}-${j}`} variete={variete} seed={d.seed} size={size} position={d.pos} rotation={[d.tilt, d.seed, d.tilt * 0.6]} wireframe={wireframe} />
        )),
      )}
    </group>
  );
}
