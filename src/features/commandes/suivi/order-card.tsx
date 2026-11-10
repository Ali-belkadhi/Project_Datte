import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { ProductIllustration } from "@/components/illustrations/product-illustration";
import { StatusBadge } from "@/components/shared/status-badge";
import { STATUT_COMMANDE } from "@/lib/constants";
import { formatDate, formatPrix } from "@/lib/format";
import type { Commande } from "@/types/domain";

/** Carte commande : numéro, date, vendeurs, statut, total. */
export function OrderCard({ commande: c }: { commande: Commande }) {
  const lignes = c.sousCommandes.flatMap((s) => s.lignes);
  return (
    <Link href={`/compte/commandes/${c.numero}`} className="group flex flex-col gap-4 rounded-2xl border bg-card p-4 transition-all duration-200 hover:shadow-lift sm:flex-row sm:items-center">
      <div className="flex -space-x-3 rtl:space-x-reverse">
        {lignes.slice(0, 3).map((l) => (
          <span key={l.id} className="size-14 overflow-hidden rounded-xl border-2 border-card bg-sand">
            <ProductIllustration type={l.visuel} variete={l.variete} seed={l.slug} />
          </span>
        ))}
      </div>
      <div className="min-w-0 flex-1 space-y-1">
        <p className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[13px] font-semibold">{c.numero}</span>
          <StatusBadge status={STATUT_COMMANDE[c.statut]} />
        </p>
        <p className="truncate text-sm">{c.sousCommandes.map((s) => s.fournisseurNom).join(" · ")}</p>
        <p className="text-[13px] text-muted-foreground">
          {formatDate(c.creeLe)} · {lignes.length} article{lignes.length > 1 ? "s" : ""} · {c.sousCommandes.length} colis
        </p>
      </div>
      <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
        <span className="font-display text-xl font-semibold tabular-nums">{formatPrix(c.total)}</span>
        <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-date">
          Détails <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5 rtl:rotate-180" aria-hidden />
        </span>
      </div>
    </Link>
  );
}
