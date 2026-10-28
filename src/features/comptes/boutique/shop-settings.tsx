"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAction } from "@/hooks/use-action";
import { changerEtatBoutiqueAction, majRib } from "@/server/modules/comptes/actions";

/** Coordonnées bancaires : affichage masqué réel + formulaire de mise à jour. */
export function RibSettings({ last4 }: { last4: string | null }) {
  const [ouvert, setOuvert] = useState(false);
  const [rib, setRib] = useState("");
  const { run, pending } = useAction(majRib, {
    onSuccess: () => {
      setRib("");
      setOuvert(false);
    },
  });
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="font-mono tracking-widest">{last4 ? `•••• •••• •••• ${last4}` : "Non renseigné"}</span>
      <Sheet open={ouvert} onOpenChange={setOuvert}>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm">Modifier</Button>
        </SheetTrigger>
        <SheetContent className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Modifier le RIB</SheetTitle>
            <SheetDescription>
              Le RIB est chiffré. Toute modification sur une boutique vérifiée déclenche une nouvelle vérification.
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-2 px-4">
            <Label htmlFor="rib">RIB (20 chiffres)</Label>
            <Input
              id="rib"
              inputMode="numeric"
              autoComplete="off"
              value={rib}
              onChange={(e) => setRib(e.target.value.replace(/\D/g, "").slice(0, 20))}
              placeholder="•••• •••• •••• •••• ••••"
              className="font-mono tracking-widest"
            />
          </div>
          <SheetFooter>
            <Button variant="brand" disabled={pending || rib.length !== 20} onClick={() => void run({ rib })}>
              {pending ? "Enregistrement…" : "Enregistrer le RIB"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}

/** Zone de danger : pause, reprise, fermeture réelles. */
export function ShopStateActions({ statut }: { statut: string | null }) {
  const { run, pending } = useAction(changerEtatBoutiqueAction);
  const verifiee = statut === "VERIFIE";
  const suspendue = statut === "SUSPENDU";
  return (
    <div className="flex flex-wrap gap-2">
      {verifiee && (
        <Button variant="outline" size="sm" disabled={pending} onClick={() => void run({ etat: "PAUSE" })}>
          Mettre en pause
        </Button>
      )}
      {suspendue && (
        <Button variant="outline" size="sm" disabled={pending} onClick={() => void run({ etat: "REPRENDRE" })}>
          Reprendre la vente
        </Button>
      )}
      <Button
        variant="destructive"
        size="sm"
        disabled={pending || !verifiee}
        onClick={() => {
          if (window.confirm("Fermer la boutique ? Elle sera suspendue immédiatement.")) void run({ etat: "FERMER" });
        }}
      >
        Fermer la boutique
      </Button>
    </div>
  );
}
