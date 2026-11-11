import { Container } from "@/components/layout/section";
import { PageHeader } from "@/components/layout/page-header";
import { CartList } from "@/features/commandes/panier";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("Panier", "Votre panier DEGLA, groupé par vendeur.");

/** Panier (module C) — panier de démonstration pré-rempli (3 lignes chez 2 vendeurs). */
export default function PanierPage() {
  return (
    <Container className="space-y-8 py-8 md:py-12">
      <PageHeader fil={[{ label: "Accueil", href: "/" }, { label: "Panier" }]} titre="Votre panier" description="Les articles sont regroupés par vendeur : chacun prépare et expédie son colis." />
      <CartList />
    </Container>
  );
}
