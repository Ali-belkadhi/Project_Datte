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
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { FormField } from "./form-field";
import { GoogleButton, Separateur } from "./google-button";

/** Connexion : e-mail + mot de passe, Google (visuel), lien vers l'inscription. */
export function LoginForm() {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [pending, setPending] = useState(false);
  const form = useForm<ConnexionInput>({ resolver: zodResolver(connexionSchema), defaultValues: { email: "", motDePasse: "" } });
  const e = form.formState.errors;
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="font-display text-3xl font-semibold">Bon retour parmi nous</h1>
        <p className="text-muted-foreground">Connectez-vous pour retrouver votre panier et suivre vos commandes.</p>
      </div>
      <GoogleButton />
      <Separateur />
      <form
        onSubmit={form.handleSubmit(async (v) => {
          setPending(true);
          console.log("[LoginForm] submit — calling signIn with redirect:false");
          try {
            const r = await signIn("credentials", { email: v.email, motDePasse: v.motDePasse, redirect: false });
            console.log("[LoginForm] signIn result:", JSON.stringify(r));
            if (r?.error) {
              console.warn("[LoginForm] signIn error:", r.error);
              toast.error("E-mail ou mot de passe incorrect.");
            } else {
              console.log("[LoginForm] signIn OK — calling router.refresh() then router.push('/compte')");
              toast.success("Connexion réussie.");
              // router.refresh() is required: it flushes the Next.js router/RSC cache so
              // the middleware and server components see the new session cookie.
              // Without it, router.push("/compte") navigates with stale unauthenticated
              // state and the middleware immediately redirects back to /connexion.
              router.refresh();
              router.push("/compte");
              console.log("[LoginForm] router.push('/compte') called");
            }
          } catch (err) {
            console.error("[LoginForm] signIn threw:", err);
            toast.error("E-mail ou mot de passe incorrect.");
          } finally {
            setPending(false);
          }
        })}
        className="space-y-4"
        noValidate
      >
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
