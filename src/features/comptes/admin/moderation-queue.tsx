"use client";
import { useState } from "react";
import { EyeOff, ShieldAlert, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { STATUT_TRAITEMENT, MOTIF_SIGNALEMENT } from "@/lib/constants";
import { formatDateHeure } from "@/lib/format";
import { useAction } from "@/hooks/use-action";
import type { Signalement } from "@/types/domain";
import type { StatutTraitement } from "@/types/enums";
import { traiterSignalement } from "@/server/modules/comptes/actions";

const CIBLE: Record<Signalement["cibleType"], string> = { PRODUIT: "Produit", AVIS: "Avis", FOURNISSEUR: "Boutique", MESSAGE: "Message" };

/** File de signalements (produits, avis, boutiques, messages) avec actions. */
export function ModerationQueue({ signalements }: { signalements: Signalement[] }) {
  const [statuts, setStatuts] = useState<Record<string, StatutTraitement>>(() => Object.fromEntries(signalements.map((s) => [s.id, s.statut])));
  const { run } = useAction(traiterSignalement);
  const agir = (id: string, decision: "MASQUER" | "REJETER" | "AVERTIR") => {
    setStatuts((x) => ({ ...x, [id]: decision === "REJETER" ? "REJETE" : "TRAITE" }));
    void run({ id, decision });
  };
  return (
    <ul className="space-y-3">
      {signalements.map((s) => (
        <li key={s.id} className="space-y-3 rounded-2xl border bg-card p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="flex items-center gap-2 font-semibold">
              <Badge variant="secondary">{CIBLE[s.cibleType]}</Badge> {s.cibleLibelle}
            </p>
            <StatusBadge status={STATUT_TRAITEMENT[statuts[s.id]]} />
          </div>
          <blockquote className="rounded-xl bg-sand px-3 py-2 text-sm text-muted-foreground italic">{s.extrait}</blockquote>
          <p className="text-[13px] text-muted-foreground">
            Motif : <strong className="text-foreground">{MOTIF_SIGNALEMENT[s.motif] ?? s.motif}</strong> · signalé par {s.auteur} · {formatDateHeure(s.creeLe)}
          </p>
          {statuts[s.id] === "OUVERT" && (
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="destructive" onClick={() => agir(s.id, "MASQUER")}><EyeOff aria-hidden /> Masquer le contenu</Button>
              <Button size="sm" variant="outline" onClick={() => agir(s.id, "AVERTIR")}><ShieldAlert aria-hidden /> Avertir l&apos;auteur</Button>
              <Button size="sm" variant="ghost" onClick={() => agir(s.id, "REJETER")}><X aria-hidden /> Rejeter</Button>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
