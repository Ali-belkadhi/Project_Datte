import { PageHeader } from "@/components/layout/page-header";
import { DisputeBoard } from "@/features/commandes/litiges";
import { pageMetadata } from "@/lib/seo";
import { listLitiges } from "@/server/modules/commandes/services/litiges";

export const metadata = pageMetadata("Litiges");

/** Litiges (module C). */
export default async function LitigesPage() {
  const litiges = await listLitiges();
  return (
    <div className="space-y-6">
      <PageHeader surtitre="Administration" titre="Litiges" description="Arbitrez entre acheteurs et vendeurs et décidez des remboursements." />
      <DisputeBoard litiges={litiges} />
    </div>
  );
}
