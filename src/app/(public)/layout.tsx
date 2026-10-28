import { BuyerShell } from "@/components/layout/buyer-shell";
import { auth } from "@/auth";
import { getPanierDemo } from "@/server/modules/commandes/services/panier";
import { indexRecherche, RECHERCHES_POPULAIRES } from "@/server/modules/catalogue/services/recherche";
import { mesFavorisIds } from "@/server/modules/catalogue/services/favoris";

/** Vue acheteur + pages publiques — layout BuyerShell. */
export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const [session, index, panier, favoris] = await Promise.all([auth(), indexRecherche(), getPanierDemo(), mesFavorisIds()]);
  const role = (session?.user as { role?: string } | undefined)?.role ?? null;
  return (
    <BuyerShell index={{ ...index, populaires: RECHERCHES_POPULAIRES }} panier={panier} favoris={favoris} role={role}>
      {children}
    </BuyerShell>
  );
}
