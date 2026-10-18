"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Field, Label, Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alerte } from "@/components/ui/feedback";
import {
  actionAjouterAdresse,
  actionModifierAdresse,
  actionSupprimerAdresse,
  actionDefinirAdresseParDefaut,
} from "@/server/actions/adresse.actions";
import { Gouvernorat } from "@/domain/enums";
import { MapPin, Plus, Pencil, Trash2, Star, Loader2, X } from "lucide-react";

export type AdresseVue = {
  id: string;
  libelle: string;
  ligne1: string;
  ligne2?: string;
  ville: string;
  gouvernorat: string;
  codePostal: string;
  telephone: string;
  parDefaut: boolean;
};

function ChampsAdresse({ adresse }: { adresse?: AdresseVue }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field
        label="Libellé"
        id="libelle"
        name="libelle"
        defaultValue={adresse?.libelle}
        placeholder="Maison, Bureau..."
        required
      />
      <Field
        label="Téléphone"
        id="telephone"
        name="telephone"
        defaultValue={adresse?.telephone}
        placeholder="+216XXXXXXXX"
        required
      />
      <Field
        label="Adresse"
        id="ligne1"
        name="ligne1"
        defaultValue={adresse?.ligne1}
        placeholder="N° et rue"
        required
        className="sm:col-span-2"
      />
      <Field
        label="Complément (optionnel)"
        id="ligne2"
        name="ligne2"
        defaultValue={adresse?.ligne2}
        placeholder="Étage, résidence..."
        className="sm:col-span-2"
      />
      <Field label="Ville" id="ville" name="ville" defaultValue={adresse?.ville} required />
      <div>
        <Label htmlFor="gouvernorat">Gouvernorat</Label>
        <select
          id="gouvernorat"
          name="gouvernorat"
          defaultValue={adresse?.gouvernorat ?? "TUNIS"}
          required
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
        label="Code postal"
        id="codePostal"
        name="codePostal"
        defaultValue={adresse?.codePostal}
        placeholder="4000"
        required
      />
    </div>
  );
}

export function AdressesManager({ adresses }: { adresses: AdresseVue[] }) {
  const [ajout, setAjout] = useState(false);
  const [edition, setEdition] = useState<string | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, demarrer] = useTransition();

  function soumettreAjout(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const donnees = new FormData(e.currentTarget);
    const form = e.currentTarget;
    setErreur(null);
    demarrer(async () => {
      const reponse = await actionAjouterAdresse(donnees);
      if (!reponse.success) {
        setErreur(reponse.error ?? "Veuillez vérifier les champs.");
        return;
      }
      form.reset();
      setAjout(false);
    });
  }

  function soumettreEdition(id: string, e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const donnees = new FormData(e.currentTarget);
    setErreur(null);
    demarrer(async () => {
      const reponse = await actionModifierAdresse(id, donnees);
      if (!reponse.success) {
        setErreur(reponse.error ?? "Veuillez vérifier les champs.");
        return;
      }
      setEdition(null);
    });
  }

  function supprimer(id: string) {
    setErreur(null);
    demarrer(async () => {
      const reponse = await actionSupprimerAdresse(id);
      if (!reponse.success) setErreur(reponse.error ?? "Suppression impossible");
    });
  }

  function parDefaut(id: string) {
    setErreur(null);
    demarrer(async () => {
      const reponse = await actionDefinirAdresseParDefaut(id);
      if (!reponse.success) setErreur(reponse.error ?? "Action impossible");
    });
  }

  return (
    <div className="space-y-5">
      {erreur && <Alerte type="erreur">{erreur}</Alerte>}

      {adresses.length === 0 && !ajout && (
        <p className="text-sm text-muted">Aucune adresse enregistrée pour le moment.</p>
      )}

      <ul className="space-y-4">
        {adresses.map((adresse) =>
          edition === adresse.id ? (
            <li key={adresse.id}>
              <form
                onSubmit={(e) => soumettreEdition(adresse.id, e)}
                className="rounded-2xl border border-gold/40 bg-cream-50 p-5"
              >
                <ChampsAdresse adresse={adresse} />
                <div className="mt-4 flex gap-3">
                  <Button type="submit" disabled={enCours} className="rounded-full">
                    {enCours && <Loader2 className="size-4 animate-spin" />} Enregistrer
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setEdition(null)}
                    className="rounded-full"
                  >
                    Annuler
                  </Button>
                </div>
              </form>
            </li>
          ) : (
            <li
              key={adresse.id}
              className="rounded-2xl border border-forest/10 bg-cream-50/70 p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex gap-3">
                  <MapPin className="mt-0.5 size-4 text-gold" />
                  <div>
                    <p className="flex items-center gap-2 font-medium text-forest">
                      {adresse.libelle}
                      {adresse.parDefaut && <Badge variant="gold">Par défaut</Badge>}
                    </p>
                    <p className="text-sm text-ink/70">
                      {adresse.ligne1}
                      {adresse.ligne2 ? `, ${adresse.ligne2}` : ""}
                      <br />
                      {adresse.ville}, {adresse.gouvernorat.replace("_", " ")} {adresse.codePostal}
                      <br />
                      {adresse.telephone}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {!adresse.parDefaut && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => parDefaut(adresse.id)}
                      disabled={enCours}
                    >
                      <Star className="size-4" /> Par défaut
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setEdition(adresse.id)}
                  >
                    <Pencil className="size-4" /> Modifier
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => supprimer(adresse.id)}
                    disabled={enCours}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            </li>
          )
        )}
      </ul>

      {ajout ? (
        <form
          onSubmit={soumettreAjout}
          className="rounded-2xl border border-forest/15 bg-cream-50 p-5"
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-serif text-lg font-medium text-forest">Nouvelle adresse</h3>
            <button type="button" onClick={() => setAjout(false)} aria-label="Fermer">
              <X className="size-4 text-muted" />
            </button>
          </div>
          <ChampsAdresse />
          <div className="mt-4">
            <Button type="submit" disabled={enCours} className="rounded-full">
              {enCours ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
              Ajouter l&apos;adresse
            </Button>
          </div>
        </form>
      ) : (
        <Button
          type="button"
          variant="outline"
          onClick={() => setAjout(true)}
          className="rounded-full"
        >
          <Plus className="size-4" /> Ajouter une adresse
        </Button>
      )}
    </div>
  );
}
