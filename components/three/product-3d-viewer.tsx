"use client";

import React, { Component, type ErrorInfo, type ReactNode, Suspense, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Float, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import type { Product3DConfig } from "@/types";
import { ProductModel, Pedestal, FloatingDates, GoldAccents } from "@/components/three/models";
import { Rotate3D, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface ErrorBoundaryProps {
  fallback: ReactNode;
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class WebGLErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn("WebGL 3D Context Error intercepted, switching to image fallback:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

function isWebGLAvailable(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2", { failIfMajorPerformanceCaveat: false }) ||
      canvas.getContext("webgl", { failIfMajorPerformanceCaveat: false });
    return Boolean(gl);
  } catch {
    return false;
  }
}

interface Product3DViewerProps {
  config?: Product3DConfig;
  fallbackImage?: string;
  fallbackAlt?: string;
  showPedestal?: boolean;
  showDates?: boolean;
  showGold?: boolean;
  autoRotate?: boolean;
  floating?: boolean;
  cameraPosition?: [number, number, number];
  className?: string;
}

function SceneLights() {
  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight
        position={[6, 8, 5]}
        intensity={1.8}
        castShadow
        shadow-mapSize={[512, 512]}
        shadow-bias={-0.0001}
      />
      <directionalLight position={[-5, 4, -3]} intensity={0.6} color="#e8d8bc" />
      <pointLight position={[0, -2, 3]} intensity={0.5} color="#d4ae67" />
    </>
  );
}

export function Product3DViewer({
  config,
  fallbackImage,
  fallbackAlt = "SIWAR Produit",
  showPedestal = false,
  showDates = false,
  showGold = false,
  autoRotate = true,
  floating = true,
  cameraPosition = [0, 0.4, 5.2],
  className,
}: Product3DViewerProps) {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const [isRotating, setIsRotating] = useState(autoRotate);
  const [canRender3D, setCanRender3D] = useState(false);

  useEffect(() => {
    setCanRender3D(isWebGLAvailable() && Boolean(config));
  }, [config]);

  const resetView = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  const zoom = (delta: number) => {
    if (controlsRef.current) {
      const cam = controlsRef.current.object as THREE.PerspectiveCamera;
      cam.zoom = Math.min(Math.max(cam.zoom + delta, 0.6), 2.2);
      cam.updateProjectionMatrix();
    }
  };

  const renderFallback = (
    <div className={cn("relative flex h-full w-full items-center justify-center overflow-hidden", className)}>
      {fallbackImage ? (
        <div className="relative h-full w-full">
          <Image
            src={fallbackImage}
            alt={fallbackAlt}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-contain p-4"
            priority
          />
        </div>
      ) : (
        <div className="flex h-full w-full items-center justify-center text-xs text-muted">
          Aperçu 3D
        </div>
      )}
    </div>
  );

  if (!canRender3D || !config) {
    return renderFallback;
  }

  return (
    <WebGLErrorBoundary fallback={renderFallback}>
      <div className={cn("relative h-full w-full select-none", className)}>
        <Canvas
          shadows
          camera={{ position: cameraPosition, fov: 45 }}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: "default",
            preserveDrawingBuffer: false,
          }}
          className="touch-none"
        >
          <SceneLights />

          <Suspense fallback={null}>
            <group position={[0, 0, 0]}>
              {floating ? (
                <Float speed={2} rotationIntensity={0.15} floatIntensity={0.3}>
                  <ProductModel config={config} />
                </Float>
              ) : (
                <ProductModel config={config} />
              )}

              {showPedestal && <Pedestal y={-1.8} />}
              {showDates && <FloatingDates count={7} />}
              {showGold && <GoldAccents />}

              <ContactShadows
                position={[0, showPedestal ? -2.2 : -1.6, 0]}
                opacity={0.4}
                scale={5}
                blur={2}
                far={4}
              />
            </group>

            <OrbitControls
              ref={controlsRef}
              enablePan={false}
              enableZoom={true}
              minDistance={2.5}
              maxDistance={8}
              autoRotate={isRotating}
              autoRotateSpeed={1.2}
              makeDefault
            />
          </Suspense>
        </Canvas>

        {/* Floating 3D controls / 360 badge */}
        <div className="pointer-events-none absolute inset-x-4 bottom-4 flex items-center justify-between">
          <div className="pointer-events-auto flex items-center gap-1.5 rounded-full border border-forest/15 bg-cream-50/85 p-1 backdrop-blur shadow-sm">
            <button
              type="button"
              title={isRotating ? "Arrêter la rotation" : "Activer la rotation"}
              onClick={() => setIsRotating(!isRotating)}
              className={cn(
                "flex size-8 items-center justify-center rounded-full text-forest transition-colors",
                isRotating ? "bg-forest text-cream" : "hover:bg-beige/60"
              )}
            >
              <Rotate3D className="size-4" />
            </button>
            <button
              type="button"
              title="Zoomer"
              onClick={() => zoom(0.2)}
              className="flex size-8 items-center justify-center rounded-full text-forest transition-colors hover:bg-beige/60"
            >
              <ZoomIn className="size-4" />
            </button>
            <button
              type="button"
              title="Dézoomer"
              onClick={() => zoom(-0.2)}
              className="flex size-8 items-center justify-center rounded-full text-forest transition-colors hover:bg-beige/60"
            >
              <ZoomOut className="size-4" />
            </button>
            <button
              type="button"
              title="Réinitialiser la vue"
              onClick={resetView}
              className="flex size-8 items-center justify-center rounded-full text-forest transition-colors hover:bg-beige/60"
            >
              <RotateCcw className="size-3.5" />
            </button>
          </div>

          {/* 360° indicator matching reference screenshot */}
          <div className="pointer-events-auto flex flex-col items-center">
            <div className="flex size-11 items-center justify-center rounded-full border border-gold/40 bg-cream/80 backdrop-blur text-forest font-serif font-semibold text-sm shadow-sm">
              360°
            </div>
            <span className="mt-1 text-[0.65rem] font-semibold tracking-wider text-forest/70 uppercase">
              Faites tourner
            </span>
          </div>
        </div>
      </div>
    </WebGLErrorBoundary>
  );
}
