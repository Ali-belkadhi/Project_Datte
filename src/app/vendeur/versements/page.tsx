import { CalendarClock, Info, Landmark, Wallet } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { PayoutTable } from "@/features/commandes/vendeur";
import { formatDate, formatPrix } from "@/lib/format";
import { pageMetadata } from "@/lib/seo";
import { mesVersements, TAUX_COMMISSION } from "@/server/modules/commandes/services/versements";

export const metadata = pageMetadata("Versements");

/** Versements (module C) : solde à venir, prochain versement, historique, explication de la commission. */
export default async function VersementsPage() {
  const { versements, prochain, totalVerse } = await mesVersements();
  return (
    <div className="space-y-6">
      <PageHeader surtitre="Ventes" titre="Versements" description="Vos ventes livrées sont versées tous les quinze jours sur votre RIB." />
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-night text-cream md:col-span-2">
          <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="flex items-center gap-2 text-sm text-cream/70">
                <Wallet className="size-4 text-brand-light" aria-hidden /> Solde à venir
              </p>
              <p className="mt-1 font-display text-4xl font-semibold tabular-nums md:text-5xl">{prochain ? formatPrix(prochain.montantNet) : "0,000 DT"}</p>
            </div>
            {prochain && (
              <p className="flex items-center gap-2 text-sm text-cream/80">
                <CalendarClock className="size-4" aria-hidden /> Prochain versement le {formatDate(prochain.dateVersement)}
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Landmark className="size-4" aria-hidden /> Déjà versé
            </p>
            <p className="mt-1 font-display text-3xl font-semibold tabular-nums">{formatPrix(totalVerse)}</p>
            <p className="mt-1 text-[13px] text-muted-foreground">RIB •••• 4821</p>
          </CardContent>
        </Card>
      </div>
      <PayoutTable versements={versements} />
      <div className="flex gap-3 rounded-2xl border bg-sand p-4 text-sm">
        <Info className="mt-0.5 size-5 shrink-0 text-accent-foreground" aria-hidden />
        <div className="space-y-1">
          <p className="font-semibold">Comment est calculée la commission ?</p>
          <p className="text-muted-foreground">
            DEGLA prélève {TAUX_COMMISSION} % du montant des articles (hors frais de livraison) sur chaque sous-commande livrée. Elle couvre le paiement
            sécurisé, la vérification des vendeurs, l&apos;assistance et la promotion de votre boutique. Le versement est effectué 48 h après la fin de chaque
            quinzaine.
          </p>
        </div>
      </div>
    </div>
  );
}
