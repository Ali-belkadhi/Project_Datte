import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container, Section } from "@/components/layout/section";
import { Breadcrumbs } from "@/components/layout/page-header";
import Link from "next/link";
import { RatingBreakdown, ReviewForm, ReviewList } from "@/features/commandes/avis";
import { Button } from "@/components/ui/button";
import { ProductCarousel, ProductGallery, ProductInfo, ProductPurchase, ProductTabs, SellerCard } from "@/features/catalogue/produits";
import { VarietyFactSheet } from "@/features/catalogue/varietes";
import { pageMetadata } from "@/lib/seo";
import { getPublicTraceability } from "@/modules/blockchain/application/traceability.service";
import { getPublicCertification } from "@/modules/blockchain/application/certification.service";
import { CertificationSummary } from "@/modules/blockchain/presentation/certification-summary";
import { TraceabilitySummary } from "@/modules/blockchain/presentation/traceability-summary";
import { getProduit, getProduitAvecVendeur, produitsSimilaires } from "@/server/modules/catalogue/services/produits";
import { getVariete } from "@/server/modules/catalogue/services/varietes";
import { getFournisseur } from "@/server/modules/comptes/services/fournisseurs";
import { avisProduit, etatAvisProduit } from "@/server/modules/commandes/services/avis";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProduit(slug);
  return p ? pageMetadata(p.nom, p.description) : pageMetadata("Produit introuvable");
}

/** Fiche produit (module B). */
export default async function ProduitPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = await getProduitAvecVendeur(slug);
  if (!item) notFound();
  const p = item.produit;
  const [vendeur, variete, { avis, repartition }, similaires, traceability, etatAvis] = await Promise.all([
    getFournisseur(p.fournisseurId),
    p.variete ? getVariete(p.variete) : Promise.resolve(null),
    avisProduit(p.id),
    produitsSimilaires(p),
    getPublicTraceability(p.id),
    etatAvisProduit(p.id),
  ]);
  const certification = await getPublicCertification(p.id, traceability.link?.lotId);

  return (
    <>
      <Container className="space-y-8 pt-6 pb-32 md:pt-8 lg:pb-12">
        <Breadcrumbs
          items={[
            { label: "Accueil", href: "/" },
            { label: "Catalogue", href: "/catalogue" },
            ...(variete ? [{ label: variete.nom, href: `/variete/${variete.slug}` }] : []),
            { label: p.nom },
          ]}
        />
        <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-12">
          <ProductGallery produit={p} />
          <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <ProductPurchase item={item} />
            {vendeur && <SellerCard vendeur={vendeur} />}
          </div>
        </div>
        <ProductTabs
          nombreAvis={avis.length}
          description={
            <div className="space-y-4">
              <p>{p.description}</p>
              <p className="text-muted-foreground">
                Produit par {item.vendeur.nomBoutique}. Chaque lot est trié à la main et conditionné au plus près de la récolte pour préserver sa
                fraîcheur.
              </p>
            </div>
          }
          caracteristiques={<ProductInfo produit={p} />}
          variete={variete ? <VarietyFactSheet variete={variete} resumee /> : undefined}
          avis={
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-card p-4">
                {etatAvis.aNoter ? (
                  <>
                    <p className="text-sm">Vous avez reçu ce produit : partagez votre avis avec les autres clients.</p>
                    <ReviewForm ligneCommandeId={etatAvis.aNoter.ligneCommandeId} produitNom={etatAvis.aNoter.produitNom} trigger={<Button variant="brand">Laisser un avis</Button>} />
                  </>
                ) : etatAvis.client ? (
                  <p className="text-sm text-muted-foreground">Les avis sont réservés aux achats livrés : vous pourrez noter ce produit dès la livraison de votre commande.</p>
                ) : !etatAvis.connecte ? (
                  <>
                    <p className="text-sm text-muted-foreground">Vous avez acheté ce produit ? Connectez-vous pour donner votre avis.</p>
                    <Button asChild variant="outline">
                      <Link href={`/connexion?callbackUrl=${encodeURIComponent(`/produit/${p.slug}`)}`}>Se connecter</Link>
                    </Button>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">Les avis sont donnés par les clients après la livraison de leur commande.</p>
                )}
              </div>
              {avis.length ? (
                <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
                  <RatingBreakdown repartition={repartition} />
                  <ReviewList avis={avis} vendeur={item.vendeur.nomBoutique} />
                </div>
              ) : (
                <p className="text-muted-foreground">Aucun avis pour le moment.</p>
              )}
            </div>
          }
        />
        <TraceabilitySummary productId={p.id} traceability={traceability} />
        <CertificationSummary productId={p.id} certification={certification} />
      </Container>
      <Section tone="sand" titre="Vous aimerez aussi" className="pb-36 lg:pb-20">
        <ProductCarousel items={similaires} label="Produits similaires" />
      </Section>
    </>
  );
}
