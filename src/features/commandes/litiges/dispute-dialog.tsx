"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { MOTIF_LITIGE } from "@/lib/constants";
import { useAction } from "@/hooks/use-action";
import type { MotifLitige } from "@/types/enums";
import { ouvrirLitige } from "@/server/modules/commandes/actions";

/** « Signaler un problème » sur une sous-commande → Server Action ouvrirLitige. */
export function DisputeDialog({ sousCommandeNumero, trigger }: { sousCommandeNumero: string; trigger: React.ReactNode }) {
  const [ouvert, setOuvert] = useState(false);
  const [motif, setMotif] = useState<MotifLitige>("ABIME");
  const [description, setDescription] = useState("");
  const { run, pending } = useAction(ouvrirLitige, { onSuccess: () => setOuvert(false) });
  return (
    <Dialog open={ouvert} onOpenChange={setOuvert}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Signaler un problème</DialogTitle>
          <DialogDescription>
            Colis <span className="font-mono">{sousCommandeNumero}</span> — notre équipe vous répond sous 24 h.
          </DialogDescription>
        </DialogHeader>
        <RadioGroup value={motif} onValueChange={(v) => setMotif(v as MotifLitige)} className="gap-2">
          {Object.entries(MOTIF_LITIGE).map(([k, l]) => (
            <Label key={k} htmlFor={`motif-${k}`} className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border px-3">
              <RadioGroupItem id={`motif-${k}`} value={k} /> {l}
            </Label>
          ))}
        </RadioGroup>
        <div className="space-y-1.5">
          <Label htmlFor="litige-desc">Décrivez le problème</Label>
          <Textarea id="litige-desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ce que vous avez constaté à la réception…" />
        </div>
        <DialogFooter>
          <Button variant="destructive" disabled={pending} onClick={() => run({ sousCommandeNumero, motif, description })}>
            Envoyer le signalement
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
