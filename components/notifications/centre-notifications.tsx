"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Alerte } from "@/components/ui/feedback";
import { Bell, CheckCheck, Circle, Loader2 } from "lucide-react";
import { actionMarquerLue, actionMarquerToutesLues } from "@/server/actions/notification.actions";

export type NotificationVue = {
  id: string;
  type: string;
  titre: string;
  contenu: string;
  lien?: string;
  lue: boolean;
  date: string;
};

function formaterDate(iso: string) {
  try {
    return new Date(iso).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function CentreNotifications({ notifications }: { notifications: NotificationVue[] }) {
  const router = useRouter();
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, demarrer] = useTransition();

  const nonLues = notifications.filter((n) => !n.lue).length;

  function lire(id: string, lien?: string) {
    setErreur(null);
    demarrer(async () => {
      const rep = await actionMarquerLue(id);
      if (!rep.success) {
        setErreur(rep.error ?? "Action impossible");
        return;
      }
      router.refresh();
      if (lien) router.push(lien);
    });
  }

  function lireTout() {
    setErreur(null);
    demarrer(async () => {
      const rep = await actionMarquerToutesLues();
      if (!rep.success) {
        setErreur(rep.error ?? "Action impossible");
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="space-y-5">
      {erreur && <Alerte type="erreur">{erreur}</Alerte>}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">
          {nonLues > 0 ? `${nonLues} notification(s) non lue(s)` : "Tout est à jour."}
        </p>
        {nonLues > 0 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={lireTout}
            disabled={enCours}
            className="rounded-full"
          >
            {enCours ? <Loader2 className="size-4 animate-spin" /> : <CheckCheck className="size-4" />}
            Tout marquer comme lu
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="rounded-2xl border border-forest/10 bg-cream-50/70 p-8 text-center text-sm text-muted">
          <Bell className="mx-auto mb-2 size-6 text-muted" />
          Aucune notification pour le moment.
        </div>
      ) : (
        <ul className="space-y-3">
          {notifications.map((n) => (
            <li
              key={n.id}
              className={`rounded-2xl border p-5 transition-colors ${
                n.lue ? "border-forest/10 bg-cream-50/60" : "border-gold/40 bg-gold/8"
              }`}
            >
              <div className="flex items-start gap-3">
                <Circle
                  className={`mt-1.5 size-2.5 shrink-0 ${n.lue ? "text-transparent" : "fill-gold text-gold"}`}
                />
                <div className="flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-medium text-forest">{n.titre}</p>
                    <span className="text-xs text-muted">{formaterDate(n.date)}</span>
                  </div>
                  <p className="mt-1 text-sm text-ink/75">{n.contenu}</p>
                  <div className="mt-3 flex gap-3">
                    {n.lien && (
                      <Link href={n.lien} className="text-xs font-medium text-forest underline">
                        Ouvrir
                      </Link>
                    )}
                    {!n.lue && (
                      <button
                        type="button"
                        onClick={() => lire(n.id)}
                        disabled={enCours}
                        className="text-xs font-medium text-muted underline hover:text-forest"
                      >
                        Marquer comme lu
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
