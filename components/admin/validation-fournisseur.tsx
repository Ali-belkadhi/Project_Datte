"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Alerte } from "@/components/ui/feedback";
import { Label, Textarea } from "@/components/ui/input";
import {
  actionValiderFournisseur,
  actionSuspendreFournisseur,
} from "@/server/actions/fournisseur.actions";
import { Check, X, Ban, Loader2, RotateCcw } from "lucide-react";

type Action = "valider" | "refuser" | "suspendre" | null;

export function ValidationFournisseur({
  fournisseurId,
  statut,
}: {
  fournisseurId: string;
  statut: string;
}) {
  const router = useRouter();
  const [action, setAction] = useState<Action>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [succes, setSucces] = useState<string | null>(null);
  const [enCours, demarrer] = useTransition();

  function rafraichir() {
    router.refresh();
  }

  function valider() {
    setErreur(null);
    setSucces(null);
    const fd = new FormData();
    fd.set("fournisseurId", fournisseurId);
    fd.set("valide", "true");
    demarrer(async () => {
      const rep = await actionValiderFournisseur(fd);
      if (!rep.success) {
        setErreur("Validation impossible.");
        return;
      }
      setSucces("Fournisseur validé.");
      setAction(null);
      rafraichir();
    });
  }

  function refuser(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const motif = String(new FormData(e.currentTarget).get("motifRefus") ?? "");
    setErreur(null);
    setSucces(null);
    const fd = new FormData();
    fd.set("fournisseurId", fournisseurId);
    fd.set("valide", "false");
    fd.set("motifRefus", motif);
    demarrer(async () => {
      const rep = await actionValiderFournisseur(fd);
      if (!rep.success) {
        setErreur("Motif requis (10 caractères minimum).");
        return;
      }
      setSucces("Demande refusée.");
      setAction(null);
      rafraichir();
    });
  }

  function suspendre(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const motif = String(new FormData(e.currentTarget).get("motif") ?? "");
    setErreur(null);
    setSucces(null);
    const fd = new FormData();
    fd.set("fournisseurId", fournisseurId);
    fd.set("motif", motif);
    demarrer(async () => {
      const rep = await actionSuspendreFournisseur(fd);
      if (!rep.success) {
        setErreur("Suspension impossible.");
        return;
      }
      setSucces("Fournisseur suspendu.");
      setAction(null);
      rafraichir();
    });
  }

  return (
    <div className="space-y-4">
      {erreur && <Alerte type="erreur">{erreur}</Alerte>}
      {succes && <Alerte type="succes">{succes}</Alerte>}

      {!action && (
        <div className="flex flex-wrap gap-3">
          {statut !== "VERIFIE" && (
            <Button onClick={valider} disabled={enCours} className="rounded-full">
              {enCours ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
              Valider
            </Button>
          )}
          {statut !== "REFUSE" && (
            <Button
              variant="outline"
              onClick={() => setAction("refuser")}
              className="rounded-full"
            >
              <X className="size-4" /> Refuser
            </Button>
          )}
          {statut !== "SUSPENDU" && (
            <Button
              variant="ghost"
              onClick={() => setAction("suspendre")}
              className="rounded-full text-destructive hover:bg-destructive/10"
            >
              <Ban className="size-4" /> Suspendre
            </Button>
          )}
        </div>
      )}

      {action === "refuser" && (
        <form onSubmit={refuser} className="space-y-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-4">
          <Label htmlFor="motifRefus">Motif du refus (obligatoire, 10 caractères min.)</Label>
          <Textarea id="motifRefus" name="motifRefus" required minLength={10} />
          <div className="flex gap-2">
            <Button type="submit" disabled={enCours} className="rounded-full">
              {enCours && <Loader2 className="size-4 animate-spin" />} Confirmer le refus
            </Button>
            <Button type="button" variant="ghost" onClick={() => setAction(null)}>
              Annuler
            </Button>
          </div>
        </form>
      )}

      {action === "suspendre" && (
        <form onSubmit={suspendre} className="space-y-3 rounded-2xl border border-forest/20 bg-cream-50 p-4">
          <Label htmlFor="motif">Motif de la suspension (optionnel)</Label>
          <Textarea id="motif" name="motif" />
          <div className="flex gap-2">
            <Button type="submit" disabled={enCours} className="rounded-full">
              {enCours && <Loader2 className="size-4 animate-spin" />} Confirmer la suspension
            </Button>
            <Button type="button" variant="ghost" onClick={() => setAction(null)}>
              Annuler
            </Button>
          </div>
        </form>
      )}

      {statut === "REFUSE" && !action && (
        <Button variant="ghost" onClick={() => setAction("valider")} className="rounded-full">
          <RotateCcw className="size-4" /> Reconsidérer
        </Button>
      )}
    </div>
  );
}
