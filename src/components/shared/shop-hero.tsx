import { CalendarDays, MapPin, Package, Truck } from "lucide-react";
import { ContactSellerButton } from "@/components/shared/contact-seller-button";
import { PalmPattern } from "@/components/brand/palm-pattern";
import { RatingStars } from "@/components/shared/rating-stars";
import { ShopAvatar } from "@/components/shared/shop-avatar";
import { VerifiedBadge } from "@/components/shared/verified-badge";
import { GOUVERNORAT_LABEL, SHOP_TINTS, TYPE_FOURNISSEUR } from "@/lib/constants";
import { formatNombre } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Fournisseur } from "@/types/domain";

/** Bannière de boutique (motif de palmes à la couleur du vendeur) + identité + actions. */
export function ShopHero({ boutique: b, apercu = false }: { boutique: Pick<Fournisseur, "id" | "nomBoutique" | "couleur" | "verifie" | "region" | "ville" | "type" | "noteMoyenne" | "nombreAvis" | "nombreVentes" | "depuis" | "delaiExpedition" | "description">; apercu?: boolean }) {
  const t = SHOP_TINTS[b.couleur];
  return (
    <div className="overflow-hidden rounded-3xl border bg-card">
      <div className={cn("relative overflow-hidden", t.bg, apercu ? "h-24" : "h-32 md:h-44")}>
        <PalmPattern className="text-cream" opacity={0.2} />
      </div>
      <div className={cn("relative flex flex-col gap-4 px-5 pb-5 md:flex-row md:items-end md:justify-between", apercu ? "-mt-8" : "-mt-10")}>
        <div className="flex flex-col gap-3 md:flex-row md:items-end">
          <ShopAvatar nom={b.nomBoutique} couleur={b.couleur} size="xl" />
          <div className="space-y-1">
            <h1 className={cn("flex flex-wrap items-center gap-2 font-display font-semibold", apercu ? "text-xl" : "text-2xl md:text-3xl")}>
              {b.nomBoutique}
              {b.verifie && <VerifiedBadge />}
            </h1>
            <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-3.5" aria-hidden />
                {b.ville}, {GOUVERNORAT_LABEL[b.region]}
              </span>
              <span>{TYPE_FOURNISSEUR[b.type]}</span>
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="size-3.5" aria-hidden /> Membre depuis {b.depuis}
              </span>
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px]">
              <RatingStars note={b.noteMoyenne} nombreAvis={b.nombreAvis} />
              <span className="inline-flex items-center gap-1 text-muted-foreground">
                <Package className="size-3.5" aria-hidden /> {formatNombre(b.nombreVentes)} ventes
              </span>
              <span className="inline-flex items-center gap-1 text-muted-foreground">
                <Truck className="size-3.5" aria-hidden /> {b.delaiExpedition}
              </span>
            </div>
          </div>
        </div>
        {!apercu && <ContactSellerButton fournisseurId={b.id} />}
      </div>
    </div>
  );
}
