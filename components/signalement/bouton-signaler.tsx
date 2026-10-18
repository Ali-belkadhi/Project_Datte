"use client";

import { useState, useTransition } from "react";
import { Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { Alerte } from "@/components/ui/feedback";
import { actionSignaler } from "@/server/actions/signalement.actions";
import { CibleSignalement } from "@/domain/enums";

export function BoutonSignaler({
  cibleType,
  cibleId,
  className,
}: {
  cibleType: CibleSignalement;
  cibleId: string;
  className?: string;
}) {
  const [ouvert, setOuvert] = useState(false);
  const [motif, setMotif] = useState("");
  const [retour, setRetour] = useState<{ ok: boolean; texte: string } | null>(null);
  const [enCours, demarrer] = useTransition();

  function envoyer(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const donnees = new FormData();
    donnees.set("cibleType", cibleType);
    donnees.set("cibleId", cibleId);
    donnees.set("motif", motif);
    setRetour(null);

    demarrer(async () => {
      const reponse = await actionSignaler(donnees);
      if (!reponse.success) {
        setRetour({
          ok: false,
          texte:
            (reponse.errors as Record<string, string[] | undefined>)?._form?.[0] ??
            "Impossible d'envoyer le signalement.",
        });
        return;
      }
      setRetour({ ok: true, texte: reponse.message ?? "Signalement transmis." });
      setMotif("");
    });
  }

  if (!ouvert) {
    return (
      <button
        type="button"
        onClick={() => setOuvert(true)}
        className={
          className ??
          "inline-flex items-center gap-1.5 text-xs text-muted transition-colors hover:text-destructive"
        }
      >
        <Flag className="size-3.5" /> Signaler
      </button>
    );
  }

  return (
    <form onSubmit={envoyer} className="mt-3 space-y-3 rounded-2xl border border-forest/15 bg-cream-50/80 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink/70">
        Signaler ce contenu
      </p>
      {retour && <Alerte type={retour.ok ? "succes" : "erreur"}>{retour.texte}</Alerte>}
      <Textarea
        name="motif"
        value={motif}
        onChange={(e) => setMotif(e.target.value)}
        minLength={10}
        maxLength={1000}
        required
        placeholder="Décrivez le problème (10 caractères minimum)…"
        className="min-h-24"
      />
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={enCours}>
          {enCours ? "Envoi…" : "Envoyer"}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => setOuvert(false)}>
          Annuler
        </Button>
      </div>
    </form>
  );
}
