import { CheckCircle2 } from "lucide-react";
import { LoginForm } from "@/features/comptes/auth";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("Connexion");

/** Connexion (module A) — authentification réelle (Auth.js, credentials + Google). */
export default async function ConnexionPage({ searchParams }: { searchParams: Promise<{ mdp?: string }> }) {
  const { mdp } = await searchParams;
  return (
    <div className="space-y-4">
      {mdp === "modifie" && (
        <p className="flex items-start gap-2 rounded-xl border border-success/40 bg-success-soft px-4 py-3 text-sm text-success" role="status">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden />
          Mot de passe modifié. Reconnectez-vous avec votre nouveau mot de passe.
        </p>
      )}
      <LoginForm />
    </div>
  );
}
