import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { FormulaireReinitialisation } from "@/components/auth/formulaire-reinitialisation";
import { Alerte } from "@/components/ui/feedback";

export const metadata = {
  title: "Réinitialiser le mot de passe",
  description: "Choisissez un nouveau mot de passe pour votre compte DEGLA.",
};

export default async function ReinitialiserPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <div className="min-h-screen pb-24">
      <PageHeader
        eyebrow="SÉCURITÉ"
        title="Nouveau mot de passe"
        description="Choisissez un mot de passe d'au moins 8 caractères."
        crumbs={[{ label: "Réinitialisation" }]}
      />

      <div className="container-lux mt-10 max-w-lg">
        <div className="rounded-3xl bg-cream-50/80 border border-forest/10 p-8 shadow-sm">
          {token ? (
            <FormulaireReinitialisation token={token} />
          ) : (
            <div className="space-y-5">
              <Alerte type="erreur">
                Lien invalide : aucun jeton de réinitialisation n&apos;a été fourni.
              </Alerte>
              <Link
                href="/mot-de-passe-oublie"
                className="font-semibold text-forest underline hover:text-gold-dark"
              >
                Demander un nouveau lien
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
