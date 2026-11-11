import { PageHeader } from "@/components/layout/page-header";
import { SupplierReviewTable } from "@/features/comptes/admin";
import { pageMetadata } from "@/lib/seo";
import { listFournisseurs } from "@/server/modules/comptes/services/fournisseurs";

export const metadata = pageMetadata("Fournisseurs");

/** Fournisseurs (module A). */
export default async function AdminFournisseursPage() {
  const { items: fournisseurs } = await listFournisseurs();
  return (
    <div className="space-y-6">
      <PageHeader surtitre="Administration" titre="Fournisseurs" description="Vérification des boutiques : identité, registre, patente." />
      <SupplierReviewTable fournisseurs={fournisseurs} />
    </div>
  );
}
