import { PageHeader } from "@/components/layout/page-header";
import { ModerationQueue } from "@/features/comptes/admin";
import { pageMetadata } from "@/lib/seo";
import { listSignalements } from "@/server/modules/comptes/services/admin";

export const metadata = pageMetadata("Modération");

/** Modération (module A). */
export default async function ModerationPage() {
  const { items: signalements } = await listSignalements();
  return (
    <div className="space-y-6">
      <PageHeader surtitre="Administration" titre="Modération" description="Signalements de produits, d'avis, de boutiques et de messages." />
      <ModerationQueue signalements={signalements} />
    </div>
  );
}
