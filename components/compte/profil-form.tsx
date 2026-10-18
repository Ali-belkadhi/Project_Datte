"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Field, Label } from "@/components/ui/input";
import { Alerte } from "@/components/ui/feedback";
import { actionUpdateProfil } from "@/server/actions/auth.actions";
import { User, Loader2, Check } from "lucide-react";

const LANGUES = [
  { value: "FR", label: "Français" },
  { value: "AR", label: "العربية (bientôt)" },
  { value: "EN", label: "English (bientôt)" },
];

export function ProfilForm({
  utilisateur,
}: {
  utilisateur: {
    prenom: string;
    nom: string;
    email: string;
    telephone?: string;
    langue: string;
    avatarUrl?: string;
  };
}) {
  const [erreur, setErreur] = useState<string | null>(null);
  const [succes, setSucces] = useState<string | null>(null);
  const [erreursChamps, setErreursChamps] = useState<Record<string, string[] | undefined>>({});
  const [avatar, setAvatar] = useState(utilisateur.avatarUrl ?? "");
  const [enCours, demarrer] = useTransition();

  function envoyer(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const donnees = new FormData(e.currentTarget);
    if (avatar.trim()) donnees.set("avatarUrl", avatar.trim());
    else donnees.delete("avatarUrl");
    setErreur(null);
    setSucces(null);
    setErreursChamps({});

    demarrer(async () => {
      const reponse = await actionUpdateProfil(donnees);
      if (!reponse.success) {
        setErreur(reponse.error ?? "Erreur de mise à jour");
        setErreursChamps(reponse.errors ?? {});
        return;
      }
      setSucces(reponse.message ?? "Profil mis à jour.");
    });
  }

  return (
    <form className="space-y-6" onSubmit={envoyer} noValidate>
      {erreur && <Alerte type="erreur">{erreur}</Alerte>}
      {succes && <Alerte type="succes">{succes}</Alerte>}

      <div className="flex items-center gap-4">
        <div className="relative size-16 overflow-hidden rounded-full border border-forest/15 bg-beige/40">
          {avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatar} alt="Photo de profil" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-forest/50">
              <User className="size-7" />
            </div>
          )}
        </div>
        <div className="flex-1">
          <Field
            label="Photo de profil (URL)"
            id="avatarUrl"
            name="avatarUrl"
            type="url"
            placeholder="https://..."
            value={avatar}
            onChange={(e) => setAvatar(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Field
            label="Prénom"
            id="prenom"
            name="prenom"
            defaultValue={utilisateur.prenom}
            required
          />
          {erreursChamps.prenom && (
            <p className="mt-1 text-xs text-destructive">{erreursChamps.prenom[0]}</p>
          )}
        </div>
        <div>
          <Field label="Nom" id="nom" name="nom" defaultValue={utilisateur.nom} required />
          {erreursChamps.nom && (
            <p className="mt-1 text-xs text-destructive">{erreursChamps.nom[0]}</p>
          )}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Field
            label="Email"
            id="email"
            name="email"
            defaultValue={utilisateur.email}
            disabled
            className="opacity-60"
          />
          <p className="mt-1 text-xs text-muted">L&apos;email ne peut pas être modifié ici.</p>
        </div>
        <div>
          <Field
            label="Téléphone"
            id="telephone"
            name="telephone"
            placeholder="+216XXXXXXXX"
            defaultValue={utilisateur.telephone}
          />
          {erreursChamps.telephone && (
            <p className="mt-1 text-xs text-destructive">{erreursChamps.telephone[0]}</p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="langue">Langue préférée</Label>
        <select
          id="langue"
          name="langue"
          defaultValue={utilisateur.langue}
          className="flex h-12 w-full rounded-xl border border-input bg-cream-50 px-4 text-sm text-ink focus-visible:border-gold focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-gold/15"
        >
          {LANGUES.map((l) => (
            <option key={l.value} value={l.value} disabled={l.value !== "FR"}>
              {l.label}
            </option>
          ))}
        </select>
      </div>

      <Button type="submit" disabled={enCours} className="rounded-full">
        {enCours ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
        Enregistrer les modifications
      </Button>
    </form>
  );
}
