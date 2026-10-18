"use client";
import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, BadgeCheck, Bell, Box, Coins, MessageCircle, Package, PackageX, Scale, Star, ShoppingBag, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatHeure, formatDateCourte } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useAction } from "@/hooks/use-action";
import type { Notification } from "@/types/domain";
import type { TypeNotification } from "@/types/enums";
import { marquerNotificationLue } from "@/server/modules/comptes/actions";

const ICONES: Record<TypeNotification, LucideIcon> = {
  COMMANDE_STATUT: Package,
  NOUVELLE_COMMANDE: ShoppingBag,
  MODELE_3D_PRET: Box,
  MODELE_3D_ECHEC: PackageX,
  NOUVEAU_MESSAGE: MessageCircle,
  STOCK_BAS: AlertTriangle,
  NOUVEL_AVIS: Star,
  FOURNISSEUR_VALIDE: BadgeCheck,
  LITIGE: Scale,
  CREDITS_3D_BAS: Coins,
  ACHAT_CREDITS_CONFIRME: Coins,
};

/** Une notification : icône par type, non lue en surbrillance. */
export function NotificationItem({ n, lue, onLire }: { n: Notification; lue: boolean; onLire: () => void }) {
  const Icone = ICONES[n.type] ?? Bell;
  const contenu = (
    <>
      <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl", lue ? "bg-muted text-muted-foreground" : "bg-brand-soft text-accent-foreground")}>
        <Icone className="size-[18px]" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-start justify-between gap-2">
          <span className={cn("text-[15px]", lue ? "font-medium" : "font-semibold")}>{n.titre}</span>
          <span className="shrink-0 text-[12px] text-muted-foreground">{formatDateCourte(n.creeLe)} · {formatHeure(n.creeLe)}</span>
        </span>
        <span className="mt-0.5 block text-[14px] text-muted-foreground">{n.contenu}</span>
      </span>
      {!lue && <span className="mt-2 size-2.5 shrink-0 rounded-full bg-brand-fill" aria-label="Non lue" />}
    </>
  );
  const cls = cn("flex gap-3 rounded-2xl border p-4 transition-colors hover:bg-accent/40", !lue ? "border-brand-fill/30 bg-brand-soft/40" : "bg-card");
  return n.lien ? (
    <Link href={n.lien} onClick={onLire} className={cls}>
      {contenu}
    </Link>
  ) : (
    <button type="button" onClick={onLire} className={cn(cls, "w-full text-start")}>
      {contenu}
    </button>
  );
}

/** Liste groupée (« Aujourd'hui », « Cette semaine »…). « Tout marquer comme lu » (démo). */
export function NotificationList({ groupes }: { groupes: { titre: string; items: Notification[] }[] }) {
  const [lues, setLues] = useState<Set<string>>(() => new Set(groupes.flatMap((g) => g.items.filter((n) => n.lue).map((n) => n.id))));
  const { run } = useAction(marquerNotificationLue, { silencieux: true });
  const total = groupes.reduce((a, g) => a + g.items.length, 0);
  const nonLues = total - lues.size;
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{nonLues > 0 ? `${nonLues} non lue${nonLues > 1 ? "s" : ""}` : "Tout est lu"}</p>
        <Button variant="ghost" size="sm" disabled={nonLues === 0} onClick={() => setLues(new Set(groupes.flatMap((g) => g.items.map((n) => n.id))))}>
          Tout marquer comme lu
        </Button>
      </div>
      {groupes.map((g) => (
        <section key={g.titre} className="space-y-2">
          <h2 className="text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">{g.titre}</h2>
          <ul className="space-y-2">
            {g.items.map((n) => (
              <li key={n.id}>
                <NotificationItem
                  n={n}
                  lue={lues.has(n.id)}
                  onLire={() => {
                    setLues((s) => new Set(s).add(n.id));
                    void run({ id: n.id });
                  }}
                />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
