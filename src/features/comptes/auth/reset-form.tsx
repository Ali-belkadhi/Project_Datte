"use client";
import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound, MailCheck } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motDePasseOublieSchema } from "@/lib/validation/comptes";
import { useAction } from "@/hooks/use-action";
import { demanderReinitialisation } from "@/server/modules/comptes/actions";
import { FormField } from "./form-field";

/** Réinitialisation du mot de passe : e-mail, puis confirmation d'envoi. */
export function ResetForm() {
  const [envoye, setEnvoye] = useState<string | null>(null);
  const { run, pending } = useAction(demanderReinitialisation, { silencieux: true });
  const form = useForm<z.infer<typeof motDePasseOublieSchema>>({ resolver: zodResolver(motDePasseOublieSchema), defaultValues: { email: "" } });
  if (envoye) {
    return (
      <div className="space-y-6">
        <span className="grid size-14 place-items-center rounded-2xl bg-success-soft text-success">
          <MailCheck className="size-6" aria-hidden />
        </span>
        <div className="space-y-2">
          <h1 className="font-display text-3xl font-semibold">Vérifiez votre boîte mail</h1>
          <p className="text-muted-foreground">
            Si un compte existe pour <span className="font-semibold text-foreground">{envoye}</span>, vous recevrez un lien valable 30 minutes.
          </p>
        </div>
        <Button asChild variant="outline" size="lg" className="w-full">
          <Link href="/connexion">Retour à la connexion</Link>
        </Button>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <span className="grid size-14 place-items-center rounded-2xl bg-brand-soft text-accent-foreground">
        <KeyRound className="size-6" aria-hidden />
      </span>
      <div className="space-y-2">
        <h1 className="font-display text-3xl font-semibold">Mot de passe oublié ?</h1>
        <p className="text-muted-foreground">Indiquez votre adresse e-mail : nous vous enverrons un lien pour en choisir un nouveau.</p>
      </div>
      <form
        className="space-y-4"
        noValidate
        onSubmit={form.handleSubmit(async (v) => {
          const r = await run(v);
          if (r.ok) setEnvoye(v.email);
        })}
      >
        <FormField id="email" label="Adresse e-mail" erreur={form.formState.errors.email?.message}>
          <Input id="email" type="email" autoComplete="email" {...form.register("email")} />
        </FormField>
        <Button type="submit" variant="brand" size="lg" className="w-full" disabled={pending}>
          Envoyer le lien
        </Button>
      </form>
      <p className="text-center text-sm">
        <Link href="/connexion" className="font-semibold text-date hover:underline">
          Retour à la connexion
        </Link>
      </p>
    </div>
  );
}
