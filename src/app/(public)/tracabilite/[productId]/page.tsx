import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { BadgeCheck, Blocks, CalendarDays, FileCheck2, Gem, MapPin, ShieldCheck, Sprout, WalletCards, type LucideIcon } from "lucide-react";
import { Container } from "@/components/layout/section";
import { Breadcrumbs, PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { pageMetadata } from "@/lib/seo";
import { getPublicTraceability } from "@/modules/blockchain/application/traceability.service";
import { getPublicCertification } from "@/modules/blockchain/application/certification.service";
import { CERTIFICATE_STATUS_LABELS, type VerifiedCertificate } from "@/modules/blockchain/domain/certification";
import { TraceabilityTimeline } from "@/modules/blockchain/presentation/traceability-timeline";
import { env } from "@/server/core/env";
import { getProduitPublicParId } from "@/server/modules/catalogue/services/produits";

export const metadata = pageMetadata("Vérification de la traçabilité");
export const dynamic = "force-dynamic";

const shortAddress = (address: string) => `${address.slice(0, 8)}…${address.slice(-6)}`;
const shortTokenId = (tokenId: string) => `${tokenId.slice(0, 8)}…${tokenId.slice(-6)}`;

export default async function PublicTraceabilityPage({ params }: { params: Promise<{ productId: string }> }) {
  const { productId } = await params;
  const [product, traceability] = await Promise.all([
    getProduitPublicParId(productId),
    getPublicTraceability(productId),
  ]);
  if (!product) notFound();
  const certification = await getPublicCertification(product.id, traceability.link?.lotId);

  const canonicalUrl = `${env.APP_URL.replace(/\/$/, "")}/tracabilite/${product.id}`;
  const qrDataUrl = await QRCode.toDataURL(canonicalUrl, { width: 240, margin: 1, errorCorrectionLevel: "M" });
  const producerActor = traceability.lot
    ? traceability.actors.find((actor) => actor.wallet.toLowerCase() === traceability.lot?.producer.toLowerCase())
    : undefined;

  return (
    <Container className="space-y-8 pt-6 pb-20 md:pt-8">
      <Breadcrumbs items={[{ label: "Accueil", href: "/" }, { label: "Catalogue", href: "/catalogue" }, { label: product.nom, href: `/produit/${product.slug}` }, { label: "Traçabilité" }]} />
      <PageHeader
        surtitre="Vérification publique"
        titre={product.nom}
        description="La traçabilité et la certification ci-dessous sont lues depuis la Blockchain. Aucun wallet n'est nécessaire pour cette consultation."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Blocks className="size-5 text-brand" aria-hidden /> Traçabilité — Ali</CardTitle>
              <CardDescription>Origine du lot et historique chronologique inscrit sur DateTraceability.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {!traceability.link && <Notice>Aucun lot Blockchain n&apos;est associé à ce produit.</Notice>}
              {traceability.error && <Notice>{traceability.error}</Notice>}
              {traceability.lot && (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-success/10 p-4 text-sm">
                    <span className="flex items-center gap-2 font-semibold text-success"><ShieldCheck className="size-4" aria-hidden /> Données vérifiées sur la Blockchain</span>
                    <span className="font-mono">{traceability.lot.lotId}</span>
                  </div>
                  <dl className="grid gap-3 sm:grid-cols-2">
                    <Fact icon={Sprout} label="Variété" value={traceability.lot.variety} />
                    <Fact icon={MapPin} label="Région d'origine" value={traceability.lot.region} />
                    <Fact icon={CalendarDays} label="Récolte" value={new Date(traceability.lot.harvestDate * 1000).toLocaleDateString("fr-FR")} />
                    <Fact icon={ShieldCheck} label="Agriculteur / producteur" value={producerActor?.shopName ?? shortAddress(traceability.lot.producer)} title={traceability.lot.producer} />
                    {traceability.lot.tokenId && (
                      <Fact icon={Gem} label="Token du lot" value={`DLOT #${shortTokenId(traceability.lot.tokenId)}`} title={traceability.lot.tokenId} />
                    )}
                    {traceability.lot.tokenOwner && (
                      <Fact icon={WalletCards} label="Propriétaire du NFT" value={shortAddress(traceability.lot.tokenOwner)} title={traceability.lot.tokenOwner} />
                    )}
                  </dl>
                  <TraceabilityTimeline history={traceability.history} actors={traceability.actors} />
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><BadgeCheck className="size-5 text-brand" aria-hidden /> Certification — Baha</CardTitle>
              <CardDescription>Certificats indépendants, lus et vérifiés directement depuis ProductCertification.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!certification.configured && <Notice>Le contrat de certification n&apos;est pas encore configuré.</Notice>}
              {certification.error && <Notice>{certification.error}</Notice>}
              {certification.configured && !certification.error && certification.certificates.length === 0 && <Notice>Aucun certificat disponible.</Notice>}
              {certification.certificates.map((certificate) => <CertificateDetails key={certificate.certificateId} certificate={certificate} />)}
            </CardContent>
          </Card>
        </div>

        <Card className="h-fit lg:sticky lg:top-24">
          <CardHeader><CardTitle>QR Code du produit</CardTitle><CardDescription>Scannez pour rouvrir cette vérification publique.</CardDescription></CardHeader>
          <CardContent className="space-y-4 text-center">
            <Image src={qrDataUrl} alt={`QR Code de traçabilité pour ${product.nom}`} width={240} height={240} unoptimized className="mx-auto rounded-xl border bg-white p-2" />
            <p className="break-all text-xs text-muted-foreground">{canonicalUrl}</p>
            <Button asChild variant="outline" className="w-full"><Link href={`/produit/${product.slug}`}>Retour au produit</Link></Button>
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}

function CertificateDetails({ certificate }: { certificate: VerifiedCertificate }) {
  const tone = certificate.status === 1 ? "bg-success/10 text-success" : certificate.status === 2 ? "bg-warning/10 text-warning" : certificate.status === 3 ? "bg-danger-soft text-danger" : "bg-muted text-muted-foreground";
  return (
    <article className="space-y-4 rounded-2xl border p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><p className="font-semibold">{certificate.certificationType}</p><p className="font-mono text-xs text-muted-foreground">{certificate.certificateId}</p></div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tone}`}>{CERTIFICATE_STATUS_LABELS[certificate.status]}</span>
      </div>
      <dl className="grid gap-3 sm:grid-cols-2">
        <Fact icon={CalendarDays} label="Émission" value={new Date(certificate.issuedAt * 1000).toLocaleDateString("fr-FR")} />
        <Fact icon={CalendarDays} label="Expiration" value={new Date(certificate.expiresAt * 1000).toLocaleDateString("fr-FR")} />
        <Fact icon={ShieldCheck} label="Organisme certificateur" value={certificate.certifierName} title={certificate.certifier} />
        <Fact icon={FileCheck2} label="Preuve documentaire" value={certificate.documentHash} title={certificate.documentHash} />
      </dl>
      {certificate.status === 3 && (
        <p className="rounded-xl bg-danger-soft p-3 text-sm text-danger">
          Révoqué le {new Date(certificate.revokedAt * 1000).toLocaleDateString("fr-FR")} — {certificate.revocationReason}
        </p>
      )}
    </article>
  );
}

function Notice({ children }: { children: React.ReactNode }) {
  return <p className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">{children}</p>;
}

function Fact({ icon: Icon, label, value, title }: { icon: LucideIcon; label: string; value: string; title?: string }) {
  return (
    <div className="rounded-xl border p-4">
      <dt className="flex items-center gap-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase"><Icon className="size-4" aria-hidden /> {label}</dt>
      <dd className="mt-1 font-semibold" title={title}>{value}</dd>
    </div>
  );
}
