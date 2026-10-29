"use client";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { STATUT_SOUS_COMMANDE } from "@/lib/constants";
import { formatPrix } from "@/lib/format";
import type { Commande } from "@/types/domain";

/** Confirmation : coche animée, « Merci Sarra ! », numéro en mono, sous-commandes et vendeurs. */
export function OrderConfirmation({ commande, prenom }: { commande: Commande; prenom: string }) {
  const reduit = useReducedMotion();
  return (
    <div className="mx-auto max-w-2xl space-y-8 text-center">
      <div className="mx-auto grid size-24 place-items-center rounded-full bg-success-soft">
        <svg viewBox="0 0 52 52" className="size-14 text-success" aria-hidden>
          <motion.circle cx="26" cy="26" r="23" fill="none" stroke="currentColor" strokeWidth="3" initial={reduit ? false : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }} />
          <motion.path d="M15 27 l7 7 l15 -16" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" initial={reduit ? false : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.3, delay: 0.4, ease: [0.22, 1, 0.36, 1] }} />
        </svg>
      </div>
      <div className="space-y-3">
        <h1 className="font-display text-4xl font-semibold md:text-5xl">Merci {prenom} !</h1>
        <p className="text-[17px] text-muted-foreground">Votre commande est confirmée. Chaque vendeur a été prévenu et prépare votre colis.</p>
        <p className="inline-flex items-center gap-2 rounded-full border bg-card px-4 py-2 font-mono text-sm font-semibold">Commande {commande.numero}</p>
      </div>
      <ul className="space-y-3 text-start">
        {commande.sousCommandes.map((s, i) => (
          <li key={s.id} className="flex items-center gap-4 rounded-2xl border bg-card p-4">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-soft text-accent-foreground">
              <Package className="size-5" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold">
                Colis {i + 1} · {s.fournisseurNom}
              </p>
              <p className="text-[13px] text-muted-foreground">
                <span className="font-mono">{s.numero}</span> · {s.lignes.length} article{s.lignes.length > 1 ? "s" : ""} · {formatPrix(s.sousTotal + s.fraisLivraison)}
              </p>
            </div>
            <StatusBadge status={STATUT_SOUS_COMMANDE.EN_ATTENTE} />
          </li>
        ))}
      </ul>
      <div className="flex flex-col justify-center gap-3 sm:flex-row">
        <Button asChild variant="brand" size="lg">
          <Link href={`/compte/commandes/${commande.numero}`}>Suivre ma commande</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/catalogue">Continuer mes achats</Link>
        </Button>
      </div>
    </div>
  );
}
