import { PageHeader } from "@/components/layout/page-header";
import { ReviewsModeration } from "@/features/commandes/admin";
import { pageMetadata } from "@/lib/seo";
import { tousLesAvis } from "@/server/modules/commandes/services/avis";

export const metadata = pageMetadata("Avis");

/** Modération des avis (module C). */
export default async function AdminAvisPage() {
  const avis = await tousLesAvis();
  return (
    <div className="space-y-6">
      <PageHeader surtitre="Administration" titre="Avis" description="Masquez un avis inapproprié : il disparaît de la fiche produit et de la note moyenne." />
      <ReviewsModeration avis={avis} />
    </div>
  );
}
