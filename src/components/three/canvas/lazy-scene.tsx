"use client";
import { Component, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";

let webglCache: boolean | null = null;
function webglDisponible() {
  if (webglCache !== null) return webglCache;
  try {
    const c = document.createElement("canvas");
    webglCache = !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    webglCache = false;
  }
  return webglCache;
}

const noop = () => () => {};

/**
 * Barrière d'erreur des scènes 3D : un modèle introuvable, abîmé ou un réseau coupé
 * affiche le repli (photo ou illustration) au lieu de faire planter la page.
 */
class ErreurScene extends Component<{ fallback: React.ReactNode; children: React.ReactNode }, { erreur: boolean }> {
  state = { erreur: false };
  static getDerivedStateFromError() {
    return { erreur: true };
  }
  componentDidCatch(e: unknown) {
    console.warn("[3D] modèle non affiché, repli sur le visuel :", e instanceof Error ? e.message : e);
  }
  render() {
    return this.state.erreur ? this.props.fallback : this.props.children;
  }
}

type LazySceneProps = {
  children: React.ReactNode;
  /** Repli affiché si WebGL est indisponible (illustration SVG). */
  fallback: React.ReactNode;
  className?: string;
  /** Monter immédiatement (scène au-dessus de la ligne de flottaison). */
  eager?: boolean;
};

/**
 * Enveloppe de toute scène 3D :
 *  - montage seulement quand la zone entre dans le viewport (IntersectionObserver) ;
 *  - squelette de chargement ;
 *  - repli sur l'illustration SVG si WebGL est indisponible ou si le modèle ne se charge pas.
 * La scène elle-même est importée via next/dynamic({ ssr: false }) (voir scenes/lazy.tsx).
 */
export function LazyScene({ children, fallback, className, eager = false }: LazySceneProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(eager);
  const webgl = useSyncExternalStore(noop, webglDisponible, () => true);

  useEffect(() => {
    if (visible || !ref.current) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, [visible]);

  return (
    <div ref={ref} className={cn("relative", className)}>
      {!webgl ? fallback : visible ? <ErreurScene fallback={fallback}>{children}</ErreurScene> : <SceneSkeleton />}
    </div>
  );
}

export function SceneSkeleton({ className, dark = false }: { className?: string; dark?: boolean }) {
  return (
    <div className={cn("absolute inset-0 grid place-items-center", className)} aria-hidden>
      <div className={cn("size-24 animate-pulse rounded-full", dark ? "bg-cream/10" : "bg-brand-soft")} />
      <div className={cn("bg-shimmer animate-shimmer absolute inset-0 rounded-2xl", dark && "opacity-40")} />
    </div>
  );
}
