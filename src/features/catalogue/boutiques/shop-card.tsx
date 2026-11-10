import Link from "next/link";
import { MapPin } from "lucide-react";
import { PalmPattern } from "@/components/brand/palm-pattern";
import { RatingStars } from "@/components/shared/rating-stars";
import { ShopAvatar } from "@/components/shared/shop-avatar";
import { VerifiedBadge } from "@/components/shared/verified-badge";
import { GOUVERNORAT_LABEL, SHOP_TINTS, TYPE_FOURNISSEUR } from "@/lib/constants";
import { formatNombre } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Fournisseur } from "@/types/domain";

/** Carte boutique : bannière teintée + avatar, nom, vérifié, région, note, ventes. */
export function ShopCard({ boutique: b, className }: { boutique: Fournisseur; className?: string }) {
  const t = SHOP_TINTS[b.couleur];
  return (
    <Link
      href={`/boutique/${b.slug}`}
      className={cn("group flex flex-col overflow-hidden rounded-2xl border bg-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lift", className)}
    >
      <div className={cn("relative h-20 overflow-hidden", t.bg)}>
        <PalmPattern className="text-cream" opacity={0.18} />
      </div>
      <div className="-mt-8 flex flex-1 flex-col gap-2 px-4 pb-4">
        <ShopAvatar nom={b.nomBoutique} couleur={b.couleur} size="lg" className="ring-4 ring-card" />
        <div>
          <h3 className="flex items-center gap-1.5 font-semibold">
            <span className="truncate">{b.nomBoutique}</span>
            {b.verifie && <VerifiedBadge iconOnly />}
          </h3>
          <p className="mt-0.5 inline-flex items-center gap-1 text-[13px] text-muted-foreground">
            <MapPin className="size-3.5" aria-hidden />
            {b.ville}, {GOUVERNORAT_LABEL[b.region]} · {TYPE_FOURNISSEUR[b.type]}
          </p>
        </div>
        <p className="line-clamp-2 text-[13px] text-muted-foreground">{b.description}</p>
        <div className="mt-auto flex items-center justify-between pt-1 text-[13px]">
          <RatingStars note={b.noteMoyenne} nombreAvis={b.nombreAvis} />
          <span className="text-muted-foreground">{formatNombre(b.nombreVentes)} ventes</span>
        </div>
      </div>
    </Link>
  );
}
