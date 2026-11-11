"use client";
import { useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/shared/empty-state";
import { FilterChips } from "@/components/shared/filter-chips";
import { StatusBadge } from "@/components/shared/status-badge";
import { NoOrders } from "@/components/illustrations/empty-illustrations";
import { STATUT_SOUS_COMMANDE } from "@/lib/constants";
import { formatDateHeure, formatPoids, formatPrix } from "@/lib/format";
import type { SousCommande } from "@/types/domain";
import { OrderActions } from "./order-actions";

const ONGLETS = ["TOUTES", "EN_ATTENTE", "ACCEPTEE", "EN_PREPARATION", "EXPEDIEE", "LIVREE", "REFUSEE"] as const;

const resume = (s: SousCommande) =>
  s.lignes.map((l) => `${l.nomProduit} · ${l.quantiteGrammes ? formatPoids(l.quantiteGrammes) : `×${l.quantiteUnites}`}`).join(", ");

/** Commandes reçues : onglets par statut avec compteur, tableau (desktop) / cartes (mobile). */
export function IncomingOrdersTable({ sousCommandes, avecOnglets = true }: { sousCommandes: SousCommande[]; avecOnglets?: boolean }) {
  const [onglet, setOnglet] = useState<string>("TOUTES");
  const visibles = sousCommandes.filter((s) => onglet === "TOUTES" || s.statut === onglet);
  return (
    <div className="space-y-4">
      {avecOnglets && (
        <FilterChips
          ariaLabel="Statut"
          value={onglet}
          onChange={setOnglet}
          chips={ONGLETS.map((o) => ({
            value: o,
            label: o === "TOUTES" ? "Toutes" : STATUT_SOUS_COMMANDE[o].label,
            count: o === "TOUTES" ? sousCommandes.length : sousCommandes.filter((s) => s.statut === o).length,
          }))}
        />
      )}
      {visibles.length === 0 ? (
        <EmptyState illustration={<NoOrders />} titre="Aucune commande dans cet onglet" texte="Les nouvelles commandes apparaissent ici dès leur paiement." />
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-2xl border bg-card md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="ps-4">Commande</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Articles</TableHead>
                  <TableHead className="text-end">Montant</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="pe-4 text-end">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibles.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="ps-4">
                      <Link href={`/vendeur/commandes/${s.numero}`} className="font-mono text-[13px] font-semibold hover:underline">
                        {s.numero}
                      </Link>
                      <p className="text-[12px] text-muted-foreground">{formatDateHeure(s.creeLe)}</p>
                    </TableCell>
                    <TableCell>
                      {s.client.prenom}
                      <p className="text-[12px] text-muted-foreground">{s.client.ville}</p>
                    </TableCell>
                    <TableCell className="max-w-56 truncate text-[13px]">{resume(s)}</TableCell>
                    <TableCell className="text-end font-semibold tabular-nums">{formatPrix(s.sousTotal)}</TableCell>
                    <TableCell>
                      <StatusBadge status={STATUT_SOUS_COMMANDE[s.statut]} />
                    </TableCell>
                    <TableCell className="pe-4">
                      <div className="flex justify-end">
                        <OrderActions numero={s.numero} statut={s.statut} compact />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <ul className="space-y-3 md:hidden">
            {visibles.map((s) => (
              <li key={s.id} className="space-y-3 rounded-2xl border bg-card p-4">
                <Link href={`/vendeur/commandes/${s.numero}`} className="flex items-start justify-between gap-2">
                  <span>
                    <span className="block font-mono text-[13px] font-semibold">{s.numero}</span>
                    <span className="block text-[13px] text-muted-foreground">
                      {s.client.prenom}, {s.client.ville} · {formatDateHeure(s.creeLe)}
                    </span>
                  </span>
                  <ChevronRight className="size-5 text-muted-foreground rtl:rotate-180" aria-hidden />
                </Link>
                <p className="text-[13px]">{resume(s)}</p>
                <div className="flex items-center justify-between">
                  <StatusBadge status={STATUT_SOUS_COMMANDE[s.statut]} />
                  <span className="font-display text-lg font-semibold tabular-nums">{formatPrix(s.sousTotal)}</span>
                </div>
                <OrderActions numero={s.numero} statut={s.statut} compact />
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
