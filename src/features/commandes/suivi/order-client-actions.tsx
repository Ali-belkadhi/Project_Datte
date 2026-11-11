"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useAction } from "@/hooks/use-action";
import { annulerCommande, reprendrePaiement } from "@/server/modules/commandes/actions";

/** « Payer maintenant » : nouvelle session Stripe pour une commande restée en attente de paiement. */
export function RetryPaymentButton({ numero, className }: { numero: string; className?: string }) {
  const { run, pending } = useAction(reprendrePaiement, {
    silencieux: true,
    onSuccess: (d) => d.urlPaiement && window.location.assign(d.urlPaiement),
  });
  return (
    <Button variant="brand" className={className} disabled={pending} onClick={() => run({ numero })}>
      <CreditCard aria-hidden /> {pending ? "Redirection…" : "Payer maintenant"}
    </Button>
  );
}

/** Annulation d'une commande ou d'un colis non expédié (remboursement automatique si payé par carte). */
export function CancelOrderButton({ numero, libelle = "Annuler", paye = false }: { numero: string; libelle?: string; paye?: boolean }) {
  const router = useRouter();
  const [ouvert, setOuvert] = useState(false);
  const [motif, setMotif] = useState("");
  const { run, pending } = useAction(annulerCommande, {
    onSuccess: () => {
      setOuvert(false);
      router.refresh();
    },
  });
  return (
    <Dialog open={ouvert} onOpenChange={setOuvert}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-danger hover:bg-danger-soft hover:text-danger">
          <XCircle aria-hidden /> {libelle}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Annuler {numero} ?</DialogTitle>
          <DialogDescription>
            {paye ? "Le montant payé par carte vous sera remboursé automatiquement (délai bancaire de 5 à 10 jours)." : "Les articles seront remis en vente."} Les colis déjà expédiés ne peuvent plus être annulés.
          </DialogDescription>
        </DialogHeader>
        <Textarea value={motif} onChange={(e) => setMotif(e.target.value)} placeholder="Motif (facultatif)" aria-label="Motif d'annulation" />
        <DialogFooter>
          <Button variant="outline" onClick={() => setOuvert(false)}>
            Garder ma commande
          </Button>
          <Button variant="destructive" disabled={pending} onClick={() => run({ numero, motif: motif || undefined })}>
            {pending ? "Annulation…" : "Confirmer l'annulation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
