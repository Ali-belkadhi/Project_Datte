import Link from "next/link";
import { ArrowRight, Heart, MapPin, Package, Sparkles } from "lucide-react";
import { AccountNavCards } from "@/components/layout/account-nav";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { Timeline } from "@/components/shared/timeline";
import { ProductCarousel } from "@/features/catalogue/produits";
import { STATUT_COMMANDE } from "@/lib/constants";
import { formatDate, formatPrix } from "@/lib/format";
import { pageMetadata } from "@/lib/seo";
import { mesFavoris } from "@/server/modules/catalogue/services/favoris";
import { derniereCommande } from "@/server/modules/commandes/services/commandes";
import { getUtilisateurCourant } from "@/server/modules/comptes/services/utilisateurs";

export const metadata = pageMetadata("Mon compte");

/** Aperçu du compte (module A) : bonjour, dernière commande (mini-timeline), raccourcis, favoris récents. */
export default async function ComptePage() {
  const [u, commande, favoris] = await Promise.all([getUtilisateurCourant(), derniereCommande(), mesFavoris()]);
  const sc = commande?.sousCommandes[0];
  return (
    <>
      <PageHeader surtitre="Mon compte" titre={`Bonjour ${u.prenom}`} description={`${u.email} · ${u.ville}`} />
      {commande && sc && (
        <section className="space-y-4 rounded-2xl border bg-card p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.16em] text-brand uppercase">Dernière commande</p>
              <p className="mt-1 flex flex-wrap items-center gap-2">
                <span className="font-mono text-sm font-semibold">{commande.numero}</span>
                <StatusBadge status={STATUT_COMMANDE[commande.statut]} />
              </p>
              <p className="text-[13px] text-muted-foreground">
                {formatDate(commande.creeLe)} · {commande.sousCommandes.length} colis · {formatPrix(commande.total)}
              </p>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href={`/compte/commandes/${commande.numero}`}>
                Suivre <ArrowRight className="rtl:rotate-180" aria-hidden />
              </Link>
            </Button>
          </div>
          <Timeline etapes={sc.etapes} compact orientation="horizontal" />
        </section>
      )}
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { href: "/compte/commandes", icon: Package, t: "Mes commandes" },
          { href: "/compte/favoris", icon: Heart, t: "Mes favoris" },
          { href: "/compte/adresses", icon: MapPin, t: "Mes adresses" },
          { href: "/assistant", icon: Sparkles, t: "Assistant" },
        ].map((r) => (
          <li key={r.href}>
            <Link href={r.href} className="flex h-full flex-col gap-3 rounded-2xl border bg-card p-4 transition-all hover:-translate-y-0.5 hover:shadow-lift">
              <span className="grid size-10 place-items-center rounded-xl bg-brand-soft text-accent-foreground">
                <r.icon className="size-5" aria-hidden />
              </span>
              <span className="font-semibold">{r.t}</span>
            </Link>
          </li>
        ))}
      </ul>
      <AccountNavCards />
      {favoris.produits.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl font-semibold">Favoris récents</h2>
            <Link href="/compte/favoris" className="text-sm font-semibold text-date">
              Tout voir
            </Link>
          </div>
          <ProductCarousel items={favoris.produits} label="Favoris récents" />
        </section>
      )}
    </>
  );
}
