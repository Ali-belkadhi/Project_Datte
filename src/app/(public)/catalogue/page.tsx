import { Suspense } from "react";
import { Container } from "@/components/layout/section";
import { PageHeader } from "@/components/layout/page-header";
import { CatalogueView } from "@/features/catalogue/filtres";
import { AssistantFab } from "@/features/commandes/assistant";
import { getScenariosAssistant } from "@/server/modules/commandes/services/assistant";
import { pageMetadata } from "@/lib/seo";
import { listProduits } from "@/server/modules/catalogue/services/produits";
import CatalogueLoading from "./loading";

export const metadata = pageMetadata("Catalogue", "Toutes les dattes et produits dérivés de Tunisie : filtrez par variété, prix, région et maturité.");

/** Catalogue (module B) — le filtrage et le tri se font en mémoire côté client, via l'URL. */
export default async function CataloguePage() {
  const [items, assistant] = await Promise.all([listProduits({}), getScenariosAssistant()]);
  return (
    <Container className="space-y-8 py-8 md:py-12">
      <PageHeader
        fil={[{ label: "Accueil", href: "/" }, { label: "Catalogue" }]}
        surtitre="Récolte 2026"
        titre="Catalogue"
        description={`${items.length} produits de ${new Set(items.map((i) => i.vendeur.id)).size} boutiques vérifiées, des oasis du Djérid au littoral de Gabès.`}
      />
      <Suspense fallback={<CatalogueLoading />}>
        <CatalogueView items={items} />
      </Suspense>
      <AssistantFab data={assistant} />
    </Container>
  );
}
