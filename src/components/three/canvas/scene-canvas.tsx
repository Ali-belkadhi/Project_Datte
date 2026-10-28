"use client";
import { Canvas, type CanvasProps } from "@react-three/fiber";
import * as THREE from "three";
import { cn } from "@/lib/utils";

type SceneCanvasProps = Omit<CanvasProps, "children"> & {
  children: React.ReactNode;
  className?: string;
  label: string;
};

/**
 * Canvas commun : dpr [1, 2], ACES Filmic, sRGB, fond transparent (dégradés en CSS).
 * `frameloop="demand"` par défaut pour les viewers statiques (invalidate() sur interaction).
 */
export function SceneCanvas({ children, className, label, frameloop = "demand", camera, ...props }: SceneCanvasProps) {
  return (
    <div className={cn("relative size-full", className)} role="img" aria-label={label}>
      <Canvas
        dpr={[1, 2]}
        frameloop={frameloop}
        shadows
        camera={camera ?? { position: [0, 1.2, 4.2], fov: 32 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.05;
          gl.outputColorSpace = THREE.SRGBColorSpace;
        }}
        {...props}
      >
        {children}
      </Canvas>
    </div>
  );
}
