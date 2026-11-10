import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/section";
import { Breadcrumbs } from "@/components/layout/page-header";
import { ShopHero } from "@/components/shared/shop-hero";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VarietyGlyph } from "@/components/illustrations/variety-glyph";
import { VARIETY_PRESETS } from "@/components/three/presets";
import { ProductGrid } from "@/features/catalogue/produits";
import { RatingBreakdown, ReviewList } from "@/features/commandes/avis";
import { pageMetadata } from "@/lib/seo";
import { produitsParFournisseur } from "@/server/modules/catalogue/services/produits";
import { getFournisseurParSlug } from "@/server/modules/comptes/services/fournisseurs";
import { avisFournisseur } from "@/server/modules/commandes/services/avis";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const f = await getFournisseurParSlug(slug);
  return f ? pageMetadata(f.nomBoutique, f.description) : pageMetadata("Boutique introuvable");
}

/** Boutique publique (module B). */
export default async function BoutiquePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const b = await getFournisseurParSlug(slug);
  if (!b) notFound();
  const [produits, { avis, repartition }] = await Promise.all([produitsParFournisseur(b.id), avisFournisseur(b.id)]);

  return (
    <Container className="space-y-8 py-6 md:py-10">
      <Breadcrumbs items={[{ label: "Accueil", href: "/" }, { label: "Boutiques", href: "/recherche" }, { label: b.nomBoutique }]} />
      <ShopHero boutique={b} />
      <Tabs defaultValue="produits" className="gap-6">
        <TabsList>
          <TabsTrigger value="produits">Produits ({produits.length})</TabsTrigger>
          <TabsTrigger value="apropos">À propos</TabsTrigger>
          <TabsTrigger value="avis">Avis ({avis.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="produits">
          <ProductGrid items={produits} />
        </TabsContent>
        <TabsContent value="apropos" className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-4 text-[15px] leading-relaxed">
            <h2 className="font-display text-2xl font-semibold">Notre histoire</h2>
            <p>{b.histoire}</p>
            <p className="text-muted-foreground">{b.description}</p>
          </div>
          <div className="space-y-3 rounded-2xl border bg-card p-5">
            <h3 className="font-semibold">Variétés cultivées</h3>
            <ul className="flex flex-wrap gap-2">
              {b.varietes.map((v) => (
                <li key={v} className="inline-flex h-9 items-center gap-1.5 rounded-full bg-sand px-3 text-[13px] font-semibold">
                  <VarietyGlyph variete={v} className="size-4" /> {VARIETY_PRESETS[v].nom}
                </li>
              ))}
            </ul>
            <p className="text-[13px] text-muted-foreground">Gérant : {b.gerant} · {b.delaiExpedition}</p>
          </div>
        </TabsContent>
        <TabsContent value="avis" className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <RatingBreakdown repartition={repartition} />
          <ReviewList avis={avis} vendeur={b.nomBoutique} />
        </TabsContent>
      </Tabs>
    </Container>
  );
}
