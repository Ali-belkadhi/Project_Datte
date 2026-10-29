"use client";
import { useMemo } from "react";
import * as THREE from "three";
import { MATERIALS, PRODUCT_TINTS } from "../presets";
import { createJarFillGeometry, createJarGeometry } from "../geometry/create-jar-geometry";
import { getLabelTexture } from "./label-texture";

type JarProps = { teinte?: string; etiquette?: string; contenance?: string; couvercle?: "metal" | "kraft"; wireframe?: boolean };

/** Bocal en verre (transmission 1, ior 1.5) + contenu ambré opaque et brillant + couvercle + étiquette. */
export function Jar({ teinte = PRODUCT_TINTS.confiture, etiquette = "Confiture", contenance = "350 g", couvercle = "metal", wireframe = false }: JarProps) {
  const R = 0.5;
  const H = 1.1;
  const glass = useMemo(() => createJarGeometry(R, H), []);
  const fill = useMemo(() => createJarFillGeometry(R, H), []);
  const label = useMemo(() => getLabelTexture(etiquette, contenance), [etiquette, contenance]);
  return (
    <group>
      <mesh geometry={fill} castShadow>
        <meshPhysicalMaterial color={teinte} roughness={0.18} clearcoat={1} clearcoatRoughness={0.08} wireframe={wireframe} />
      </mesh>
      <mesh geometry={glass} castShadow receiveShadow>
        <meshPhysicalMaterial
          color={MATERIALS.glass}
          transmission={1}
          roughness={0.05}
          ior={1.5}
          thickness={0.4}
          transparent
          opacity={1}
          envMapIntensity={1.2}
          wireframe={wireframe}
        />
      </mesh>
      <mesh position={[0, H * 0.45, 0]}>
        <cylinderGeometry args={[R * 1.012, R * 1.012, H * 0.38, 64, 1, true, -Math.PI * 0.62, Math.PI * 1.24]} />
        <meshStandardMaterial map={label} roughness={0.7} side={THREE.DoubleSide} wireframe={wireframe} />
      </mesh>
      <mesh position={[0, H + 0.06, 0]} castShadow>
        <cylinderGeometry args={[R * 0.86, R * 0.86, 0.14, 48]} />
        {couvercle === "metal" ? (
          <meshStandardMaterial color={MATERIALS.metal} metalness={0.85} roughness={0.28} wireframe={wireframe} />
        ) : (
          <meshStandardMaterial color={MATERIALS.kraft} roughness={0.9} wireframe={wireframe} />
        )}
      </mesh>
    </group>
  );
}
