"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { inscriptionSchema, type InscriptionInput } from "@/lib/validation/comptes";
import { useAction } from "@/hooks/use-action";
import { inscrire } from "@/server/modules/comptes/actions";
import { FormField } from "./form-field";
import { GoogleButton, Separateur } from "./google-button";
import { RolePicker } from "./role-picker";

/** Inscription : choix du rôle (pré-sélection via ?role=vendeur), puis le formulaire. */
export function SignupForm({ roleInitial }: { roleInitial: "CLIENT" | "FOURNISSEUR" }) {
  const router = useRouter();
  const { run, pending } = useAction(inscrire, { onSuccess: (d) => router.push(d.redirection) });
  const form = useForm<InscriptionInput>({
    resolver: zodResolver(inscriptionSchema),
    defaultValues: { role: roleInitial, prenom: "", nom: "", email: "", telephone: "", motDePasse: "", conditions: false as unknown as true },
  });
  const e = form.formState.errors;
  const role = form.watch("role");
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="font-display text-3xl font-semibold">Créer votre compte</h1>
        <p className="text-muted-foreground">{role === "FOURNISSEUR" ? "Ouvrez votre boutique en quelques minutes : 3 crédits 3D offerts." : "Rejoignez les amateurs de dattes de toute la Tunisie."}</p>
      </div>
      <Controller control={form.control} name="role" render={({ field }) => <RolePicker value={field.value} onChange={field.onChange} />} />
      <GoogleButton />
      <Separateur texte="ou avec votre e-mail" />
      <form onSubmit={form.handleSubmit((v) => run(v))} className="space-y-4" noValidate>
        <div className="grid grid-cols-2 gap-3">
          <FormField id="prenom" label="Prénom" erreur={e.prenom?.message}>
            <Input id="prenom" autoComplete="given-name" {...form.register("prenom")} aria-invalid={!!e.prenom} />
          </FormField>
          <FormField id="nom" label="Nom" erreur={e.nom?.message}>
            <Input id="nom" autoComplete="family-name" {...form.register("nom")} aria-invalid={!!e.nom} />
          </FormField>
        </div>
        <FormField id="email" label="Adresse e-mail" erreur={e.email?.message}>
          <Input id="email" type="email" autoComplete="email" {...form.register("email")} aria-invalid={!!e.email} />
        </FormField>
        <FormField id="tel" label="Téléphone" erreur={e.telephone?.message} aide="Un code de vérification vous sera envoyé par SMS.">
          <Input id="tel" type="tel" autoComplete="tel" placeholder="+216 22 345 678" {...form.register("telephone")} aria-invalid={!!e.telephone} />
        </FormField>
        <FormField id="mdp" label="Mot de passe" erreur={e.motDePasse?.message} aide="8 caractères minimum.">
          <Input id="mdp" type="password" autoComplete="new-password" {...form.register("motDePasse")} aria-invalid={!!e.motDePasse} />
        </FormField>
        <Controller
          control={form.control}
          name="conditions"
          render={({ field }) => (
            <div className="space-y-1">
              <div className="flex items-start gap-2.5">
                <Checkbox id="cgu" checked={field.value === true} onCheckedChange={(c) => field.onChange(c === true)} className="mt-0.5" />
                <Label htmlFor="cgu" className="text-sm leading-snug font-normal">
                  J&apos;accepte les conditions générales et la politique de confidentialité de DEGLA.
                </Label>
              </div>
              {e.conditions && <p className="text-[13px] text-danger">{e.conditions.message}</p>}
            </div>
          )}
        />
        <Button type="submit" variant="brand" size="lg" className="w-full" disabled={pending}>
          {pending ? "Création…" : role === "FOURNISSEUR" ? "Créer mon compte vendeur" : "Créer mon compte"}
        </Button>
      </form>
      <p className="text-center text-sm text-muted-foreground">
        Déjà inscrit ?{" "}
        <Link href="/connexion" className="font-semibold text-date hover:underline">
          Se connecter
        </Link>
      </p>
    </div>
  );
}
