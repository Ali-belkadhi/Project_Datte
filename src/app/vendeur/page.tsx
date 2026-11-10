import Link from "next/link";
import { ArrowRight, Box, Coins, PackageOpen, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ProduitVisuel } from "@/components/illustrations/product-illustration";
import { IncomingOrdersTable, KpiGrid, PeriodToggle, SalesChart, TopProducts, VarietyDonut } from "@/features/commandes/vendeur";
import { formatPoids } from "@/lib/format";
import { pageMetadata } from "@/lib/seo";
import { monSoldeCredits } from "@/server/modules/catalogue/services/credits";
import { mesProduitsStockBas } from "@/server/modules/catalogue/services/produits";
import { commandesATraiter } from "@/server/modules/commandes/services/commandes";
import { kpisVendeur, repartitionVarietesVendeur, topProduitsVendeur } from "@/server/modules/commandes/services/ventes";
import { getUtilisateurCourant } from "@/server/modules/comptes/services/utilisateurs";

export const metadata = pageMetadata("Tableau de bord vendeur");

type Periode = "7j" | "30j" | "12m";

/** Tableau de bord vendeur (module C). */
export default async function VendeurDashboard({ searchParams }: { searchParams: Promise<{ periode?: string }> }) {
  const { periode: p } = await searchParams;
  const periode: Periode = p === "7j" || p === "12m" ? p : "30j";
  const [u, kpi, aTraiter, stockBas, solde, top, repartition] = await Promise.all([
    getUtilisateurCourant(),
    kpisVendeur(periode),
    commandesATraiter(4),
    mesProduitsStockBas(3),
    monSoldeCredits(),
    topProduitsVendeur(),
    repartitionVarietesVendeur(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-brand-fill/30 bg-brand-soft p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-start gap-3 text-sm">
          <Sparkles className="mt-0.5 size-5 shrink-0 text-accent-foreground" aria-hidden />
          <span>
            <strong className="font-semibold">Votre boutique est complète à 80 %.</strong> Ajoutez une bannière et vos horaires d&apos;expédition pour gagner la confiance des
            acheteurs.
          </span>
        </p>
        <Button asChild size="sm" variant="outline" className="shrink-0 bg-card">
          <Link href="/vendeur/boutique">Compléter ma boutique</Link>
        </Button>
      </div>

      <PageHeader surtitre="Palmeraie Ben Amor" titre={`Bonjour ${u.prenom}`} description="Voici l'activité de votre boutique." actions={<PeriodToggle value={periode} />} />
      <KpiGrid kpi={kpi} />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Chiffre d&apos;affaires</CardTitle>
            <p className="text-[13px] text-muted-foreground">{periode === "12m" ? "12 derniers mois" : periode === "7j" ? "7 derniers jours" : "30 derniers jours"}</p>
          </CardHeader>
          <CardContent>
            <SalesChart serie={kpi.serie} mensuel={periode === "12m"} />
          </CardContent>
        </Card>
        <Card className="bg-night text-cream">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="size-4 text-brand-light" aria-hidden /> Crédits 3D
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="font-display text-5xl font-semibold tabular-nums">{solde.solde}</p>
            <Progress value={(solde.solde / 20) * 100} className="h-2 bg-cream/15 [&>*]:bg-brand-light" aria-label="Solde de crédits" />
            <p className="text-[13px] text-cream/70">
              Une génération coûte {solde.coutImage} crédit (1 photo) ou {solde.coutMultiImage} crédits (plusieurs photos).
            </p>
            <div className="flex gap-2">
              <Button asChild variant="brand" size="sm">
                <Link href="/vendeur/credits">Recharger</Link>
              </Button>
              <Button asChild variant="outline-light" size="sm">
                <Link href="/vendeur/studio-3d">
                  <Box aria-hidden /> Studio 3D
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-semibold">Commandes à traiter</h2>
          <Link href="/vendeur/commandes" className="inline-flex items-center gap-1 text-sm font-semibold text-date">
            Toutes les commandes <ArrowRight className="size-4 rtl:rotate-180" aria-hidden />
          </Link>
        </div>
        <IncomingOrdersTable sousCommandes={aTraiter} avecOnglets={false} />
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PackageOpen className="size-4 text-danger" aria-hidden /> Stock bas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {stockBas.map((p) => (
                <li key={p.id} className="flex flex-wrap items-center gap-3">
                  <span className="size-12 shrink-0 overflow-hidden rounded-xl bg-sand">
                    <ProduitVisuel produit={p} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{p.nom}</span>
                    <span className="block text-[13px] text-danger">
                      {p.typeProduit === "DATTE" ? (p.stockGrammes ? `Plus que ${formatPoids(p.stockGrammes)}` : "Épuisé") : `Plus que ${p.stockUnites} unités`}
                    </span>
                  </span>
                  <Button asChild size="sm" variant="outline" className="ms-auto">
                    <Link href={`/vendeur/produits/${p.id}`}>Réapprovisionner</Link>
                  </Button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Meilleures ventes</CardTitle>
          </CardHeader>
          <CardContent>
            <TopProducts produits={top} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Répartition par variété</CardTitle>
          </CardHeader>
          <CardContent>
            <VarietyDonut data={repartition} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
