import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/input";
import { ArrowRight } from "lucide-react";

export const metadata = {
  title: "Connexion",
  description: "Accédez à votre espace client SIWAR.",
};

export default function ConnexionPage() {
  return (
    <div className="min-h-screen pb-24">
      <PageHeader
        eyebrow="ESPACE CLIENT"
        title="Connexion"
        description="Retrouvez vos commandes, vos adresses et vos coffrets favoris."
        crumbs={[{ label: "Connexion" }]}
      />

      <div className="container-lux mt-10 max-w-lg">
        <div className="rounded-3xl bg-cream-50/80 border border-forest/10 p-8 shadow-sm">
          <form className="space-y-5">
            <Field label="Adresse e-mail" id="email" type="email" required placeholder="votre@email.com" />
            <Field label="Mot de passe" id="password" type="password" required placeholder="••••••••" />

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-muted">
                <input type="checkbox" className="rounded border-forest/20 text-forest focus:ring-gold" />
                Se souvenir de moi
              </label>
              <Link href="#" className="font-medium text-gold-dark hover:underline">
                Mot de passe oublié ?
              </Link>
            </div>

            <Button size="lg" className="w-full rounded-full bg-forest text-cream hover:bg-forest-700 py-6 text-base font-semibold">
              Se connecter <ArrowRight className="size-4 ml-1" />
            </Button>
          </form>

          <div className="mt-8 border-t border-forest/10 pt-6 text-center text-sm text-muted">
            Vous n&apos;avez pas encore de compte ?{" "}
            <Link href="/inscription" className="font-semibold text-forest hover:text-gold-dark underline">
              Créer un compte
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
