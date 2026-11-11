"use client";
import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import type { VarieteSlug } from "@/types/model-source";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { LightRig } from "../canvas/light-rig";
import { SceneCanvas } from "../canvas/scene-canvas";
import { DateFruit } from "../models/date-fruit";
import { MATERIALS, VARIETY_ORDER } from "../presets";

const ESPACE = 0.62;

function DatteSocle({ variete, index, actif, onSelect, interactif }: { variete: VarieteSlug; index: number; actif: boolean; onSelect?: (v: VarieteSlug) => void; interactif: boolean }) {
  const ref = useRef<THREE.Group>(null);
  const reduit = useReducedMotion();
  const [survol, setSurvol] = useState(false);
  const x = (index - (VARIETY_ORDER.length - 1) / 2) * ESPACE;
  useFrame((_, dt) => {
    const g = ref.current;
    if (!g) return;
    const avance = actif || survol;
    g.position.z = THREE.MathUtils.damp(g.position.z, avance ? 0.55 : 0, 6, dt);
    g.position.y = THREE.MathUtils.damp(g.position.y, avance ? 0.12 : 0, 6, dt);
    if (avance && !reduit) g.rotation.y += dt * 1.2;
    else g.rotation.y = THREE.MathUtils.damp(g.rotation.y, 0, 4, dt);
  });
  return (
    <group
      ref={ref}
      position={[x, 0, 0]}
      onPointerOver={interactif ? (e) => (e.stopPropagation(), setSurvol(true), (document.body.style.cursor = "pointer")) : undefined}
      onPointerOut={interactif ? () => (setSurvol(false), (document.body.style.cursor = "")) : undefined}
      onClick={interactif ? (e) => (e.stopPropagation(), onSelect?.(variete)) : undefined}
    >
      {/* à l'échelle relative : taille réelle de chaque variété */}
      <DateFruit variete={variete} seed={index + 11} size={0.42} position={[0, 0.42, 0]} rotation={[0.1, 0, 0]} />
    </group>
  );
}

/** Les 8 dattes alignées sur un socle (accueil, /varietes, /design). */
export default function DateLineup({ selection, onSelect, interactif = true, label }: { selection?: VarieteSlug | null; onSelect?: (v: VarieteSlug) => void; interactif?: boolean; label?: string }) {
  const reduit = useReducedMotion();
  return (
    <SceneCanvas
      label={label ?? "Les 8 variétés de dattes en 3D, alignées sur un socle"}
      frameloop={reduit ? "demand" : "always"}
      camera={{ position: [0, 1.25, 4.4], fov: 34 }}
      onCreated={({ camera }) => camera.lookAt(0, 0.35, 0)}
    >
      <LightRig />
      <RoundedBox args={[VARIETY_ORDER.length * ESPACE + 0.3, 0.12, 1.5]} radius={0.05} position={[0, -0.06, 0.25]} receiveShadow>
        <meshStandardMaterial color={MATERIALS.floorLight} roughness={0.9} />
      </RoundedBox>
      {VARIETY_ORDER.map((v, i) => (
        <DatteSocle key={v} variete={v} index={i} actif={selection === v} onSelect={onSelect} interactif={interactif} />
      ))}
    </SceneCanvas>
  );
}
