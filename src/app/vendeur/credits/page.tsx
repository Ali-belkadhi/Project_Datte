import { Coins } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { CreditHistory, CreditPackCard } from "@/features/catalogue/credits";
import { pageMetadata } from "@/lib/seo";
import { listPacksCredits, mesMouvementsCredits, monSoldeCredits } from "@/server/modules/catalogue/services/credits";

export const metadata = pageMetadata("Crédits 3D");

/** Crédits 3D (module B) : solde, packs, historique. */
export default async function CreditsPage() {
  const [solde, packs, mouvements] = await Promise.all([monSoldeCredits(), listPacksCredits(), mesMouvementsCredits()]);
  return (
    <div className="space-y-8">
      <PageHeader surtitre="Catalogue" titre="Crédits 3D" description="Chaque génération consomme 1 crédit (une photo) ou 2 crédits (plusieurs photos)." />
      <div className="flex items-center gap-4 rounded-2xl bg-night p-6 text-cream">
        <span className="grid size-14 place-items-center rounded-2xl bg-cream/10">
          <Coins className="size-7 text-brand-light" aria-hidden />
        </span>
        <div>
          <p className="text-sm text-cream/70">Solde actuel</p>
          <p className="font-display text-5xl font-semibold tabular-nums">{solde.solde} crédits</p>
        </div>
      </div>
      <ul className="grid gap-5 pt-2 md:grid-cols-3">
        {packs.map((p) => (
          <li key={p.id} className="flex [&>div]:w-full">
            <CreditPackCard pack={p} />
          </li>
        ))}
      </ul>
      <section className="space-y-3">
        <h2 className="font-display text-2xl font-semibold">Historique</h2>
        <CreditHistory mouvements={mouvements} />
      </section>
    </div>
  );
}
