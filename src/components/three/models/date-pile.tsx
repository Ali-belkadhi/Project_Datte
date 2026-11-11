"use client";
import { useMemo } from "react";
import type { VarieteSlug } from "@/types/model-source";
import { MATERIALS, VARIETY_PRESETS, mulberry32 } from "../presets";
import { createBowlGeometry } from "../geometry/create-jar-geometry";
import { DateFruit } from "./date-fruit";

/**
 * 9 à 14 dattes dans une coupelle en terre cuite.
 * Couche du fond en couronne (dattes couchées, tangentes), puis 3 dattes au-dessus.
 */
export function DatePile({ variete, count = 12, wireframe = false }: { variete: VarieteSlug; count?: number; wireframe?: boolean }) {
  const bowl = useMemo(() => createBowlGeometry(1.25, 0.42), []);
  const p = VARIETY_PRESETS[variete];
  const items = useMemo(() => {
    const rnd = mulberry32(42 + variete.length);
    const size = 0.62 / p.shape.length; // ramène toutes les variétés à une taille comparable
    const out: { pos: [number, number, number]; rot: [number, number, number]; seed: number; size: number }[] = [];
    const ring = Math.max(6, Math.min(9, count - 4));
    for (let i = 0; i < ring; i++) {
      const a = (i / ring) * Math.PI * 2 + rnd() * 0.15;
      const r = 0.6;
      out.push({
        pos: [Math.cos(a) * r, 0.2 + p.shape.radius * size * 0.75, Math.sin(a) * r],
        rot: [0, -a, Math.PI / 2 + (rnd() - 0.5) * 0.25],
        seed: i + 1,
        size,
      });
    }
    out.push({ pos: [0, 0.22 + p.shape.radius * size * 0.7, 0], rot: [0, rnd() * 3, Math.PI / 2], seed: 20, size });
    const top = Math.min(3, count - ring - 1);
    for (let i = 0; i < top; i++) {
      const a = (i / top) * Math.PI * 2 + 0.6;
      out.push({
        pos: [Math.cos(a) * 0.3, 0.2 + p.shape.radius * size * 2.25, Math.sin(a) * 0.3],
        rot: [(rnd() - 0.5) * 0.4, -a + Math.PI / 2, Math.PI / 2 + (rnd() - 0.5) * 0.5],
        seed: 30 + i,
        size,
      });
    }
    return out;
  }, [count, p.shape.length, p.shape.radius, variete.length]);

  return (
    <group>
      <mesh geometry={bowl} castShadow receiveShadow>
        <meshStandardMaterial color={MATERIALS.terracotta} roughness={0.9} side={2} wireframe={wireframe} />
      </mesh>
      {items.map((d, i) => (
        <DateFruit key={i} variete={variete} seed={d.seed} size={d.size} position={d.pos} rotation={d.rot} wireframe={wireframe} />
      ))}
    </group>
  );
}
