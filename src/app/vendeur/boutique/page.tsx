import { PageHeader } from "@/components/layout/page-header";
import { ShopEditor } from "@/features/comptes/boutique";
import { pageMetadata } from "@/lib/seo";
import { getMaBoutique } from "@/server/modules/comptes/services/fournisseurs";

export const metadata = pageMetadata("Ma boutique");

/** Édition de la boutique (module A). */
export default async function MaBoutiquePage() {
  const boutique = await getMaBoutique();
  return (
    <div className="space-y-6">
      <PageHeader surtitre="Boutique" titre="Ma boutique" description="Ce que voient les acheteurs sur votre page publique." />
      <ShopEditor boutique={boutique} />
    </div>
  );
}
