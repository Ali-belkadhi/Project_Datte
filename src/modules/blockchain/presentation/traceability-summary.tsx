import Link from "next/link";
import { Blocks, ExternalLink, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PublicTraceability } from "../domain/traceability";

export function TraceabilitySummary({ productId, traceability }: { productId: string; traceability: PublicTraceability }) {
  if (!traceability.link) return null;
  const verified = Boolean(traceability.lot && !traceability.error);

  return (
    <section className="rounded-2xl border border-brand-fill/40 bg-brand-soft/25 p-5" aria-labelledby="product-traceability-title">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-xs font-bold tracking-[0.15em] text-brand uppercase">
            <Blocks className="size-4" aria-hidden /> Blockchain
          </p>
          <h2 id="product-traceability-title" className="mt-1 font-display text-xl font-semibold">Traçabilité du lot</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Lot <span className="font-mono font-semibold text-foreground">{traceability.link.lotId}</span> · {verified ? "Informations vérifiées sur la Blockchain" : "Vérification temporairement indisponible"}
          </p>
        </div>
        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${verified ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>
          <ShieldCheck className="size-3.5" aria-hidden /> {verified ? "Vérifié" : "À vérifier"}
        </span>
      </div>
      <Button asChild variant="outline" className="mt-4">
        <Link href={`/tracabilite/${productId}`}>Voir l&apos;historique et le QR Code <ExternalLink aria-hidden /></Link>
      </Button>
    </section>
  );
}
