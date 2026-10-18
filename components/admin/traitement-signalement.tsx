"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { actionTraiterSignalement } from "@/server/actions/signalement.actions";
import { StatutTraitement } from "@/domain/enums";

export function TraitementSignalement({
  signalementId,
  statut,
}: {
  signalementId: string;
  statut: StatutTraitement;
}) {
  const router = useRouter();
  const [enCours, demarrer] = useTransition();
  const [erreur, setErreur] = useState<string | null>(null);

  function traiter(nouveauStatut: StatutTraitement) {
    const donnees = new FormData();
    donnees.set("signalementId", signalementId);
    donnees.set("statut", nouveauStatut);
    setErreur(null);
    demarrer(async () => {
      const reponse = await actionTraiterSignalement(donnees);
      if (!reponse.success) {
        setErreur(
          (reponse.errors as Record<string, string[] | undefined>)?._form?.[0] ??
            "Erreur lors du traitement."
        );
        return;
      }
      router.refresh();
    });
  }

  if (statut !== StatutTraitement.OUVERT) {
    return <span className="text-xs text-muted">Traité</span>;
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="default"
          disabled={enCours}
          onClick={() => traiter(StatutTraitement.TRAITE)}
        >
          Traiter
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="border-forest/25"
          disabled={enCours}
          onClick={() => traiter(StatutTraitement.REJETE)}
        >
          Rejeter
        </Button>
      </div>
      {erreur && <span className="text-xs text-destructive">{erreur}</span>}
    </div>
  );
}
