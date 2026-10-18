import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/input";
import { ArrowRight } from "lucide-react";

export const metadata = {
  title: "Inscription",
  description: "Créez votre compte client SIWAR.",
};

export default function InscriptionPage() {
  return (
    <div className="min-h-screen pb-24">
      <PageHeader
        eyebrow="BIENVENUE"
        title="Créer un compte"
        description="Rejoignez la maison SIWAR et profitez d'avantages exclusifs."
        crumbs={[{ label: "Inscription" }]}
      />

      <div className="container-lux mt-10 max-w-lg">
        <div className="rounded-3xl bg-cream-50/80 border border-forest/10 p-8 shadow-sm">
          <form className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Prénom" id="first-name" required placeholder="Mohamed" />
              <Field label="Nom" id="last-name" required placeholder="Trabelsi" />
            </div>
            <Field label="Adresse e-mail" id="email" type="email" required placeholder="votre@email.com" />
            <Field label="Téléphone" id="phone" type="tel" required placeholder="+216 00 000 000" />
            <Field label="Mot de passe" id="password" type="password" required placeholder="Au moins 8 caractères" />

            <div className="flex items-start gap-2 text-xs text-muted">
              <input type="checkbox" required className="mt-0.5 rounded border-forest/20 text-forest focus:ring-gold" />
              <span>
                J&apos;accepte les{" "}
                <Link href="/a-propos#cgv" className="text-forest underline">
                  Conditions Générales de Vente
                </Link>{" "}
                et la politique de confidentialité.
              </span>
            </div>

            <Button size="lg" className="w-full rounded-full bg-forest text-cream hover:bg-forest-700 py-6 text-base font-semibold">
              Créer mon compte <ArrowRight className="size-4 ml-1" />
            </Button>
          </form>

          <div className="mt-8 border-t border-forest/10 pt-6 text-center text-sm text-muted">
            Déjà inscrit ?{" "}
            <Link href="/connexion" className="font-semibold text-forest hover:text-gold-dark underline">
              Se connecter
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
