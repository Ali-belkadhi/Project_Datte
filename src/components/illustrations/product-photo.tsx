"use client";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Photo réelle d'un produit (module B). Si l'URL est cassée ou inaccessible,
 * affiche l'illustration de remplacement fournie (`fallback`).
 */
export function ProductPhoto({ src, alt, className, fallback }: { src: string; alt: string; className?: string; fallback: ReactNode }) {
  const [erreur, setErreur] = useState(false);
  if (erreur) return <>{fallback}</>;
  // eslint-disable-next-line @next/next/no-img-element -- URLs locales /api/media ou externes : pas de loader next/image
  return <img src={src} alt={alt} loading="lazy" decoding="async" onError={() => setErreur(true)} className={cn("size-full object-cover", className)} />;
}
