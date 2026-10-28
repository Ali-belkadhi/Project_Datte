import { PageHeader } from "@/components/layout/page-header";
import { VarietyAdmin } from "@/features/catalogue/varietes";
import { pageMetadata } from "@/lib/seo";
import { listVarietes } from "@/server/modules/catalogue/services/varietes";

export const metadata = pageMetadata("Variétés");

/** Admin variétés (module B). */
export default async function AdminVarietesPage() {
  const varietes = await listVarietes();
  return (
    <div className="space-y-6">
      <PageHeader surtitre="Administration" titre="Variétés" description="Le référentiel utilisé par les fiches produit et les filtres." />
      <VarietyAdmin varietes={varietes} />
    </div>
  );
}
