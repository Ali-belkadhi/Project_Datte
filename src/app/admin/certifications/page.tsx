import { PageHeader } from "@/components/layout/page-header";
import { pageMetadata } from "@/lib/seo";
import { listBlockchainCertificates } from "@/modules/blockchain/application/certification.service";
import { listAllProductBlockchainLinks } from "@/modules/blockchain/application/traceability.service";
import { getOptionalPublicCertificationConfig } from "@/modules/blockchain/infrastructure/ethers/server-config";
import { CertificationAdminWorkspace } from "@/modules/blockchain/presentation/certification-admin-workspace";
import { getProduitPublicParId } from "@/server/modules/catalogue/services/produits";

export const metadata = pageMetadata("Certifications Blockchain");
export const dynamic = "force-dynamic";

export default async function AdminCertificationsPage() {
  const [links, certificates] = await Promise.all([
    listAllProductBlockchainLinks(),
    listBlockchainCertificates(),
  ]);
  const candidates = (await Promise.all(links.map(async (link) => {
    const product = await getProduitPublicParId(link.productId);
    return product ? { productId: product.id, productName: product.nom, lotId: link.lotId } : null;
  }))).filter((item): item is { productId: string; productName: string; lotId: string } => item !== null);

  return (
    <div className="space-y-6">
      <PageHeader
        surtitre="Supply Chain Datte · Baha"
        titre="Certifications Blockchain"
        description="Émettez, consultez et révoquez les certificats associés aux produits et lots vérifiés."
      />
      <CertificationAdminWorkspace
        config={getOptionalPublicCertificationConfig()}
        candidates={candidates}
        certificates={certificates}
      />
    </div>
  );
}
