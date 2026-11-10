"use client";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { VarieteSlug } from "@/types/model-source";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { LightRig } from "../canvas/light-rig";
import { SceneCanvas } from "../canvas/scene-canvas";
import { DateFruit } from "../models/date-fruit";
import { VARIETY_PRESETS } from "../presets";

function Tournant({ children, actif }: { children: React.ReactNode; actif: boolean }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (actif && ref.current) ref.current.rotation.y += dt * 0.35;
  });
  return <group ref={ref}>{children}</group>;
}

/** Hero de fiche variété : la datte seule en rotation lente. */
export default function SingleDate({ variete, label }: { variete: VarieteSlug; label?: string }) {
  const reduit = useReducedMotion();
  const p = VARIETY_PRESETS[variete];
  return (
    <SceneCanvas label={label ?? `Datte ${p.nom} en 3D`} frameloop={reduit ? "demand" : "always"} camera={{ position: [0, 0.2, 3.2], fov: 30 }} shadows={false}>
      <LightRig intensity={1.1} shadows={false} />
      <Tournant actif={!reduit}>
        <DateFruit variete={variete} seed={5} size={0.68 / p.shape.length} rotation={[0.2, 0, 0.5]} />
      </Tournant>
    </SceneCanvas>
  );
}
