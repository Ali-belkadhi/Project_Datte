"use client";
import { Environment, Lightformer } from "@react-three/drei";
import { MATERIALS } from "../presets";

/**
 * Éclairage commun — AUCUN asset réseau (pas de preset HDR) :
 * environnement construit avec trois Lightformer (bande haute, latérale chaude, froide faible).
 */
export function LightRig({ intensity = 1, shadows = true }: { intensity?: number; shadows?: boolean }) {
  return (
    <>
      <ambientLight intensity={0.25 * intensity} />
      <directionalLight
        position={[3.5, 5, 3]}
        intensity={2.2 * intensity}
        color={MATERIALS.warmLight}
        castShadow={shadows}
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0004}
      />
      <spotLight position={[-3, 2.5, -4]} angle={0.6} penumbra={0.8} intensity={28 * intensity} color={MATERIALS.rimLight} distance={14} />
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={2.4} color={MATERIALS.highlight} position={[0, 5, -1]} rotation-x={Math.PI / 2} scale={[8, 2, 1]} />
        <Lightformer form="rect" intensity={1.6} color={MATERIALS.warmLight} position={[5, 1.5, 1]} rotation-y={-Math.PI / 2} scale={[4, 3, 1]} />
        <Lightformer form="rect" intensity={0.45} color={MATERIALS.coolLight} position={[-5, 1, 0]} rotation-y={Math.PI / 2} scale={[4, 3, 1]} />
      </Environment>
    </>
  );
}
