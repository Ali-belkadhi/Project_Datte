"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/input";
import { Alerte } from "@/components/ui/feedback";
import { actionReinitialiserMotDePasse } from "@/server/actions/auth.actions";
import { KeyRound, Loader2 } from "lucide-react";

export function FormulaireReinitialisation({ token }: { token: string }) {
  const [erreur, setErreur] = useState<string | null>(null);
  const [succes, setSucces] = useState<string | null>(null);
  const [erreursChamps, setErreursChamps] = useState<Record<string, string[] | undefined>>({});
  const [enCours, demarrer] = useTransition();

  function envoyer(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const donnees = new FormData(e.currentTarget);
    donnees.set("token", token);
    setErreur(null);
    setSucces(null);
    setErreursChamps({});

    demarrer(async () => {
      const reponse = await actionReinitialiserMotDePasse(donnees);
      if (!reponse.success) {
        setErreur(reponse.error ?? "Impossible de réinitialiser le mot de passe");
        setErreursChamps(reponse.errors ?? {});
        return;
      }
      setSucces(reponse.message ?? "Mot de passe mis à jour.");
    });
  }

  if (succes) {
    return (
      <div className="space-y-5">
        <Alerte type="succes">{succes}</Alerte>
        <Button asChild className="w-full rounded-full py-6">
          <Link href="/connexion">Se connecter</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {erreur && <Alerte type="erreur">{erreur}</Alerte>}

      <form className="space-y-5" onSubmit={envoyer} noValidate>
        <div>
          <Field
            label="Nouveau mot de passe"
            id="nouveauMotDePasse"
            name="nouveauMotDePasse"
            type="password"
            required
            placeholder="Au moins 8 caractères"
          />
          {erreursChamps.nouveauMotDePasse && (
            <p className="mt-1 text-xs text-destructive">{erreursChamps.nouveauMotDePasse[0]}</p>
          )}
        </div>

        <div>
          <Field
            label="Confirmer le mot de passe"
            id="confirmationMotDePasse"
            name="confirmationMotDePasse"
            type="password"
            required
            placeholder="••••••••"
          />
          {erreursChamps.confirmationMotDePasse && (
            <p className="mt-1 text-xs text-destructive">{erreursChamps.confirmationMotDePasse[0]}</p>
          )}
        </div>

        <Button
          type="submit"
          size="lg"
          disabled={enCours}
          className="w-full rounded-full py-6 text-base font-semibold"
        >
          {enCours ? <Loader2 className="size-4 animate-spin" /> : <KeyRound className="size-4" />}
          Réinitialiser mon mot de passe
        </Button>
      </form>
    </div>
  );
}
