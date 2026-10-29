import { PageHeader } from "@/components/layout/page-header";
import { CreditsPackAdmin } from "@/features/catalogue/credits";
import { pageMetadata } from "@/lib/seo";
import { creditsRepository } from "@/server/modules/catalogue/repositories";

export const metadata = pageMetadata("Packs de Crédits 3D");

/** Admin packs de crédits (module B). */
export default async function AdminPacksPage() {
  const packs = await creditsRepository.tousLesPacks();
  return (
    <div className="space-y-6">
      <PageHeader
        surtitre="Administration"
        titre="Packs de crédits 3D"
        description="Gérez les offres de crédits disponibles pour les vendeurs pour générer leurs modèles 3D."
      />
      <CreditsPackAdmin packs={packs} />
    </div>
  );
}
