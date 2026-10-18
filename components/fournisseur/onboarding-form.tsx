"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Field, Label, Input, Textarea } from "@/components/ui/input";
import { Alerte } from "@/components/ui/feedback";
import {
  actionOnboardingFournisseur,
  actionAjouterDocument,
} from "@/server/actions/fournisseur.actions";
import { TypeFournisseur, Gouvernorat, TypeDocument } from "@/domain/enums";
import { Loader2, ArrowLeft, ArrowRight, Check } from "lucide-react";

const ETAPES = ["Boutique", "Informations légales", "Documents"];

const DOCUMENTS: { type: TypeDocument; label: string }[] = [
  { type: TypeDocument.CIN, label: "CIN (carte d'identité nationale)" },
  { type: TypeDocument.RNE, label: "RNE (registre national des entreprises)" },
  { type: TypeDocument.PATENTE, label: "Patente" },
];

export function OnboardingForm() {
  const router = useRouter();
  const [etape, setEtape] = useState(0);
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, demarrer] = useTransition();

  function suivant(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    setErreur(null);
    setEtape((v) => Math.min(v + 1, ETAPES.length - 1));
  }

  function precedent(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    setErreur(null);
    setEtape((v) => Math.max(v - 1, 0));
  }

  function soumettre(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const donnees = new FormData(form);
    setErreur(null);

    demarrer(async () => {
      const reponse = await actionOnboardingFournisseur(donnees);
      if (!reponse.success) {
        const erreurs = reponse.errors as Record<string, string[] | undefined> | undefined;
        setErreur(
          erreurs?._form?.[0] ??
            "Veuillez vérifier les informations saisies (RIB = 20 chiffres)."
        );
        return;
      }

      // Envoi des documents renseignés
      for (const { type } of DOCUMENTS) {
        const url = String(donnees.get(`doc_${type}`) ?? "").trim();
        if (!url) continue;
        const fd = new FormData();
        fd.set("type", type);
        fd.set("fichierUrl", url);
        await actionAjouterDocument(fd);
      }

      router.push("/fournisseur/tableau-de-bord");
      router.refresh();
    });
  }

  return (
    <form onSubmit={soumettre} className="space-y-8">
      {/* Stepper */}
      <ol className="flex flex-wrap items-center gap-3">
        {ETAPES.map((label, i) => (
          <li key={label} className="flex items-center gap-3">
            <span
              className={`flex size-8 items-center justify-center rounded-full text-sm font-semibold ${
                i <= etape ? "bg-forest text-cream" : "bg-beige text-forest/60"
              }`}
            >
              {i < etape ? <Check className="size-4" /> : i + 1}
            </span>
            <span className={`text-sm ${i <= etape ? "text-forest" : "text-muted"}`}>{label}</span>
            {i < ETAPES.length - 1 && <span className="h-px w-8 bg-forest/20" />}
          </li>
        ))}
      </ol>

      {erreur && <Alerte type="erreur">{erreur}</Alerte>}

      {/* Étape 1 */}
      <div className={etape === 0 ? "grid gap-5 sm:grid-cols-2" : "hidden"}>
        <Field
          label="Nom de la boutique"
          id="nomBoutique"
          name="nomBoutique"
          placeholder="Dattes du Sud"
          required
        />
        <div>
          <Label htmlFor="type">Type d&apos;activité</Label>
          <select
            id="type"
            name="type"
            defaultValue={TypeFournisseur.PRODUCTEUR}
            className="flex h-12 w-full rounded-xl border border-input bg-cream-50 px-4 text-sm text-ink focus-visible:border-gold focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-gold/15"
          >
            {Object.values(TypeFournisseur).map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="region">Gouvernorat</Label>
          <select
            id="region"
            name="region"
            defaultValue={Gouvernorat.KEBILI}
            className="flex h-12 w-full rounded-xl border border-input bg-cream-50 px-4 text-sm text-ink focus-visible:border-gold focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-gold/15"
          >
            {Object.values(Gouvernorat).map((g) => (
              <option key={g} value={g}>
                {g.replace("_", " ")}
              </option>
            ))}
          </select>
        </div>
        <Field
          label="Adresse d'exploitation"
          id="adresseExploitation"
          name="adresseExploitation"
          placeholder="Route de Tozeur, Kébili"
          required
          className="sm:col-span-2"
        />
        <div className="sm:col-span-2">
          <Label htmlFor="description">Description (optionnel)</Label>
          <Textarea id="description" name="description" placeholder="Présentez votre activité..." />
        </div>
      </div>

      {/* Étape 2 */}
      <div className={etape === 1 ? "grid gap-5 sm:grid-cols-2" : "hidden"}>
        <Field
          label="Matricule fiscal (optionnel)"
          id="matriculeFiscal"
          name="matriculeFiscal"
          placeholder="0000000/A/M/000"
        />
        <Field
          label="Numéro RNE (optionnel)"
          id="numeroRNE"
          name="numeroRNE"
          placeholder="0000000X"
        />
        <Field
          label="RIB bancaire (20 chiffres)"
          id="rib"
          name="rib"
          placeholder="00000000000000000000"
          inputMode="numeric"
          maxLength={20}
          required
          className="sm:col-span-2"
        />
      </div>

      {/* Étape 3 */}
      <div className={etape === 2 ? "space-y-5" : "hidden"}>
        <p className="text-sm text-muted">
          Renseignez un lien vers chaque document (PDF ou image hébergé). Ils seront examinés par
          notre équipe.
        </p>
        {DOCUMENTS.map(({ type, label }) => (
          <Field
            key={type}
            label={label}
            id={`doc_${type}`}
            name={`doc_${type}`}
            type="url"
            placeholder="https://..."
          />
        ))}
      </div>

      {/* Navigation */}
      <div className="flex flex-wrap gap-3">
        {etape > 0 && (
          <Button type="button" variant="ghost" onClick={precedent} className="rounded-full">
            <ArrowLeft className="size-4" /> Précédent
          </Button>
        )}
        {etape < ETAPES.length - 1 ? (
          <Button type="button" onClick={suivant} className="rounded-full">
            Suivant <ArrowRight className="size-4" />
          </Button>
        ) : (
          <Button type="submit" disabled={enCours} className="rounded-full">
            {enCours ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
            Envoyer ma demande
          </Button>
        )}
      </div>
    </form>
  );
}
