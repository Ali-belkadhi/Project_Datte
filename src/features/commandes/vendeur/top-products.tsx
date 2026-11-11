import { formatPrix } from "@/lib/format";
import type { TopProduit } from "@/types/domain";

/** Meilleures ventes : top 5 avec barres. */
export function TopProducts({ produits }: { produits: TopProduit[] }) {
  const max = Math.max(...produits.map((p) => p.chiffreAffaires));
  return (
    <ol className="space-y-3">
      {produits.map((p, i) => (
        <li key={p.produitId} className="space-y-1.5">
          <div className="flex items-baseline justify-between gap-2 text-sm">
            <span className="truncate">
              <span className="me-2 font-display font-semibold text-muted-foreground">{i + 1}</span>
              {p.nom}
            </span>
            <span className="shrink-0 font-semibold tabular-nums">{formatPrix(p.chiffreAffaires)}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-brand-fill" style={{ width: `${(p.chiffreAffaires / max) * 100}%` }} />
          </div>
          <p className="text-[12px] text-muted-foreground">{p.ventes} ventes</p>
        </li>
      ))}
    </ol>
  );
}
