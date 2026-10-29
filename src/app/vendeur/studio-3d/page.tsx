import Link from "next/link";
import { Coins, Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { ModelCard } from "@/features/catalogue/studio-3d";
import { pageMetadata } from "@/lib/seo";
import { monSoldeCredits } from "@/server/modules/catalogue/services/credits";
import { mesModeles3D } from "@/server/modules/catalogue/services/modeles3d";

export const metadata = pageMetadata("Studio 3D");

/** Studio 3D (module B) : solde, coût, grille des modèles. */
export default async function StudioPage() {
  const [modeles, solde] = await Promise.all([mesModeles3D(), monSoldeCredits()]);
  return (
    <div className="space-y-6">
      <PageHeader
        surtitre="Catalogue"
        titre="Studio 3D"
        description="Transformez vos photos en modèles 3D interactifs."
        actions={
          <Button asChild variant="brand">
            <Link href="/vendeur/studio-3d/nouveau">
              <Plus aria-hidden /> Nouvelle génération
            </Link>
          </Button>
        }
      />
      <div className="flex flex-col gap-3 rounded-2xl bg-night p-5 text-cream sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-center gap-3">
          <Coins className="size-6 text-brand-light" aria-hidden />
          <span>
            <span className="font-display text-3xl font-semibold tabular-nums">{solde.solde}</span> crédits disponibles
            <span className="block text-[13px] text-cream/70">1 crédit pour une photo · 2 crédits pour plusieurs photos</span>
          </span>
        </p>
        <Button asChild variant="outline-light" size="sm">
          <Link href="/vendeur/credits">Recharger</Link>
        </Button>
      </div>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {modeles.map((m) => (
          <li key={m.id} className="flex [&>a]:w-full">
            <ModelCard modele={m} />
          </li>
        ))}
      </ul>
    </div>
  );
}
