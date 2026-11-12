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
import { getUtilisateurCourant } from "@/server/contracts/comptes";
import { avisFournisseur } from "@/server/modules/commandes/services/avis";

// rendue à chaque visite : nouveaux produits et avis visibles aussitôt (pas de page en cache)
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const f = await getFournisseurParSlug(slug).catch(() => null);
  return f?.verifie ? pageMetadata(f.nomBoutique, f.description) : pageMetadata("Boutique");
}

/** Le propriétaire de la boutique ou un admin peut la voir avant sa validation (aperçu). */
async function peutVoirApercu(fournisseurId: string) {
  const u = await getUtilisateurCourant().catch(() => null);
  return Boolean(u && (u.role === "ADMIN" || u.fournisseurId === fournisseurId));
}

/** Boutique publique (module B) : présentation, produits publiés, avis des clients sur ses produits. */
export default async function BoutiquePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const b = await getFournisseurParSlug(slug).catch(() => null);
  if (!b) notFound();
  // boutique publique une fois validée par l'admin ; avant, visible seulement par son propriétaire (aperçu)
  const apercu = !b.verifie;
  if (apercu && !(await peutVoirApercu(b.id))) notFound();
  const [produits, { avis, repartition }] = await Promise.all([produitsParFournisseur(b.id), avisFournisseur(b.id)]);

  return (
    <Container className="space-y-8 py-6 md:py-10">
      <Breadcrumbs items={[{ label: "Accueil", href: "/" }, { label: "Boutiques", href: "/recherche" }, { label: b.nomBoutique }]} />
      {apercu && (
        <p role="status" className="rounded-xl bg-brand-soft px-4 py-3 text-sm font-semibold text-accent-foreground">
          Aperçu de votre boutique : elle sera visible par tous une fois votre dossier validé par l&apos;équipe DEGLA.
        </p>
      )}
      <ShopHero boutique={b} apercu={apercu} />
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
            <p>{b.histoire || b.description || "Cette boutique n'a pas encore présenté son histoire."}</p>
            {b.histoire && b.description && b.histoire !== b.description && <p className="text-muted-foreground">{b.description}</p>}
          </div>
          <div className="space-y-3 rounded-2xl border bg-card p-5">
            <h3 className="font-semibold">Variétés cultivées</h3>
            {!b.varietes.length && <p className="text-[13px] text-muted-foreground">Variétés visibles dans les produits de la boutique.</p>}
            <ul className="flex flex-wrap gap-2">
              {b.varietes.filter((v) => VARIETY_PRESETS[v]).map((v) => (
                <li key={v} className="inline-flex h-9 items-center gap-1.5 rounded-full bg-sand px-3 text-[13px] font-semibold">
                  <VarietyGlyph variete={v} className="size-4" /> {VARIETY_PRESETS[v].nom}
                </li>
              ))}
            </ul>
            <p className="text-[13px] text-muted-foreground">
              {b.gerant ? `Gérant : ${b.gerant} · ` : ""}Expédition sous {b.delaiExpedition}
            </p>
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
