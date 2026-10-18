import { PageHeader } from "@/components/layout/page-header";
import { OnboardingStepper } from "@/features/comptes/onboarding";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("Ouverture de boutique");

/** Onboarding vendeur (module A). */
export default function OnboardingPage() {
  return (
    <div className="space-y-6">
      <PageHeader surtitre="Bienvenue sur DEGLA" titre="Ouvrez votre boutique" description="Quatre étapes, une dizaine de minutes. Gardez votre CIN, votre RNE et votre patente à portée de main." />
      <OnboardingStepper />
    </div>
  );
}
