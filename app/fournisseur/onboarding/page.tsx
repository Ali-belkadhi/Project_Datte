import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getUtilisateurCourant } from "@/server/middleware/rbac";
import { FournisseurService } from "@/server/services/FournisseurService";
import { OnboardingForm } from "@/components/fournisseur/onboarding-form";

export const metadata = { title: "Inscription fournisseur" };

export default async function OnboardingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion?callbackUrl=/fournisseur/onboarding");

  const utilisateur = await getUtilisateurCourant();
  const fournisseur = await FournisseurService.getFournisseurByUtilisateur(
    utilisateur._id.toString()
  );

  if (fournisseur) redirect("/fournisseur/tableau-de-bord");

  return (
    <div className="rounded-3xl border border-forest/10 bg-cream-50/80 p-6 sm:p-8">
      <h2 className="mb-2 font-serif text-2xl font-medium text-forest">
        Devenir fournisseur DEGLA
      </h2>
      <p className="mb-8 text-sm text-muted">
        Renseignez les informations de votre boutique et vos pièces justificatives. Notre équipe
        validera votre dossier sous peu.
      </p>
      <OnboardingForm />
    </div>
  );
}
