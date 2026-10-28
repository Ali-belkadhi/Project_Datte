"use client";
import { useMemo } from "react";
import * as THREE from "three";
import { MATERIALS, PRODUCT_TINTS } from "../presets";
import { createBottleGeometry, createBottleLiquidGeometry } from "../geometry/create-jar-geometry";
import { getLabelTexture } from "./label-texture";

type BottleProps = { teinte?: string; etiquette?: string; contenance?: string; wireframe?: boolean };

/** Bouteille (jus, rob) : verre + liquide translucide (transmission .4, attenuationColor) + bouchon + étiquette. */
export function Bottle({ teinte = PRODUCT_TINTS.jus, etiquette = "Jus de datte", contenance = "1 L", wireframe = false }: BottleProps) {
  const R = 0.36;
  const H = 1.6;
  const glass = useMemo(() => createBottleGeometry(R, H), []);
  const liquid = useMemo(() => createBottleLiquidGeometry(R, H), []);
  const label = useMemo(() => getLabelTexture(etiquette, contenance), [etiquette, contenance]);
  return (
    <group>
      <mesh geometry={liquid}>
        <meshPhysicalMaterial
          color={teinte}
          transmission={0.4}
          roughness={0.1}
          thickness={0.6}
          attenuationColor={teinte}
          attenuationDistance={0.35}
          ior={1.36}
          wireframe={wireframe}
        />
      </mesh>
      <mesh geometry={glass} castShadow receiveShadow>
        <meshPhysicalMaterial color={MATERIALS.glass} transmission={1} roughness={0.04} ior={1.5} thickness={0.3} wireframe={wireframe} />
      </mesh>
      <mesh position={[0, H * 0.32, 0]}>
        <cylinderGeometry args={[R * 1.015, R * 1.015, H * 0.3, 64, 1, true, -Math.PI * 0.6, Math.PI * 1.2]} />
        <meshStandardMaterial map={label} roughness={0.7} side={THREE.DoubleSide} wireframe={wireframe} />
      </mesh>
      <mesh position={[0, H + 0.06, 0]} castShadow>
        <cylinderGeometry args={[R * 0.4, R * 0.4, 0.14, 32]} />
        <meshStandardMaterial color={MATERIALS.kraftDark} roughness={0.75} wireframe={wireframe} />
      </mesh>
    </group>
  );
}
