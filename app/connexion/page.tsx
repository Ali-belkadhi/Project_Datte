import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { FormulaireConnexion } from "@/components/auth/formulaire-connexion";

export const metadata = {
  title: "Connexion",
  description: "Accédez à votre espace DEGLA : dattes de Kébili, coffrets et produits dérivés.",
};

export default async function ConnexionPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;

  return (
    <div className="min-h-screen pb-24">
      <PageHeader
        eyebrow="ESPACE MEMBRE"
        title="Connexion"
        description="Retrouvez vos commandes, vos adresses et vos coffrets favoris."
        crumbs={[{ label: "Connexion" }]}
      />

      <div className="container-lux mt-10 max-w-lg">
        <div className="rounded-3xl bg-cream-50/80 border border-forest/10 p-8 shadow-sm">
          <FormulaireConnexion callbackUrl={callbackUrl} />

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
