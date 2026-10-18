"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Field, Label, Input } from "@/components/ui/input";
import { Alerte } from "@/components/ui/feedback";
import { actionInscrire, actionConnecterGoogle } from "@/server/actions/auth.actions";
import { Loader2, UserPlus } from "lucide-react";

export function FormulaireInscription() {
  const [erreur, setErreur] = useState<string | null>(null);
  const [succes, setSucces] = useState<string | null>(null);
  const [erreursChamps, setErreursChamps] = useState<Record<string, string[] | undefined>>({});
  const [enCours, demarrer] = useTransition();

  function envoyer(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const donnees = new FormData(e.currentTarget);
    setErreur(null);
    setSucces(null);
    setErreursChamps({});

    demarrer(async () => {
      const reponse = await actionInscrire(donnees);

      if (!reponse.success) {
        setErreur(reponse.error ?? "Veuillez corriger les champs signalés");
        setErreursChamps(reponse.errors ?? {});
        return;
      }

      setSucces(reponse.message ?? "Compte créé.");
    });
  }

  if (succes) {
    return (
      <div className="space-y-5">
        <Alerte type="succes">{succes}</Alerte>
        <p className="text-sm text-muted">
          Une fois votre email vérifié, vous pourrez{" "}
          <Link href="/connexion" className="font-semibold text-forest underline">
            vous connecter
          </Link>
          .
        </p>
      </div>
    );
  }

  const message = (champ: string) => erreursChamps[champ]?.[0];

  return (
    <div className="space-y-5">
      {erreur && <Alerte type="erreur">{erreur}</Alerte>}

      <form className="space-y-5" onSubmit={envoyer} noValidate>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Field label="Prénom" id="prenom" name="prenom" required placeholder="Mohamed" />
            {message("prenom") && <p className="mt-1 text-xs text-destructive">{message("prenom")}</p>}
          </div>
          <div>
            <Field label="Nom" id="nom" name="nom" required placeholder="Trabelsi" />
            {message("nom") && <p className="mt-1 text-xs text-destructive">{message("nom")}</p>}
          </div>
        </div>

        <div>
          <Field label="Adresse e-mail" id="email" name="email" type="email" required placeholder="votre@email.com" />
          {message("email") && <p className="mt-1 text-xs text-destructive">{message("email")}</p>}
        </div>

        <div>
          <Field
            label="Téléphone"
            id="telephone"
            name="telephone"
            type="tel"
            placeholder="+21600000000"
            hint="Format international : +216XXXXXXXX (optionnel)"
          />
          {message("telephone") && <p className="mt-1 text-xs text-destructive">{message("telephone")}</p>}
        </div>

        <div>
          <Label htmlFor="role">Je souhaite</Label>
          <select
            id="role"
            name="role"
            defaultValue="CLIENT"
            className="flex h-12 w-full rounded-xl border border-input bg-cream-50 px-4 text-sm text-ink focus-visible:border-gold focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-gold/15"
          >
            <option value="CLIENT">Acheter des produits</option>
            <option value="FOURNISSEUR">Vendre mes produits</option>
          </select>
        </div>

        <div>
          <Label htmlFor="langue">Langue préférée</Label>
          <select
            id="langue"
            name="langue"
            defaultValue="FR"
            className="flex h-12 w-full rounded-xl border border-input bg-cream-50 px-4 text-sm text-ink focus-visible:border-gold focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-gold/15"
          >
            <option value="FR">Français</option>
            <option value="AR">العربية</option>
            <option value="EN">English</option>
          </select>
        </div>

        <div>
          <Field
            label="Mot de passe"
            id="motDePasse"
            name="motDePasse"
            type="password"
            required
            placeholder="Au moins 8 caractères"
          />
          {message("motDePasse") && <p className="mt-1 text-xs text-destructive">{message("motDePasse")}</p>}
        </div>

        <div className="flex items-start gap-2 text-xs text-muted">
          <input type="checkbox" required className="mt-0.5 rounded border-forest/20 text-forest focus:ring-gold" />
          <span>
            J&apos;accepte les{" "}
            <Link href="/a-propos#cgv" className="text-forest underline">
              Conditions Générales de Vente
            </Link>{" "}
            et la politique de confidentialité.
          </span>
        </div>

        <Button
          type="submit"
          size="lg"
          disabled={enCours}
          className="w-full rounded-full bg-forest text-cream hover:bg-forest-700 py-6 text-base font-semibold"
        >
          {enCours ? <Loader2 className="size-4 animate-spin" /> : <UserPlus className="size-4" />}
          Créer mon compte
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
