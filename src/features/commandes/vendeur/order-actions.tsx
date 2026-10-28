"use client";
import { useState } from "react";
import { Check, ChefHat, Printer, Truck, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAction } from "@/hooks/use-action";
import type { StatutSousCommande } from "@/types/enums";
import { accepterSousCommande, expedierSousCommande, preparerSousCommande, refuserSousCommande } from "@/server/modules/commandes/actions";

/** Actions selon le statut : Accepter / Refuser (motif), En préparation, Expédier (transporteur + suivi), Bordereau. */
export function OrderActions({ numero, statut: initial, compact = false }: { numero: string; statut: StatutSousCommande; compact?: boolean }) {
  const [statut, setStatut] = useState(initial);
  const [motif, setMotif] = useState("");
  const [transporteur, setTransporteur] = useState("Aramex Tunisie");
  const [suivi, setSuivi] = useState("");
  const [dialog, setDialog] = useState<"refus" | "expedition" | null>(null);
  const accepter = useAction(accepterSousCommande, { onSuccess: () => setStatut("ACCEPTEE") });
  const preparer = useAction(preparerSousCommande, { onSuccess: () => setStatut("EN_PREPARATION") });
  const refuser = useAction(refuserSousCommande, { onSuccess: () => (setStatut("REFUSEE"), setDialog(null)) });
  const expedier = useAction(expedierSousCommande, { onSuccess: () => (setStatut("EXPEDIEE"), setDialog(null)) });
  const size = compact ? "sm" : "default";

  const bordereau = (
    <Button variant="outline" size={size} onClick={() => toast("Bordereau généré (démo)", { description: `Colis ${numero}` })}>
      <Printer aria-hidden /> {!compact && "Imprimer le bordereau"}
    </Button>
  );

  return (
    <div className="flex flex-wrap gap-2">
      {statut === "EN_ATTENTE" && (
        <>
          <Button variant="brand" size={size} disabled={accepter.pending} onClick={() => accepter.run({ numero })}>
            <Check aria-hidden /> Accepter
          </Button>
          <Dialog open={dialog === "refus"} onOpenChange={(o) => setDialog(o ? "refus" : null)}>
            <DialogTrigger asChild>
              <Button variant="outline" size={size}>
                <X aria-hidden /> Refuser
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-display text-xl">Refuser la commande</DialogTitle>
                <DialogDescription>Le client sera remboursé et prévenu. Indiquez-lui la raison.</DialogDescription>
              </DialogHeader>
              <div className="space-y-1.5">
                <Label htmlFor={`motif-${numero}`}>Motif du refus</Label>
                <Textarea id={`motif-${numero}`} value={motif} onChange={(e) => setMotif(e.target.value)} placeholder="Stock épuisé suite à une vente sur place…" />
              </div>
              <DialogFooter>
                <Button variant="destructive" disabled={refuser.pending} onClick={() => refuser.run({ numero, motif })}>
                  Confirmer le refus
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
      {statut === "ACCEPTEE" && (
        <Button variant="brand" size={size} disabled={preparer.pending} onClick={() => preparer.run({ numero })}>
          <ChefHat aria-hidden /> Marquer « En préparation »
        </Button>
      )}
      {statut === "EN_PREPARATION" && (
        <>
          <Dialog open={dialog === "expedition"} onOpenChange={(o) => setDialog(o ? "expedition" : null)}>
            <DialogTrigger asChild>
              <Button variant="brand" size={size}>
                <Truck aria-hidden /> Expédier
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-display text-xl">Expédier le colis</DialogTitle>
                <DialogDescription>Le client reçoit le numéro de suivi par SMS et notification.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor={`tr-${numero}`}>Transporteur</Label>
                  <Select value={transporteur} onValueChange={setTransporteur}>
                    <SelectTrigger id={`tr-${numero}`} className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["Aramex Tunisie", "Rapid-Poste", "First Delivery", "Livraison par mes soins"].map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor={`suivi-${numero}`}>Numéro de suivi</Label>
                  <Input id={`suivi-${numero}`} value={suivi} onChange={(e) => setSuivi(e.target.value)} placeholder="ARX-TN-48213907" className="font-mono" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="brand" disabled={expedier.pending} onClick={() => expedier.run({ numero, transporteur, numeroSuivi: suivi })}>
                  Confirmer l&apos;expédition
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          {bordereau}
        </>
      )}
      {statut === "EXPEDIEE" && bordereau}
      {["LIVREE", "REFUSEE", "ANNULEE", "REMBOURSEE"].includes(statut) && <span className="text-[13px] text-muted-foreground">Aucune action requise</span>}
    </div>
  );
}
