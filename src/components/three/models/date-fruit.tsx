"use client";
import { useMemo } from "react";
import type { ThreeElements } from "@react-three/fiber";
import type { VarieteSlug } from "@/types/model-source";
import { VARIETY_PRESETS, dateVariation } from "../presets";
import { getDateGeometry } from "../geometry/create-date-geometry";
import { getCalyxGeometry, getCalyxMaterial, getDateMaterial } from "./date-material";

type DateFruitProps = Omit<ThreeElements["group"], "scale"> & {
  variete: VarieteSlug;
  seed?: number;
  /** Échelle globale ; une variation déterministe de ±6 % s'y ajoute. */
  size?: number;
  calyx?: boolean;
  wireframe?: boolean;
};

/** Une datte : géométrie de la variété + calice + matériau physique. Axe long = Y, calice en haut. */
export function DateFruit({ variete, seed = 1, size = 1, calyx = true, wireframe = false, ...group }: DateFruitProps) {
  const p = VARIETY_PRESETS[variete];
  const varn = useMemo(() => dateVariation(seed), [seed]);
  const geo = useMemo(() => getDateGeometry(p.shape, seed), [p.shape, seed]);
  const mat = useMemo(() => {
    const m = getDateMaterial(variete, varn.light * 0.5);
    if (!wireframe) return m;
    const w = m.clone();
    w.wireframe = true;
    return w;
  }, [variete, varn.light, wireframe]);
  const s = size * varn.scale;
  return (
    <group {...group} scale={s}>
      <mesh geometry={geo} material={mat} castShadow receiveShadow />
      {calyx && (
        <mesh
          geometry={getCalyxGeometry(p.shape.radius)}
          material={getCalyxMaterial()}
          position={[0, p.shape.length * 0.985, 0]}
          castShadow
        />
      )}
    </group>
  );
}
