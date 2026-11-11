import { BadgeCheck, Store } from "lucide-react";
import { RatingStars } from "@/components/shared/rating-stars";
import { formatDate, formatNote } from "@/lib/format";
import type { Avis, RepartitionNotes } from "@/types/domain";

/** Répartition des notes en barres. */
export function RatingBreakdown({ repartition: r }: { repartition: RepartitionNotes }) {
  return (
    <div className="flex flex-col gap-5 rounded-2xl border bg-card p-5 sm:flex-row sm:items-center">
      <div className="text-center sm:w-36">
        <p className="font-display text-5xl font-semibold tabular-nums">{formatNote(r.moyenne)}</p>
        <RatingStars note={r.moyenne} showValue={false} size="md" className="justify-center" />
        <p className="mt-1 text-[13px] text-muted-foreground">{r.total} avis</p>
      </div>
      <ul className="flex-1 space-y-1.5" aria-label="Répartition des notes">
        {[5, 4, 3, 2, 1].map((n) => {
          const c = r.parNote[n - 1];
          const pct = r.total ? (c / r.total) * 100 : 0;
          return (
            <li key={n} className="flex items-center gap-3 text-[13px]">
              <span className="w-14 shrink-0 tabular-nums">{n} étoile{n > 1 ? "s" : ""}</span>
              <span className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                <span className="block h-full rounded-full bg-brand-fill" style={{ width: `${pct}%` }} />
              </span>
              <span className="w-6 text-end text-muted-foreground tabular-nums">{c}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** Un avis (« Prénom N. ») avec réponse éventuelle du vendeur. */
export function ReviewItem({ avis: a, vendeur }: { avis: Avis; vendeur?: string }) {
  return (
    <li className="space-y-3 rounded-2xl border bg-card p-4 md:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-full bg-secondary text-[13px] font-bold">{a.auteur.slice(0, 1)}</span>
          <div>
            <p className="text-sm font-semibold">{a.auteur}</p>
            <p className="text-[12px] text-muted-foreground">{formatDate(a.creeLe)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {a.achatVerifie && (
            <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-success">
              <BadgeCheck className="size-3.5" aria-hidden /> Achat vérifié
            </span>
          )}
          <RatingStars note={a.note} showValue={false} />
        </div>
      </div>
      <p className="text-[15px] leading-relaxed">{a.commentaire}</p>
      {a.reponseFournisseur && (
        <div className="rounded-xl bg-sand p-3 text-[14px]">
          <p className="mb-1 inline-flex items-center gap-1.5 text-[12px] font-semibold text-accent-foreground">
            <Store className="size-3.5" aria-hidden /> Réponse de {vendeur ?? "la boutique"}
          </p>
          <p className="text-muted-foreground">{a.reponseFournisseur}</p>
        </div>
      )}
    </li>
  );
}

export function ReviewList({ avis, vendeur }: { avis: Avis[]; vendeur?: string }) {
  return (
    <ul className="space-y-3">
      {avis.map((a) => (
        <ReviewItem key={a.id} avis={a} vendeur={vendeur} />
      ))}
    </ul>
  );
}
