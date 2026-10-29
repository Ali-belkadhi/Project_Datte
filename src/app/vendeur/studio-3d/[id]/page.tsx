import { PageHeader } from "@/components/layout/page-header";
import { GenerationWizard } from "@/features/catalogue/studio-3d";
import { pageMetadata } from "@/lib/seo";
import { monSoldeCredits } from "@/server/modules/catalogue/services/credits";
import { getModele3D } from "@/server/modules/catalogue/services/modeles3d";
import type { Modele3DVendeur } from "@/types/domain";

export const metadata = pageMetadata("Génération 3D");

const NOUVEAU: Modele3DVendeur = {
  id: "nouveau",
  produitId: "p03",
  produitNom: "Deglet Nour bio en barquette",
  source: null,
  visuel: "barquette",
  variete: "deglet-nour",
  statut: "EN_ATTENTE",
  progression: 0,
  creeLe: "2026-10-18T10:00:00+01:00",
  creditsConsommes: 0,
};

/** Assistant de génération et revue (module B). `/vendeur/studio-3d/nouveau` démarre une génération. */
export default async function StudioDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [modele, solde] = await Promise.all([id === "nouveau" ? Promise.resolve(NOUVEAU) : getModele3D(id), monSoldeCredits()]);
  const m = modele ?? NOUVEAU;
  return (
    <div className="space-y-6">
      <PageHeader fil={[{ label: "Studio 3D", href: "/vendeur/studio-3d" }, { label: m.produitNom }]} titre={m.produitNom} description="Photos → génération → revue et publication." />
      <GenerationWizard modele={m} solde={solde.solde} />
    </div>
  );
}
