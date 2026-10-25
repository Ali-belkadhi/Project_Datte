import { PageHeader } from "@/components/layout/page-header";
import { PromoCodes } from "@/features/commandes/admin";
import { pageMetadata } from "@/lib/seo";
import { listCodesPromo } from "@/server/modules/commandes/services/codes-promo";

export const metadata = pageMetadata("Codes promo");

/** Codes promo (module C). */
export default async function AdminCodesPromoPage() {
  const codes = (await listCodesPromo()).map((c) => ({ ...c, debut: c.debut.toISOString(), fin: c.fin.toISOString() }));
  return (
    <div className="space-y-6">
      <PageHeader surtitre="Administration" titre="Codes promo" description="Remises en pourcentage ou en montant fixe, pour toute la plateforme ou un vendeur." />
      <PromoCodes codes={codes} />
    </div>
  );
}
