import { LoginForm } from "@/features/comptes/auth";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("Connexion");

/** Connexion (module A) — authentification factice. */
export default function ConnexionPage() {
  return <LoginForm />;
}
