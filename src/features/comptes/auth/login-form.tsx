"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { connexionSchema, type ConnexionInput } from "@/lib/validation/comptes";
import { useAction } from "@/hooks/use-action";
import { connecter } from "@/server/modules/comptes/actions";
import { FormField } from "./form-field";
import { GoogleButton, Separateur } from "./google-button";

/** Connexion : e-mail + mot de passe, Google (visuel), lien vers l'inscription. */
export function LoginForm() {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const { run, pending } = useAction(connecter, { onSuccess: (d) => router.push(d.redirection) });
  const form = useForm<ConnexionInput>({ resolver: zodResolver(connexionSchema), defaultValues: { email: "sarra.mejri@exemple.tn", motDePasse: "" } });
  const e = form.formState.errors;
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="font-display text-3xl font-semibold">Bon retour parmi nous</h1>
        <p className="text-muted-foreground">Connectez-vous pour retrouver votre panier et suivre vos commandes.</p>
      </div>
      <GoogleButton />
      <Separateur />
      <form onSubmit={form.handleSubmit((v) => run(v))} className="space-y-4" noValidate>
        <FormField id="email" label="Adresse e-mail" erreur={e.email?.message}>
          <Input id="email" type="email" autoComplete="email" {...form.register("email")} aria-invalid={!!e.email} />
        </FormField>
        <FormField
          id="mdp"
          label={
            <span className="flex w-full items-center justify-between">
              Mot de passe
              <Link href="/mot-de-passe" className="text-[13px] font-semibold text-date hover:underline">
                Mot de passe oublié ?
              </Link>
            </span>
          }
          erreur={e.motDePasse?.message}
        >
          <div className="relative">
            <Input id="mdp" type={visible ? "text" : "password"} autoComplete="current-password" className="pe-12" {...form.register("motDePasse")} aria-invalid={!!e.motDePasse} />
            <button type="button" onClick={() => setVisible((v) => !v)} className="absolute end-1 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-lg text-muted-foreground hover:bg-accent" aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}>
              {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </FormField>
        <Button type="submit" variant="brand" size="lg" className="w-full" disabled={pending}>
          {pending ? "Connexion…" : "Se connecter"}
        </Button>
      </form>
      <p className="text-center text-sm text-muted-foreground">
        Pas encore de compte ?{" "}
        <Link href="/inscription" className="font-semibold text-date hover:underline">
          Créer un compte
        </Link>
      </p>
    </div>
  );
}
