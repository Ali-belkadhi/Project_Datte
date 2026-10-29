import { PageHeader } from "@/components/layout/page-header";
import { RatingBreakdown } from "@/features/commandes/avis";
import { ReviewsBoard } from "@/features/commandes/vendeur";
import { pageMetadata } from "@/lib/seo";
import { mesAvisRecus } from "@/server/modules/commandes/services/avis";

export const metadata = pageMetadata("Avis clients");

/** Avis reçus (module C) : note moyenne, répartition, liste filtrable, réponses. */
export default async function VendeurAvisPage() {
  const { avis, repartition } = await mesAvisRecus();
  return (
    <div className="space-y-6">
      <PageHeader surtitre="Ventes" titre="Avis clients" description="Répondez aux avis : une réponse attentive rassure les futurs acheteurs." />
      <div className="grid gap-6 lg:grid-cols-[320px_1fr] lg:items-start">
        <div className="lg:sticky lg:top-24">
          <RatingBreakdown repartition={repartition} />
        </div>
        <ReviewsBoard avis={avis} />
      </div>
    </div>
  );
}
