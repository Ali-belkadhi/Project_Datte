import { ResetForm } from "@/features/comptes/auth";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("Mot de passe oublié");

/** Réinitialisation du mot de passe (module A). */
export default function MotDePassePage() {
  return <ResetForm />;
}
