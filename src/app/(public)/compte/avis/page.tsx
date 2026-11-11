import { PageHeader } from "@/components/layout/page-header";
import { MyReviews } from "@/features/commandes/avis";
import { pageMetadata } from "@/lib/seo";
import { mesAvis } from "@/server/modules/commandes/services/avis";

export const metadata = pageMetadata("Mes avis");

/** Mes avis (module C) : CRUD de ses propres avis. */
export default async function MesAvisPage() {
  const avis = await mesAvis();
  return (
    <>
      <PageHeader surtitre="Mon compte" titre="Mes avis" description="Modifiez ou supprimez les avis que vous avez laissés." />
      <MyReviews avis={avis} />
    </>
  );
}
