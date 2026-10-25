"use client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { formatPrix } from "@/lib/format";
import { useAction } from "@/hooks/use-action";
import { confirmerPaiementSimule } from "@/server/modules/commandes/actions";

type Props = { reference: string; montant: number; numero: string; statut: string };

/** Écran de paiement simulé : « Payer » confirme le paiement, « Annuler » l'échoue. */
export function PaymentGateway({ reference, montant, numero, statut }: Props) {
  const router = useRouter();
  const { run, pending } = useAction(confirmerPaiementSimule, {
    onSuccess: (d) => router.push(d.statut === "REUSSI" ? `/commande/confirmation?numero=${d.numero}` : "/panier"),
  });

  return (
    <div className="space-y-6 rounded-2xl border bg-card p-6">
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">Commande {numero}</p>
        <p className="font-display text-4xl font-semibold">{formatPrix(montant)}</p>
      </div>
      {statut !== "EN_ATTENTE" ? (
        <p className="text-sm">Ce paiement a déjà été traité ({statut}).</p>
      ) : (
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="brand" size="lg" className="flex-1" disabled={pending} onClick={() => run({ reference, statut: "REUSSI" })}>
            {pending ? "Traitement…" : `Payer ${formatPrix(montant)}`}
          </Button>
          <Button variant="outline" size="lg" disabled={pending} onClick={() => run({ reference, statut: "ECHOUE" })}>
            Annuler
          </Button>
        </div>
      )}
      <p className="text-xs text-muted-foreground">Passerelle de test — aucune carte n&apos;est débitée.</p>
    </div>
  );
}
