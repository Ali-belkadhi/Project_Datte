"use client";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { FilterChips } from "@/components/shared/filter-chips";
import { NoOrders } from "@/components/illustrations/empty-illustrations";
import type { Commande } from "@/types/domain";
import type { StatutCommande } from "@/types/enums";
import { OrderCard } from "./order-card";

const FILTRES: { value: "TOUTES" | StatutCommande; label: string }[] = [
  { value: "TOUTES", label: "Toutes" },
  { value: "PAYEE", label: "En cours" },
  { value: "EN_ATTENTE_PAIEMENT", label: "Paiement en attente" },
  { value: "LIVREE", label: "Livrées" },
  { value: "ANNULEE", label: "Annulées" },
];

/** Liste de commandes filtrée par statut (chips). */
export function OrdersList({ commandes }: { commandes: Commande[] }) {
  const [filtre, setFiltre] = useState<string>("TOUTES");
  const visibles = commandes.filter((c) => filtre === "TOUTES" || c.statut === filtre || (filtre === "LIVREE" && c.statut === "PARTIELLEMENT_LIVREE"));
  return (
    <div className="space-y-4">
      <FilterChips
        ariaLabel="Filtrer par statut"
        value={filtre}
        onChange={setFiltre}
        chips={FILTRES.map((f) => ({ ...f, count: f.value === "TOUTES" ? commandes.length : commandes.filter((c) => c.statut === f.value || (f.value === "LIVREE" && c.statut === "PARTIELLEMENT_LIVREE")).length }))}
      />
      {visibles.length === 0 ? (
        <EmptyState
          illustration={<NoOrders />}
          titre="Aucune commande ici"
          texte="Vos prochaines commandes apparaîtront dans cette liste."
          action={
            <Button asChild variant="brand">
              <Link href="/catalogue">Découvrir le catalogue</Link>
            </Button>
          }
        />
      ) : (
        <ul className="space-y-3">
          {visibles.map((c) => (
            <li key={c.id}>
              <OrderCard commande={c} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
