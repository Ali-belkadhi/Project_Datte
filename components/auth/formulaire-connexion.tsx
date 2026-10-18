"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/input";
import { Alerte } from "@/components/ui/feedback";
import { actionConnecter, actionConnecterGoogle } from "@/server/actions/auth.actions";
import { ArrowRight, Loader2 } from "lucide-react";

export function FormulaireConnexion({ callbackUrl }: { callbackUrl?: string }) {
  const router = useRouter();
  const [erreur, setErreur] = useState<string | null>(null);
  const [erreursChamps, setErreursChamps] = useState<Record<string, string[] | undefined>>({});
  const [enCours, demarrer] = useTransition();

  function envoyer(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const donnees = new FormData(e.currentTarget);
    setErreur(null);
    setErreursChamps({});

    demarrer(async () => {
      const reponse = await actionConnecter(donnees);

      if (!reponse.success) {
        setErreur(reponse.error ?? "Connexion impossible");
        setErreursChamps(reponse.errors ?? {});
        return;
      }

      const role = reponse.message;
      const destination =
        callbackUrl ??
        (role === "ADMIN"
          ? "/admin"
          : role === "FOURNISSEUR"
            ? "/fournisseur/tableau-de-bord"
            : "/compte");

      router.push(destination);
      router.refresh();
    });
  }

  return (
    <div className="space-y-5">
      {erreur && <Alerte type="erreur">{erreur}</Alerte>}

      <form className="space-y-5" onSubmit={envoyer} noValidate>
        <div>
          <Field label="Adresse e-mail" id="email" name="email" type="email" required placeholder="votre@email.com" />
          {erreursChamps.email && <p className="mt-1 text-xs text-destructive">{erreursChamps.email[0]}</p>}
        </div>

        <div>
          <Field label="Mot de passe" id="motDePasse" name="motDePasse" type="password" required placeholder="••••••••" />
          {erreursChamps.motDePasse && (
            <p className="mt-1 text-xs text-destructive">{erreursChamps.motDePasse[0]}</p>
          )}
        </div>

        <div className="flex items-center justify-between text-xs">
          <label className="flex items-center gap-2 cursor-pointer text-muted">
            <input type="checkbox" name="seSouvenir" className="rounded border-forest/20 text-forest focus:ring-gold" />
            Se souvenir de moi
          </label>
          <Link href="/mot-de-passe-oublie" className="font-medium text-gold-dark hover:underline">
            Mot de passe oublié ?
          </Link>
        </div>

        <Button
          type="submit"
          size="lg"
          disabled={enCours}
          className="w-full rounded-full bg-forest text-cream hover:bg-forest-700 py-6 text-base font-semibold"
        >
          {enCours ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
          Se connecter
        </Button>
      </form>

      <div className="flex items-center gap-3 text-xs uppercase tracking-widest text-muted">
        <span className="h-px flex-1 bg-forest/10" /> ou <span className="h-px flex-1 bg-forest/10" />
      </div>

      <form action={actionConnecterGoogle}>
        <Button type="submit" variant="outline" size="lg" className="w-full py-6">
          Continuer avec Google
        </Button>
      </form>
    </div>
  );
}
