import Link from "next/link";
import { MapPin, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RatingStars } from "@/components/shared/rating-stars";
import { ShopAvatar } from "@/components/shared/shop-avatar";
import { VerifiedBadge } from "@/components/shared/verified-badge";
import { GOUVERNORAT_LABEL } from "@/lib/constants";
import type { Fournisseur } from "@/types/domain";

/** Carte vendeur de la fiche produit. */
export function SellerCard({ vendeur: v }: { vendeur: Fournisseur }) {
  return (
    <div className="space-y-4 rounded-2xl border bg-card p-4">
      <div className="flex items-center gap-3">
        <ShopAvatar nom={v.nomBoutique} couleur={v.couleur} />
        <div className="min-w-0">
          <p className="truncate font-semibold">{v.nomBoutique}</p>
          <p className="inline-flex items-center gap-1 text-[13px] text-muted-foreground">
            <MapPin className="size-3.5" aria-hidden /> {v.ville}, {GOUVERNORAT_LABEL[v.region]}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {v.verifie && <VerifiedBadge />}
        <RatingStars note={v.noteMoyenne} nombreAvis={v.nombreAvis} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Button asChild variant="outline" size="sm">
          <Link href={`/boutique/${v.slug}`}>Voir la boutique</Link>
        </Button>
        <Button asChild variant="ghost" size="sm" className="border">
          <Link href="/compte/messages">
            <MessageCircle aria-hidden /> Contacter
          </Link>
        </Button>
      </div>
    </div>
  );
}
