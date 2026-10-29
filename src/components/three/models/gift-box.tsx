"use client";
import { useMemo } from "react";
import { RoundedBox } from "@react-three/drei";
import type { VarieteSlug } from "@/types/model-source";
import { MATERIALS, VARIETY_PRESETS, shade } from "../presets";
import { DateFruit } from "./date-fruit";
import { getLabelTexture } from "./label-texture";

/** Boîte kraft ouverte, 12 dattes alignées dans des alvéoles, couvercle posé à côté, étiquette DEGLA. */
export function GiftBox({ variete = "medjool", etiquette = "Coffret", wireframe = false }: { variete?: VarieteSlug; etiquette?: string; wireframe?: boolean }) {
  const p = VARIETY_PRESETS[variete];
  const size = (0.62 / p.shape.length) * 0.34;
  const label = useMemo(() => getLabelTexture(etiquette, "Récolte 2026", 768, 384), [etiquette]);
  const W = 1.9;
  const D = 1.3;
  const cases = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => {
        const col = i % 4;
        const row = Math.floor(i / 4);
        return [(col - 1.5) * (W / 4.4), 0.3, (row - 1) * (D / 3.4)] as [number, number, number];
      }),
    [],
  );
  return (
    <group>
      {/* fond et parois */}
      <RoundedBox args={[W, 0.36, D]} radius={0.04} position={[0, 0.18, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={MATERIALS.kraft} roughness={0.92} wireframe={wireframe} />
      </RoundedBox>
      <mesh position={[0, 0.361, 0]} rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[W - 0.1, D - 0.1]} />
        <meshStandardMaterial color={shade(MATERIALS.kraft, -0.35)} roughness={1} wireframe={wireframe} />
      </mesh>
      {cases.map((pos, i) => (
        <group key={i} position={pos}>
          <mesh position={[0, 0.065, 0]} rotation-x={-Math.PI / 2}>
            <circleGeometry args={[0.17, 24]} />
            <meshStandardMaterial color={shade(MATERIALS.kraft, -0.5)} roughness={1} />
          </mesh>
          <DateFruit variete={variete} seed={i + 3} size={size} position={[0, 0.06 + p.shape.radius * size, 0]} rotation={[0, (i * 0.7) % Math.PI, Math.PI / 2]} wireframe={wireframe} />
        </group>
      ))}
      {/* couvercle posé à côté, incliné */}
      <group position={[1.55, 0.55, -0.35]} rotation={[0.2, -0.35, -1.18]}>
        <RoundedBox args={[W * 0.98, 0.12, D * 1.02]} radius={0.03} castShadow>
          <meshStandardMaterial color={MATERIALS.kraftDark} roughness={0.9} wireframe={wireframe} />
        </RoundedBox>
        <mesh position={[0, 0.061, 0]} rotation-x={-Math.PI / 2}>
          <planeGeometry args={[1.0, 0.5]} />
          <meshStandardMaterial map={label} roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.062, 0]} rotation-x={-Math.PI / 2}>
          <planeGeometry args={[0.12, D * 1.02]} />
          <meshStandardMaterial color={MATERIALS.labelAccent} roughness={0.5} />
        </mesh>
      </group>
    </group>
  );
}
