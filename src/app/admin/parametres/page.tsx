import { PageHeader } from "@/components/layout/page-header";
import { PlatformSettings } from "@/features/comptes/admin";
import { pageMetadata } from "@/lib/seo";
import { getParametresPlateforme } from "@/server/modules/comptes/services/admin";

export const metadata = pageMetadata("Paramètres de la plateforme");

/** Paramètres plateforme (module A). */
export default async function AdminParametresPage() {
  const parametres = await getParametresPlateforme();
  return (
    <div className="space-y-6">
      <PageHeader surtitre="Administration" titre="Paramètres" />
      <PlatformSettings parametres={parametres} />
    </div>
  );
}
