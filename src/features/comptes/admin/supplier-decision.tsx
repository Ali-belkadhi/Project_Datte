"use client";
import { useState } from "react";
import { Check, MessageSquareMore, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useAction } from "@/hooks/use-action";
import { demanderComplement, refuserFournisseur, validerFournisseur } from "@/server/modules/comptes/actions";

/** Actions admin sur un dossier : Valider / Demander un complément / Refuser (avec motif). */
export function SupplierDecision({ fournisseurId }: { fournisseurId: string }) {
  const [motif, setMotif] = useState("");
  const [ouvert, setOuvert] = useState(false);
  const valider = useAction(validerFournisseur);
  const complement = useAction(demanderComplement);
  const refuser = useAction(refuserFournisseur, { onSuccess: () => setOuvert(false) });
  return (
    <div className="sticky bottom-20 z-30 flex flex-wrap justify-end gap-2 rounded-2xl border bg-card/95 p-3 shadow-lift backdrop-blur lg:bottom-4">
      <Dialog open={ouvert} onOpenChange={setOuvert}>
        <DialogTrigger asChild>
          <Button variant="outline" className="text-danger"><X aria-hidden /> Refuser</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Refuser le dossier</DialogTitle>
            <DialogDescription>Le motif est envoyé au vendeur.</DialogDescription>
          </DialogHeader>
          <Textarea value={motif} onChange={(e) => setMotif(e.target.value)} placeholder="Patente expirée, merci de fournir un document à jour." aria-label="Motif du refus" />
          <DialogFooter>
            <Button variant="destructive" disabled={refuser.pending} onClick={() => refuser.run({ fournisseurId, motif })}>Confirmer le refus</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Button variant="outline" disabled={complement.pending} onClick={() => complement.run({ fournisseurId, motif: "Merci de renvoyer une photo nette de la patente." })}>
        <MessageSquareMore aria-hidden /> Demander un complément
      </Button>
      <Button variant="brand" disabled={valider.pending} onClick={() => valider.run({ fournisseurId })}>
        <Check aria-hidden /> Valider
      </Button>
    </div>
  );
}
