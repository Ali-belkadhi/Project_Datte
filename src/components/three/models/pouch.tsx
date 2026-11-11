"use client";
import { useMemo } from "react";
import * as THREE from "three";
import { MATERIALS } from "../presets";
import { getLabelTexture } from "./label-texture";

/** Sachet kraft (box déformée : ventre bombé, haut pincé) avec un pli en haut et une étiquette. */
export function Pouch({ etiquette = "Café de noyaux", contenance = "200 g", wireframe = false }: { etiquette?: string; contenance?: string; wireframe?: boolean }) {
  const geo = useMemo(() => {
    const g = new THREE.BoxGeometry(1, 1.5, 0.5, 16, 24, 8);
    const pos = g.attributes.position as THREE.BufferAttribute;
    const v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      const t = (v.y + 0.75) / 1.5; // 0 bas → 1 haut
      const ventre = Math.sin(Math.PI * Math.min(1, t * 1.1)) * 0.5 + 0.55;
      const pince = THREE.MathUtils.smoothstep(t, 0.75, 1);
      v.z *= ventre * (1 - pince * 0.92);
      v.x *= 1 - Math.abs(v.z) * 0.18 + pince * 0.02;
      v.y += Math.cos(v.x * 4) * 0.008;
      pos.setXYZ(i, v.x, v.y + 0.75, v.z);
    }
    g.computeVertexNormals();
    return g;
  }, []);
  const label = useMemo(() => getLabelTexture(etiquette, contenance, 768, 512), [etiquette, contenance]);
  return (
    <group>
      <mesh geometry={geo} castShadow receiveShadow>
        <meshStandardMaterial color={MATERIALS.kraft} roughness={0.95} wireframe={wireframe} />
      </mesh>
      <mesh position={[0, 1.5, 0]} castShadow>
        <boxGeometry args={[1.02, 0.12, 0.06]} />
        <meshStandardMaterial color={MATERIALS.kraftDark} roughness={0.9} wireframe={wireframe} />
      </mesh>
      <mesh position={[0, 0.7, 0.262]}>
        <planeGeometry args={[0.72, 0.48]} />
        <meshStandardMaterial map={label} roughness={0.75} />
      </mesh>
    </group>
  );
}
