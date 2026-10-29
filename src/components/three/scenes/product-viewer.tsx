"use client";
import { useRef, useState } from "react";
import { OrbitControls } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import type { ModelSource } from "../models/model-source";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn } from "@/lib/utils";
import { LightRig } from "../canvas/light-rig";
import { SceneCanvas } from "../canvas/scene-canvas";
import { StudioFloor } from "../canvas/studio-floor";
import { ModelFromSource } from "../models/model-from-source";
import { ViewerOverlay } from "./viewer-overlay";

export type ViewerProps = {
  source: ModelSource;
  label: string;
  className?: string;
  /** Options du studio vendeur. */
  wireframe?: boolean;
  rotation?: boolean;
  dark?: boolean;
  overlay?: boolean;
};

/**
 * Onglet « Vue 3D » : sol studio, OrbitControls (pas de pan, zoom et angle polaire limités),
 * rotation automatique lente qui s'arrête à la première interaction.
 */
export default function ProductViewer({ source, label, className, wireframe = false, rotation = true, dark = false, overlay = true }: ViewerProps) {
  const reduit = useReducedMotion();
  const controls = useRef<OrbitControlsImpl>(null);
  const conteneur = useRef<HTMLDivElement>(null);
  const [interagi, setInteragi] = useState(false);
  const tourne = rotation && !interagi && !reduit;

  return (
    <div ref={conteneur} className={cn("relative size-full", className)}>
      <SceneCanvas label={label} frameloop={tourne || source.kind === "procedural-date" ? "always" : "demand"} camera={{ position: [2.6, 2.1, 3.6], fov: 32 }}>
        <LightRig />
        <group position={[0, 0, 0]}>
          <ModelFromSource source={source} wireframe={wireframe} animate={!reduit} />
        </group>
        <StudioFloor dark={dark} />
        <OrbitControls
          ref={controls}
          makeDefault
          target={[0, 0.55, 0]}
          enablePan={false}
          minDistance={2.4}
          maxDistance={6.5}
          minPolarAngle={0.25}
          maxPolarAngle={Math.PI / 2.15}
          autoRotate={tourne}
          autoRotateSpeed={0.8}
          enableDamping
          onStart={() => setInteragi(true)}
        />
      </SceneCanvas>
      {overlay && (
        <ViewerOverlay
          dark={dark}
          indication={!interagi}
          glbUrl={source.kind === "glb" ? source.url : undefined}
          onReset={() => controls.current?.reset()}
          onFullscreen={() => {
            const el = conteneur.current;
            if (!el) return;
            if (document.fullscreenElement) void document.exitFullscreen();
            else void el.requestFullscreen?.();
          }}
        />
      )}
    </div>
  );
}
