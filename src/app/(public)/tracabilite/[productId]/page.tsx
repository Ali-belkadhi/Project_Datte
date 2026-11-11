import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { Blocks, CalendarDays, MapPin, ShieldCheck, Sprout, type LucideIcon } from "lucide-react";
import { Container } from "@/components/layout/section";
import { Breadcrumbs, PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { pageMetadata } from "@/lib/seo";
import { getPublicTraceability } from "@/modules/blockchain/application/traceability.service";
import { getCertificateStatus } from "@/modules/blockchain/infrastructure/ethers/product-certification.gateway";
import { TraceabilityTimeline } from "@/modules/blockchain/presentation/traceability-timeline";
import { AutoSetupButton } from "@/modules/blockchain/presentation/auto-setup-button";
import { env } from "@/server/core/env";
import { getProduitPublicParId } from "@/server/modules/catalogue/services/produits";

export const metadata = pageMetadata("Verification de la tracabilite");
export const dynamic = "force-dynamic";

const shortAddress = (address: string) => `${address.slice(0, 8)}...${address.slice(-6)}`;

export default async function PublicTraceabilityPage({ params }: { params: Promise<{ productId: string }> }) {
  const { productId } = await params;
  const [product, traceability, certification] = await Promise.all([
    getProduitPublicParId(productId),
    getPublicTraceability(productId),
    getCertificateStatus(productId),
  ]);
  if (!product) notFound();

  const canonicalUrl = `${env.APP_URL.replace(/\/$/, "")}/tracabilite/${product.id}`;
  const qrDataUrl = await QRCode.toDataURL(canonicalUrl, { width: 240, margin: 1, errorCorrectionLevel: "M" });

  return (
    <Container className="space-y-8 pt-6 pb-20 md:pt-8">
      <Breadcrumbs items={[{ label: "Accueil", href: "/" }, { label: "Catalogue", href: "/catalogue" }, { label: product.nom, href: `/produit/${product.slug}` }, { label: "Tracabilite" }]} />
      <PageHeader
        surtitre="Verification publique"
        titre={product.nom}
        description="Les donnees ci-dessous sont lues depuis le registre de tracabilite. Aucun wallet n'est necessaire pour cette consultation."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Blocks className="size-5 text-brand" aria-hidden /> Tracabilite - Ali</CardTitle>
              <CardDescription>Origine du lot et historique chronologique inscrit sur DateTraceability.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {!traceability.link && (
                <>
                  <p className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">Aucun lot Blockchain n&apos;est associe a ce produit.</p>
                  <AutoSetupButton productId={productId} />
                </>
              )}
              {traceability.error && <p className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">{traceability.error}</p>}
              {traceability.lot && (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-success/10 p-4 text-sm">
                    <span className="flex items-center gap-2 font-semibold text-success"><ShieldCheck className="size-4" aria-hidden /> Donnees verifiees sur la Blockchain</span>
                    <span className="font-mono">{traceability.lot.lotId}</span>
                  </div>
                  <dl className="grid gap-3 sm:grid-cols-2">
                    <Fact icon={Sprout} label="Variete" value={traceability.lot.variety} />
                    <Fact icon={MapPin} label="Region d'origine" value={traceability.lot.region} />
                    <Fact icon={CalendarDays} label="Recolte" value={new Date(traceability.lot.harvestDate * 1000).toLocaleDateString("fr-FR")} />
                    <Fact icon={ShieldCheck} label="Producteur Blockchain" value={shortAddress(traceability.lot.producer)} title={traceability.lot.producer} />
                  </dl>
                  <TraceabilityTimeline history={traceability.history} />
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Certification - Baha</CardTitle>
              <CardDescription>Section independante de la tracabilite.</CardDescription>
            </CardHeader>
            <CardContent>
              {certification && certification.status !== "none" ? (
                <div className="space-y-2 text-sm">
                  <p className="font-semibold text-success">Statut : {certification.status}</p>
                  <p>Organisme : {certification.certifierOrg}</p>
                  <p>Type : {certification.certType}</p>
                  {certification.expiresAt ? <p>Expire le : {new Date(certification.expiresAt * 1000).toLocaleDateString("fr-FR")}</p> : null}
                </div>
              ) : (
                <>
                  <p className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">Aucun certificat disponible.</p>
                  <Button asChild variant="outline" size="sm" className="mt-3">
                    <Link href={`/certifier?productId=${productId}`}>Emettre un certificat</Link>
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="h-fit lg:sticky lg:top-24">
          <CardHeader><CardTitle>QR Code du produit</CardTitle><CardDescription>Scannez pour rouvrir cette verification publique.</CardDescription></CardHeader>
          <CardContent className="space-y-4 text-center">
            <Image src={qrDataUrl} alt={`QR Code de tracabilite pour ${product.nom}`} width={240} height={240} unoptimized className="mx-auto rounded-xl border bg-white p-2" />
            <p className="break-all text-xs text-muted-foreground">{canonicalUrl}</p>
            <Button asChild variant="outline" className="w-full"><Link href={`/produit/${product.slug}`}>Retour au produit</Link></Button>
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}

function Fact({ icon: Icon, label, value, title }: { icon: LucideIcon; label: string; value: string; title?: string }) {
  return (
    <div className="rounded-xl border p-4">
      <dt className="flex items-center gap-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase"><Icon className="size-4" aria-hidden /> {label}</dt>
      <dd className="mt-1 font-semibold" title={title}>{value}</dd>
    </div>
  );
}
