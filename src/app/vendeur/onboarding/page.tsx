import { PageHeader } from "@/components/layout/page-header";
import { OnboardingStepper, VerificationStatus } from "@/features/comptes/onboarding";
import { pageMetadata } from "@/lib/seo";
import { getMaBoutique } from "@/server/modules/comptes/services/fournisseurs";

export const metadata = pageMetadata("Ouverture de boutique");

/** Onboarding vendeur (module A) — état réel du dossier, prérempli depuis la boutique. */
export default async function OnboardingPage() {
  const boutique = await getMaBoutique();
  const enExamen = boutique.onboardingComplete && boutique.statutVerification === "EN_ATTENTE";
  const verifiee = boutique.statutVerification === "VERIFIE";
  return (
    <div className="space-y-6">
      <PageHeader surtitre="Bienvenue sur DEGLA" titre={verifiee ? "Votre boutique" : "Ouvrez votre boutique"} description="Quatre étapes, une dizaine de minutes. Gardez votre CIN, votre RNE et votre patente à portée de main." />
      {enExamen || verifiee ? (
        <VerificationStatus
          statut={verifiee ? "VERIFIE" : "EN_ATTENTE"}
          soumisLe={boutique.soumisLe}
          verifieLe={boutique.verifieLe}
        />
      ) : (
        <OnboardingStepper
          boutique={{
            nomBoutique: boutique.nomBoutique,
            type: boutique.type,
            region: boutique.region,
            ville: boutique.ville,
            description: boutique.description,
          }}
          motifRefus={boutique.motifRefus}
        />
      )}
    </div>
  );
}
