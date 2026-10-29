import { BuyerShell } from "@/components/layout/buyer-shell";
import { AssistantPopup } from "@/features/commandes/assistant";
import { getPanierDemo } from "@/server/modules/commandes/services/panier";
import { indexRecherche, RECHERCHES_POPULAIRES } from "@/server/modules/catalogue/services/recherche";
import { mesFavorisIds } from "@/server/modules/catalogue/services/favoris";

/** Vue acheteur + pages publiques — layout BuyerShell. */
export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const [index, panier, favoris] = await Promise.all([indexRecherche(), getPanierDemo(), mesFavorisIds()]);
  return (
    <BuyerShell index={{ ...index, populaires: RECHERCHES_POPULAIRES }} panier={panier} favoris={favoris}>
      {children}
      <AssistantPopup />
    </BuyerShell>
  );
}
