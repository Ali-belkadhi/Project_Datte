import Link from "next/link";
import { Box, RotateCcw } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { ProductIllustration } from "@/components/illustrations/product-illustration";
import { StatusBadge } from "@/components/shared/status-badge";
import { STATUT_3D } from "@/lib/constants";
import { formatDateCourte } from "@/lib/format";
import type { Modele3DVendeur } from "@/types/domain";

/** Vignette de modèle 3D : illustration + badge 3D, produit, statut, progression ou « Crédits restitués ». */
export function ModelCard({ modele: m }: { modele: Modele3DVendeur }) {
  return (
    <Link href={`/vendeur/studio-3d/${m.id}`} className="group flex flex-col overflow-hidden rounded-2xl border bg-card transition-all hover:-translate-y-0.5 hover:shadow-lift">
      <div className="relative aspect-[4/3] bg-sand">
        <ProductIllustration type={m.visuel} variete={m.variete} seed={m.produitId} />
        {m.source && (
          <span className="absolute start-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-night/85 px-2 py-0.5 text-[11px] font-semibold text-cream">
            <Box className="size-3" aria-hidden /> 3D
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="font-semibold">{m.produitNom}</p>
        <div className="flex items-center justify-between">
          <StatusBadge status={STATUT_3D[m.statut]} />
          <span className="text-[12px] text-muted-foreground">{formatDateCourte(m.creeLe)}</span>
        </div>
        {m.statut === "EN_COURS" && (
          <div className="space-y-1">
            <Progress value={m.progression} className="h-1.5" aria-label="Progression de la génération" />
            <p className="text-[12px] text-muted-foreground tabular-nums">{m.progression} %</p>
          </div>
        )}
        {m.statut === "ECHEC" && (
          <p className="inline-flex items-center gap-1.5 text-[13px] text-danger">
            <RotateCcw className="size-3.5" aria-hidden /> Crédits restitués
          </p>
        )}
      </div>
    </Link>
  );
}
