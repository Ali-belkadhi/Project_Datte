"use client";
import { useState } from "react";
import { Box, FileBox, Image as ImageIcon, Triangle } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { formatNombre } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ModelSource } from "../models/model-source";
import { LazyScene } from "../canvas/lazy-scene";
import { LazyProductViewer } from "./lazy";

/**
 * Studio 3D vendeur : même rendu que ProductViewer + interrupteurs « Fil de fer », « Rotation »,
 * « Fond clair/sombre » et panneau d'informations simulé (polygones, textures, formats).
 */
export function StudioPreview({ source, nom, polycount = 32400, fallback }: { source: ModelSource; nom: string; polycount?: number; fallback: React.ReactNode }) {
  const [fil, setFil] = useState(false);
  const [rotation, setRotation] = useState(true);
  const [sombre, setSombre] = useState(false);
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
      <div className={cn("relative aspect-[4/3] overflow-hidden rounded-2xl border transition-colors", sombre ? "bg-hero" : "bg-sand")}>
        <LazyScene className="absolute inset-0" fallback={fallback} eager>
          <LazyProductViewer source={source} label={`Aperçu 3D : ${nom}`} wireframe={fil} rotation={rotation} dark={sombre} />
        </LazyScene>
      </div>
      <div className="space-y-4 rounded-2xl border bg-card p-4">
        <div className="space-y-3">
          {[
            { id: "fil", label: "Fil de fer", v: fil, set: setFil },
            { id: "rot", label: "Rotation", v: rotation, set: setRotation },
            { id: "fond", label: "Fond sombre", v: sombre, set: setSombre },
          ].map((o) => (
            <div key={o.id} className="flex min-h-11 items-center justify-between gap-3">
              <Label htmlFor={`studio-${o.id}`} className="text-sm font-semibold">
                {o.label}
              </Label>
              <Switch id={`studio-${o.id}`} checked={o.v} onCheckedChange={o.set} />
            </div>
          ))}
        </div>
        <dl className="space-y-2 border-t pt-4 text-sm">
          {[
            { icon: Triangle, k: "Polygones", v: formatNombre(polycount) },
            { icon: ImageIcon, k: "Textures", v: "2048 × 2048 · PBR" },
            { icon: FileBox, k: "Formats", v: "GLB · USDZ" },
            { icon: Box, k: "Poids", v: `${(polycount / 9800).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} Mo` },
          ].map((r) => (
            <div key={r.k} className="flex items-center justify-between gap-2">
              <dt className="inline-flex items-center gap-2 text-muted-foreground">
                <r.icon className="size-4" aria-hidden /> {r.k}
              </dt>
              <dd className="font-semibold tabular-nums">{r.v}</dd>
            </div>
          ))}
        </dl>
        <p className="text-[12px] text-muted-foreground">Aperçu procédural du template — les modèles Meshy (GLB) s&apos;afficheront ici.</p>
      </div>
    </div>
  );
}
