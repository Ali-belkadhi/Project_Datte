import { PageHeader } from "@/components/layout/page-header";
import { FormulaireMotDePasseOublie } from "@/components/auth/formulaire-mot-de-passe-oublie";

export const metadata = {
  title: "Mot de passe oublié",
  description: "Recevez un lien pour réinitialiser votre mot de passe DEGLA.",
};

export default function MotDePasseOubliePage() {
  return (
    <div className="min-h-screen pb-24">
      <PageHeader
        eyebrow="ACCÈS AU COMPTE"
        title="Mot de passe oublié"
        description="Indiquez votre adresse email : nous vous enverrons un lien de réinitialisation valable 1 heure."
        crumbs={[{ label: "Mot de passe oublié" }]}
      />

      <div className="container-lux mt-10 max-w-lg">
        <div className="rounded-3xl bg-cream-50/80 border border-forest/10 p-8 shadow-sm">
          <FormulaireMotDePasseOublie />
        </div>
      </div>
    </div>
  );
}
