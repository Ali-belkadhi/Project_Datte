import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { FormulaireInscription } from "@/components/auth/formulaire-inscription";

export const metadata = {
  title: "Inscription",
  description: "Créez votre compte DEGLA : achetez ou vendez des dattes de Kébili.",
};

export default function InscriptionPage() {
  return (
    <div className="min-h-screen pb-24">
      <PageHeader
        eyebrow="BIENVENUE"
        title="Créer un compte"
        description="Rejoignez la maison DEGLA et profitez d'avantages exclusifs."
        crumbs={[{ label: "Inscription" }]}
      />

      <div className="container-lux mt-10 max-w-lg">
        <div className="rounded-3xl bg-cream-50/80 border border-forest/10 p-8 shadow-sm">
          <FormulaireInscription />

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
