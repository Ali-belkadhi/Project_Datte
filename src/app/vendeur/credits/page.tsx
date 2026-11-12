import { CircleCheck, CircleX, Coins } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { CreditHistory, CreditPackCard } from "@/features/catalogue/credits";
import { pageMetadata } from "@/lib/seo";
import { listPacksCredits, mesMouvementsCredits, monSoldeCredits } from "@/server/modules/catalogue/services/credits";
import { confirmerRetourPaiement } from "@/server/contracts/commandes";

export const metadata = pageMetadata("Crédits 3D");

/** Crédits 3D (module B) : solde, packs, historique. */
export default async function CreditsPage({ searchParams }: { searchParams: Promise<{ paiement?: string; session_id?: string }> }) {
  const { paiement, session_id } = await searchParams;
  // retour de Stripe : le paiement est vérifié et les crédits versés avant d'afficher le solde
  const statut = session_id ? await confirmerRetourPaiement(session_id) : null;
  const [solde, packs, mouvements] = await Promise.all([monSoldeCredits(), listPacksCredits(), mesMouvementsCredits()]);
  return (
    <div className="space-y-8">
      <PageHeader surtitre="Catalogue" titre="Crédits 3D" description="Chaque génération consomme 1 crédit (une photo) ou 2 crédits (plusieurs photos)." />
      {statut === "REUSSI" && (
        <p role="status" className="flex items-center gap-2 rounded-xl bg-success/10 px-4 py-3 text-sm font-semibold text-success">
          <CircleCheck className="size-4" aria-hidden /> Paiement confirmé : vos crédits ont été ajoutés à votre solde.
        </p>
      )}
      {(paiement === "annule" || statut === "ECHOUE") && (
        <p role="status" className="flex items-center gap-2 rounded-xl bg-danger/10 px-4 py-3 text-sm font-semibold text-danger">
          <CircleX className="size-4" aria-hidden /> Paiement non abouti : aucun crédit n&apos;a été débité.
        </p>
      )}
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
