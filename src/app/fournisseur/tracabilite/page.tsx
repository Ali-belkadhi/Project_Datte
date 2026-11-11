import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { pageMetadata } from "@/lib/seo";
import { listSupplierTraceability } from "@/modules/blockchain/application/traceability.service";
import { getOptionalPublicBlockchainConfig } from "@/modules/blockchain/infrastructure/ethers/server-config";
import { TraceabilityWorkspace } from "@/modules/blockchain/presentation/traceability-workspace";
import { getUtilisateurCourant } from "@/server/contracts/comptes";
import { mesProduits } from "@/server/modules/catalogue/services/produits";
import { getMaBoutique } from "@/server/modules/comptes/services/fournisseurs";

export const metadata = pageMetadata("Traçabilité Blockchain");
export const dynamic = "force-dynamic";

export default async function FournisseurTraceabilityPage() {
  const [user, shop, products] = await Promise.all([getUtilisateurCourant(), getMaBoutique(), mesProduits()]);
  if (!user.fournisseurId) notFound();
  const data = await listSupplierTraceability(user.fournisseurId, { shopName: shop.nomBoutique, shopType: shop.type });

  return (
    <div className="space-y-6">
      <PageHeader
        surtitre="Supply Chain Datte · Ali"
        titre="Traçabilité Blockchain"
        description="Créez les lots agricoles, ajoutez les étapes de fabrication et associez vos produits au registre vérifiable."
      />
      <TraceabilityWorkspace
        supplierId={user.fournisseurId}
        shopType={shop.type}
        shopVerified={shop.verifie}
        config={getOptionalPublicBlockchainConfig()}
        lots={data.lots}
        links={data.links}
        products={products}
      />
    </div>
  );
}
