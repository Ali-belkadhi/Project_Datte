import Link from "next/link";
import { CreditCard, FileText, Flag, MapPin, Package, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductIllustration } from "@/components/illustrations/product-illustration";
import { StatusBadge } from "@/components/shared/status-badge";
import { Timeline } from "@/components/shared/timeline";
import { GOUVERNORAT_LABEL, METHODE_PAIEMENT, STATUT_SOUS_COMMANDE } from "@/lib/constants";
import { formatPoids, formatPrix } from "@/lib/format";
import type { Commande } from "@/types/domain";
import { ReviewForm } from "../avis/review-form";
import { DisputeDialog } from "../litiges/dispute-dialog";

/** Détail d'une commande acheteur : timeline, une carte par sous-commande, adresse, paiement, facture. */
export function OrderDetail({ commande: c }: { commande: Commande }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px] lg:items-start">
      <div className="space-y-4">
        {c.sousCommandes.map((s, i) => (
          <section key={s.id} className="space-y-5 rounded-2xl border bg-card p-4 md:p-5" aria-label={`Colis ${i + 1}`}>
            <header className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="flex items-center gap-2 font-semibold">
                  <Package className="size-4 text-muted-foreground" aria-hidden /> Colis {i + 1} · {s.fournisseurNom}
                </p>
                <p className="font-mono text-[12px] text-muted-foreground">{s.numero}</p>
              </div>
              <StatusBadge status={STATUT_SOUS_COMMANDE[s.statut]} />
            </header>
            <Timeline etapes={s.etapes} />
            {s.transporteur && (
              <p className="flex flex-wrap items-center gap-2 rounded-xl bg-sand px-3 py-2.5 text-sm">
                <Truck className="size-4 text-muted-foreground" aria-hidden />
                {s.transporteur} · suivi <span className="font-mono font-semibold">{s.numeroSuivi}</span>
              </p>
            )}
            <ul className="divide-y">
              {s.lignes.map((l) => (
                <li key={l.id} className="flex flex-wrap items-center gap-3 py-3">
                  <span className="size-14 shrink-0 overflow-hidden rounded-xl bg-sand">
                    <ProductIllustration type={l.visuel} variete={l.variete} seed={l.slug} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <Link href={`/produit/${l.slug}`} className="text-[15px] font-semibold hover:underline">
                      {l.nomProduit}
                    </Link>
                    <p className="text-[13px] text-muted-foreground">
                      {l.quantiteGrammes ? `${formatPoids(l.quantiteGrammes)} × ${formatPrix(l.prixUnitaire)} /kg` : `${l.quantiteUnites} × ${formatPrix(l.prixUnitaire)}`}
                    </p>
                  </div>
                  <span className="font-semibold tabular-nums">{formatPrix(l.total)}</span>
                  {s.statut === "LIVREE" && <ReviewForm ligneCommandeId={l.id} produitNom={l.nomProduit} />}
                </li>
              ))}
            </ul>
            <footer className="flex flex-wrap items-center justify-between gap-2 border-t pt-3 text-sm">
              <span className="text-muted-foreground">
                Sous-total {formatPrix(s.sousTotal)} · livraison {s.fraisLivraison ? formatPrix(s.fraisLivraison) : "offerte"}
              </span>
              <DisputeDialog sousCommandeNumero={s.numero} trigger={<Button variant="ghost" size="sm" className="text-danger hover:bg-danger-soft hover:text-danger"><Flag aria-hidden /> Signaler un problème</Button>} />
            </footer>
          </section>
        ))}
      </div>
      <aside className="space-y-4 lg:sticky lg:top-24">
        <div className="space-y-3 rounded-2xl border bg-card p-4 text-sm">
          <p className="flex items-center gap-2 font-semibold">
            <MapPin className="size-4 text-muted-foreground" aria-hidden /> Livraison
          </p>
          <address className="leading-relaxed text-muted-foreground not-italic">
            {c.adresse.destinataire}
            <br />
            {c.adresse.ligne1}
            <br />
            {c.adresse.codePostal} {c.adresse.ville}, {GOUVERNORAT_LABEL[c.adresse.gouvernorat]}
          </address>
        </div>
        <div className="space-y-3 rounded-2xl border bg-card p-4 text-sm">
          <p className="flex items-center gap-2 font-semibold">
            <CreditCard className="size-4 text-muted-foreground" aria-hidden /> Paiement
          </p>
          <p className="text-muted-foreground">{METHODE_PAIEMENT[c.methodePaiement]}</p>
          <dl className="space-y-1.5 border-t pt-3">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Sous-total</dt>
              <dd className="tabular-nums">{formatPrix(c.sousTotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Livraison</dt>
              <dd className="tabular-nums">{formatPrix(c.fraisLivraison)}</dd>
            </div>
            {c.remise > 0 && (
              <div className="flex justify-between text-success">
                <dt>Remise</dt>
                <dd className="tabular-nums">−{formatPrix(c.remise)}</dd>
              </div>
            )}
            <div className="flex justify-between border-t pt-2 text-base font-semibold">
              <dt>Total</dt>
              <dd className="font-display tabular-nums">{formatPrix(c.total)}</dd>
            </div>
          </dl>
          <Button variant="outline" size="sm" className="w-full">
            <FileText aria-hidden /> Télécharger la facture
          </Button>
        </div>
      </aside>
    </div>
  );
}
