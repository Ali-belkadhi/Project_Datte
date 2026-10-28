"use client";
import { useState } from "react";
import { Check, Coins, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { formatPrix } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useAction } from "@/hooks/use-action";
import type { PackCredits3D } from "@/types/domain";
import { acheterCredits3D } from "@/server/modules/catalogue/actions";

/** Pack de crédits 3D + Dialog de confirmation (paiement simulé). */
export function CreditPackCard({ pack: p }: { pack: PackCredits3D }) {
  const [ouvert, setOuvert] = useState(false);
  const { run, pending } = useAction(acheterCredits3D, { onSuccess: () => setOuvert(false) });
  return (
    <div className={cn("relative flex flex-col gap-4 rounded-2xl border-2 bg-card p-5", p.misEnAvant ? "border-brand-fill shadow-lift" : "border-border")}>
      {p.misEnAvant && <Badge className="absolute -top-3 start-5 bg-brand text-brand-foreground">Le plus choisi</Badge>}
      <div>
        <p className="font-display text-xl font-semibold">{p.nom}</p>
        <p className="text-[13px] text-muted-foreground">{p.description}</p>
      </div>
      <p className="flex items-baseline gap-2">
        <span className="font-display text-4xl font-semibold tabular-nums">{p.nombreCredits}</span>
        <span className="text-muted-foreground">crédits</span>
      </p>
      <ul className="space-y-1.5 text-sm">
        <li className="flex items-center gap-2">
          <Check className="size-4 text-success" aria-hidden /> {formatPrix(Math.round(p.prix / p.nombreCredits))} le crédit
        </li>
        <li className="flex items-center gap-2">
          <Check className="size-4 text-success" aria-hidden /> Crédits restitués en cas d&apos;échec
        </li>
      </ul>
      <Dialog open={ouvert} onOpenChange={setOuvert}>
        <DialogTrigger asChild>
          <Button variant={p.misEnAvant ? "brand" : "outline"} className="mt-auto w-full">
            Acheter · {formatPrix(p.prix)}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Confirmer l&apos;achat du pack {p.nom}</DialogTitle>
            <DialogDescription>
              {p.nombreCredits} crédits 3D pour {formatPrix(p.prix)}, ajoutés immédiatement à votre solde.
            </DialogDescription>
          </DialogHeader>
          <p className="flex items-center gap-2 rounded-xl bg-brand-soft px-3 py-2.5 text-sm text-accent-foreground">
            <Lock className="size-4" aria-hidden /> Paiement simulé (Konnect / Flouci) — aucun débit réel.
          </p>
          <DialogFooter>
            <Button variant="brand" disabled={pending} onClick={() => run({ packId: p.id })}>
              <Coins aria-hidden /> Payer {formatPrix(p.prix)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
