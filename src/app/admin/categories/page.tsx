import { PageHeader } from "@/components/layout/page-header";
import { CategoryAdmin } from "@/features/catalogue/categories";
import { pageMetadata } from "@/lib/seo";
import { categorieDeriveRepository } from "@/server/modules/catalogue/repositories";

export const metadata = pageMetadata("Catégories Dérivées");

/** Admin catégories dérivés (module B). */
export default async function AdminCategoriesPage() {
  const categories = await categorieDeriveRepository.lister(true);
  return (
    <div className="space-y-6">
      <PageHeader
        surtitre="Administration"
        titre="Catégories de produits dérivés"
        description="Référentiel des catégories de transformation de la datte (sirops, jus, pâtes, etc.)."
      />
      <CategoryAdmin categories={categories} />
    </div>
  );
}
