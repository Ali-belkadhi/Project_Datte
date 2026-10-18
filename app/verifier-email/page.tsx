import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Alerte } from "@/components/ui/feedback";
import { Button } from "@/components/ui/button";
import { actionVerifierEmail } from "@/server/actions/auth.actions";

export const metadata = {
  title: "Vérification de l'email",
  description: "Activez votre compte DEGLA.",
};

export default async function VerifierEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  const resultat = token
    ? await actionVerifierEmail(token)
    : { success: false, error: "Aucun jeton de vérification fourni." };

  return (
    <div className="min-h-screen pb-24">
      <PageHeader
        eyebrow="ACTIVATION DU COMPTE"
        title="Vérification de l'email"
        description="Une dernière étape pour sécuriser votre compte."
        crumbs={[{ label: "Vérification" }]}
      />

      <div className="container-lux mt-10 max-w-lg">
        <div className="space-y-6 rounded-3xl bg-cream-50/80 border border-forest/10 p-8 shadow-sm">
          <Alerte type={resultat.success ? "succes" : "erreur"}>
            {resultat.success ? resultat.message : resultat.error}
          </Alerte>

          {resultat.success ? (
            <Button asChild className="w-full rounded-full py-6">
              <Link href="/connexion">Se connecter</Link>
            </Button>
          ) : (
            <div className="flex flex-col gap-3">
              <Button asChild variant="outline" className="w-full rounded-full">
                <Link href="/connexion">Aller à la connexion</Link>
              </Button>
              <p className="text-center text-xs text-muted">
                Connectez-vous puis demandez un nouvel email depuis votre espace personnel.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
