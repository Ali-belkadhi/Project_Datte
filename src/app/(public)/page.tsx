import { Section } from "@/components/layout/section";
import { SectionReveal } from "@/components/shared/section-reveal";
import { VarietyShowcase } from "@/components/three";
import { AssistantBanner, DerivedCategories, HomeHero, HowItWorks, SeeBeforeBuy, SellerBanner, TrustBand } from "@/features/catalogue/accueil";
import { ShopCard } from "@/features/catalogue/boutiques";
import { ProductCarousel } from "@/features/catalogue/produits";
import { listBoutiquesVerifiees } from "@/server/modules/comptes/services/fournisseurs";
import { getProduit, produitsDeSaison } from "@/server/modules/catalogue/services/produits";
import { listVarietes } from "@/server/modules/catalogue/services/varietes";

/** Accueil (module B). */
export default async function AccueilPage() {
  const [varietes, saison, medjool, boutiques] = await Promise.all([
    listVarietes(),
    produitsDeSaison(),
    getProduit("medjool-jumbo"),
    listBoutiquesVerifiees(4),
  ]);
  return (
    <>
      <HomeHero />
      <TrustBand />
      <Section surtitre="Huit terroirs, huit caractères" titre="Les variétés" description="De la Deglet Nour translucide à la Kentichi sèche : survolez une datte pour la découvrir." lien={{ href: "/varietes", label: "Toutes les variétés" }}>
        <VarietyShowcase varietes={varietes} />
      </Section>
      <Section tone="sand" surtitre="Récolte 2026" titre="De saison" description="Les dattes Rtob et Tamr fraîchement cueillies, prêtes à partir." lien={{ href: "/catalogue?type=DATTE&tri=nouveautes", label: "Tout le catalogue" }}>
        <ProductCarousel items={saison} label="Dattes de saison" />
      </Section>
      <Section surtitre="Jus, rob, confitures…" titre="Au-delà de la datte" lien={{ href: "/catalogue?type=DERIVE", label: "Tous les produits dérivés" }}>
        <DerivedCategories />
      </Section>
      <Section tone="sand">
        <SectionReveal>
          <SeeBeforeBuy produit={medjool} />
        </SectionReveal>
      </Section>
      <Section surtitre="Producteurs et coopératives" titre="Boutiques vérifiées" description="Chaque vendeur est vérifié par notre équipe : identité, registre et patente." lien={{ href: "/recherche", label: "Toutes les boutiques" }}>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {boutiques.map((b) => (
            <li key={b.id}>
              <ShopCard boutique={b} className="h-full" />
            </li>
          ))}
        </ul>
      </Section>
      <Section tone="sand" surtitre="Simple comme une poignée de dattes" titre="Comment ça marche">
        <HowItWorks />
      </Section>
      <Section>
        <SectionReveal>
          <AssistantBanner />
        </SectionReveal>
      </Section>
      <Section className="pt-0 md:pt-0">
        <SellerBanner />
      </Section>
    </>
  );
}
