import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MapPin, Truck, User } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductIllustration } from "@/components/illustrations/product-illustration";
import { StatusBadge } from "@/components/shared/status-badge";
import { Timeline } from "@/components/shared/timeline";
import { OrderActions } from "@/features/commandes/vendeur";
import { STATUT_SOUS_COMMANDE } from "@/lib/constants";
import { formatDateHeure, formatPoids, formatPrix } from "@/lib/format";
import { pageMetadata } from "@/lib/seo";
import { getSousCommande } from "@/server/modules/commandes/services/commandes";

export async function generateMetadata({ params }: { params: Promise<{ numero: string }> }): Promise<Metadata> {
  const { numero } = await params;
  return pageMetadata(`Commande ${numero}`);
}

/** Détail d'une commande reçue (module C) : client, lignes, adresse, timeline, actions selon le statut. */
export default async function VendeurCommandeDetail({ params }: { params: Promise<{ numero: string }> }) {
  const { numero } = await params;
  const s = await getSousCommande(numero);
  if (!s) notFound();
  return (
    <div className="space-y-6">
      <PageHeader
        fil={[{ label: "Commandes", href: "/vendeur/commandes" }, { label: s.numero }]}
        titre={`Commande ${s.numero}`}
        description={
          <span className="flex flex-wrap items-center gap-2">
            Reçue le {formatDateHeure(s.creeLe)} <StatusBadge status={STATUT_SOUS_COMMANDE[s.statut]} />
          </span>
        }
      />
      <Card>
        <CardContent className="space-y-5">
          <Timeline etapes={s.etapes} />
          <OrderActions numero={s.numero} statut={s.statut} />
        </CardContent>
      </Card>
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardHeader>
            <CardTitle>Articles</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y">
              {s.lignes.map((l) => (
                <li key={l.id} className="flex items-center gap-3 py-3 first:pt-0">
                  <span className="size-14 shrink-0 overflow-hidden rounded-xl bg-sand">
                    <ProductIllustration type={l.visuel} variete={l.variete} seed={l.slug} />
                  </span>
                  <span className="flex-1">
                    <span className="block font-semibold">{l.nomProduit}</span>
                    <span className="block text-[13px] text-muted-foreground">{l.quantiteGrammes ? `${formatPoids(l.quantiteGrammes)} × ${formatPrix(l.prixUnitaire)} /kg` : `${l.quantiteUnites} × ${formatPrix(l.prixUnitaire)}`}</span>
                  </span>
                  <span className="font-semibold tabular-nums">{formatPrix(l.total)}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-4 space-y-1.5 border-t pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Sous-total</dt>
                <dd className="tabular-nums">{formatPrix(s.sousTotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Commission DEGLA (8 %)</dt>
                <dd className="tabular-nums">−{formatPrix(s.commission)}</dd>
              </div>
              <div className="flex justify-between text-base font-semibold">
                <dt>Votre revenu</dt>
                <dd className="font-display tabular-nums">{formatPrix(s.sousTotal - s.commission)}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
        <div className="space-y-4">
          <Card>
            <CardContent className="space-y-3 text-sm">
              <p className="flex items-center gap-2 font-semibold">
                <User className="size-4 text-muted-foreground" aria-hidden /> Client
              </p>
              <p>
                {s.client.prenom} · {s.client.ville}
              </p>
              <p className="flex items-center gap-2 font-semibold">
                <MapPin className="size-4 text-muted-foreground" aria-hidden /> Livraison
              </p>
              <p className="text-muted-foreground">Adresse transmise sur le bordereau d&apos;expédition (protégée jusqu&apos;à l&apos;acceptation).</p>
              {s.transporteur && (
                <p className="flex items-center gap-2">
                  <Truck className="size-4 text-muted-foreground" aria-hidden /> {s.transporteur} · <span className="font-mono">{s.numeroSuivi}</span>
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
