import { PageHeader } from "@/components/layout/page-header";
import { PayoutsAdmin } from "@/features/commandes/admin";
import { pageMetadata } from "@/lib/seo";
import { tousLesVersements } from "@/server/modules/commandes/services/versements";

export const metadata = pageMetadata("Versements");

/** Versements aux vendeurs (module C). */
export default async function AdminVersementsPage() {
  const versements = await tousLesVersements();
  return (
    <div className="space-y-6">
      <PageHeader surtitre="Administration" titre="Versements" description="Reversement des ventes livrées aux vendeurs : brut − commission DEGLA (8 %)." />
      <PayoutsAdmin versements={versements} />
    </div>
  );
}
