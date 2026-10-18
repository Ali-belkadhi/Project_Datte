"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/shared/status-badge";
import { MOTIF_LITIGE, STATUT_LITIGE } from "@/lib/constants";
import { formatDateCourte, formatDateHeure, formatPrix } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useAction } from "@/hooks/use-action";
import type { Litige } from "@/types/domain";
import { resoudreLitige } from "@/server/modules/commandes/actions";

/** Détail d'un litige : motif, échanges, décision de remboursement. */
export function DisputeDetail({ litige: l }: { litige: Litige }) {
  const [montant, setMontant] = useState(String(l.montant / 1000));
  const { run, pending } = useAction(resoudreLitige);
  const clos = ["RESOLU_CLIENT", "RESOLU_FOURNISSEUR", "CLOS"].includes(l.statut);
  return (
    <div className="space-y-4 rounded-2xl border bg-card p-4 md:p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-mono text-sm font-semibold">{l.numero}</p>
          <p className="text-[13px] text-muted-foreground">
            {l.client} ↔ {l.fournisseurNom} · colis <span className="font-mono">{l.sousCommandeNumero}</span>
          </p>
        </div>
        <StatusBadge status={STATUT_LITIGE[l.statut]} />
      </div>
      <p className="rounded-xl bg-sand p-3 text-sm">
        <strong>{MOTIF_LITIGE[l.motif]}</strong> — {l.description}
      </p>
      <ol className="space-y-2">
        {l.echanges.map((e, i) => (
          <li key={i} className={cn("rounded-xl border p-3 text-sm", e.auteur === "admin" && "border-brand-fill/40 bg-brand-soft/40")}>
            <p className="mb-1 text-[12px] font-semibold text-muted-foreground">
              {e.nom} · {formatDateHeure(e.date)}
            </p>
            {e.contenu}
          </li>
        ))}
      </ol>
      {!clos && (
        <div className="space-y-3 border-t pt-4">
          <div className="max-w-xs space-y-1.5">
            <Label htmlFor={`mt-${l.id}`}>Montant remboursé (DT)</Label>
            <Input id={`mt-${l.id}`} inputMode="decimal" value={montant} onChange={(e) => setMontant(e.target.value)} />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="brand" disabled={pending} onClick={() => run({ litigeId: l.id, decision: "RESOLU_CLIENT", montantRembourse: Math.round(Number(montant.replace(",", ".")) * 1000) })}>
              Rembourser le client
            </Button>
            <Button variant="outline" disabled={pending} onClick={() => run({ litigeId: l.id, decision: "RESOLU_FOURNISSEUR" })}>
              Donner raison au vendeur
            </Button>
            <Button variant="ghost" disabled={pending} onClick={() => run({ litigeId: l.id, decision: "CLOS" })}>
              Clore sans suite
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

/** Tableau des litiges + détail du litige sélectionné. */
export function DisputeBoard({ litiges }: { litiges: Litige[] }) {
  const [sel, setSel] = useState(litiges[0]?.id);
  const actif = litiges.find((l) => l.id === sel) ?? litiges[0];
  return (
    <div className="grid gap-4 lg:grid-cols-[380px_1fr] lg:items-start">
      <ul className="space-y-2">
        {litiges.map((l) => (
          <li key={l.id}>
            <button type="button" onClick={() => setSel(l.id)} aria-current={l.id === actif?.id ? "true" : undefined} className={cn("w-full space-y-1 rounded-2xl border bg-card p-4 text-start transition-colors hover:bg-accent/40", l.id === actif?.id && "border-brand-fill")}>
              <span className="flex items-center justify-between gap-2">
                <span className="font-mono text-[13px] font-semibold">{l.numero}</span>
                <StatusBadge status={STATUT_LITIGE[l.statut]} />
              </span>
              <span className="block text-sm">{MOTIF_LITIGE[l.motif]}</span>
              <span className="block text-[12px] text-muted-foreground">
                {l.client} · {l.fournisseurNom} · {formatDateCourte(l.ouvertLe)} · {formatPrix(l.montant)}
              </span>
            </button>
          </li>
        ))}
      </ul>
      {actif && <DisputeDetail key={actif.id} litige={actif} />}
    </div>
  );
}
