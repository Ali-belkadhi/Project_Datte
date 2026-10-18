"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/input";
import { Alerte } from "@/components/ui/feedback";
import { actionMotDePasseOublie } from "@/server/actions/auth.actions";
import { Loader2, Send } from "lucide-react";

export function FormulaireMotDePasseOublie() {
  const [erreur, setErreur] = useState<string | null>(null);
  const [succes, setSucces] = useState<string | null>(null);
  const [enCours, demarrer] = useTransition();

  function envoyer(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const donnees = new FormData(e.currentTarget);
    setErreur(null);
    setSucces(null);

    demarrer(async () => {
      const reponse = await actionMotDePasseOublie(donnees);
      if (!reponse.success) {
        setErreur(reponse.error ?? "Email invalide");
        return;
      }
      setSucces(reponse.message ?? "Email envoyé.");
    });
  }

  return (
    <div className="space-y-5">
      {erreur && <Alerte type="erreur">{erreur}</Alerte>}
      {succes && <Alerte type="succes">{succes}</Alerte>}

      <form className="space-y-5" onSubmit={envoyer} noValidate>
        <Field
          label="Adresse e-mail"
          id="email"
          name="email"
          type="email"
          required
          placeholder="votre@email.com"
        />
        <Button
          type="submit"
          size="lg"
          disabled={enCours}
          className="w-full rounded-full py-6 text-base font-semibold"
        >
          {enCours ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
          Envoyer le lien de réinitialisation
        </Button>
      </form>

      <p className="border-t border-forest/10 pt-5 text-center text-sm text-muted">
        <Link href="/connexion" className="font-semibold text-forest hover:text-gold-dark underline">
          Retour à la connexion
        </Link>
      </p>
    </div>
  );
}
