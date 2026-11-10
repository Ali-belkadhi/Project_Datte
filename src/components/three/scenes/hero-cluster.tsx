"use client";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { VarieteSlug } from "@/types/model-source";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { LightRig } from "../canvas/light-rig";
import { SceneCanvas } from "../canvas/scene-canvas";
import { DateCluster } from "../models/date-cluster";
import { MATERIALS } from "../presets";

/** Parallaxe douce au pointeur (±4°, interpolée). */
function Parallax({ children, enabled }: { children: React.ReactNode; enabled: boolean }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ pointer }, dt) => {
    if (!ref.current || !enabled) return;
    const max = THREE.MathUtils.degToRad(4);
    ref.current.rotation.y = THREE.MathUtils.damp(ref.current.rotation.y, pointer.x * max, 3, dt);
    ref.current.rotation.x = THREE.MathUtils.damp(ref.current.rotation.x, -pointer.y * max * 0.6, 3, dt);
  });
  return <group ref={ref}>{children}</group>;
}

/**
 * Accueil et panneau d'authentification : grande grappe suspendue, légère contre-plongée,
 * fond transparent (dégradé night → #3A2216 en CSS), contre-jour ambré, pas de ContactShadows.
 */
export default function HeroCluster({ variete = "deglet-nour", light = false }: { variete?: VarieteSlug; light?: boolean }) {
  const reduit = useReducedMotion();
  return (
    <SceneCanvas
      label="Grappe de dattes Deglet Nour en 3D, suspendue et translucide à contre-jour"
      frameloop={reduit ? "demand" : "always"}
      camera={{ position: [0, -0.2, 4.4], fov: 34 }}
      onCreated={({ camera }) => camera.lookAt(0, 0.75, 0)}
      shadows={false}
    >
      <LightRig intensity={1.15} shadows={false} />
      <spotLight position={[1.5, -1, -3]} angle={0.9} penumbra={1} intensity={40} color={MATERIALS.rimLight} distance={10} />
      <Parallax enabled={!reduit}>
        <group position={[0.1, 0.45, 0]} rotation={[0.08, 0.4, 0]} scale={light ? 0.92 : 1.02}>
          <DateCluster variete={variete} sway={!reduit} rameaux={light ? 8 : 11} />
        </group>
      </Parallax>
    </SceneCanvas>
  );
}
