"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Field, Label, Textarea } from "@/components/ui/input";
import { Alerte } from "@/components/ui/feedback";
import { actionUpdateBoutique } from "@/server/actions/fournisseur.actions";
import { Loader2, Check } from "lucide-react";

export function BoutiqueForm({
  fournisseur,
}: {
  fournisseur: {
    id: string;
    nomBoutique: string;
    description?: string;
    logoUrl?: string;
    banniereUrl?: string;
    adresseExploitation: string;
  };
}) {
  const [erreur, setErreur] = useState<string | null>(null);
  const [succes, setSucces] = useState<string | null>(null);
  const [enCours, demarrer] = useTransition();

  function soumettre(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const donnees = new FormData(e.currentTarget);
    // On ne transmet pas les champs vides (schéma .url() optionnel)
    for (const key of ["logoUrl", "banniereUrl"]) {
      if (!String(donnees.get(key) ?? "").trim()) donnees.delete(key);
    }
    setErreur(null);
    setSucces(null);

    demarrer(async () => {
      const reponse = await actionUpdateBoutique(fournisseur.id, donnees);
      if (!reponse.success) {
        setErreur("Veuillez vérifier les champs (URLs valides).");
        return;
      }
      setSucces("Boutique mise à jour.");
    });
  }

  return (
    <form onSubmit={soumettre} className="space-y-5">
      {erreur && <Alerte type="erreur">{erreur}</Alerte>}
      {succes && <Alerte type="succes">{succes}</Alerte>}

      <Field
        label="Nom de la boutique"
        id="nomBoutique"
        name="nomBoutique"
        defaultValue={fournisseur.nomBoutique}
        required
      />
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" defaultValue={fournisseur.description} />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Logo (URL)"
          id="logoUrl"
          name="logoUrl"
          type="url"
          placeholder="https://..."
          defaultValue={fournisseur.logoUrl}
        />
        <Field
          label="Bannière (URL)"
          id="banniereUrl"
          name="banniereUrl"
          type="url"
          placeholder="https://..."
          defaultValue={fournisseur.banniereUrl}
        />
      </div>
      <Field
        label="Adresse d'exploitation"
        id="adresseExploitation"
        name="adresseExploitation"
        defaultValue={fournisseur.adresseExploitation}
        required
      />

      <Button type="submit" disabled={enCours} className="rounded-full">
        {enCours ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
        Enregistrer
      </Button>
    </form>
  );
}
