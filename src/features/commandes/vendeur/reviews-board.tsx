"use client";
import { useState } from "react";
import { EmptyState } from "@/components/shared/empty-state";
import { FilterChips } from "@/components/shared/filter-chips";
import { NoMessages } from "@/components/illustrations/empty-illustrations";
import type { Avis } from "@/types/domain";
import { ReviewReplyCard } from "./review-reply-card";

/** Liste filtrable des avis reçus : tous, non répondus, notes ≤ 3. */
export function ReviewsBoard({ avis }: { avis: Avis[] }) {
  const [filtre, setFiltre] = useState("tous");
  const visibles = avis.filter((a) => (filtre === "non-repondus" ? !a.reponseFournisseur : filtre === "faibles" ? a.note <= 3 : true));
  return (
    <div className="space-y-4">
      <FilterChips
        value={filtre}
        onChange={setFiltre}
        ariaLabel="Filtrer les avis"
        chips={[
          { value: "tous", label: "Tous", count: avis.length },
          { value: "non-repondus", label: "Non répondus", count: avis.filter((a) => !a.reponseFournisseur).length },
          { value: "faibles", label: "Notes ≤ 3", count: avis.filter((a) => a.note <= 3).length },
        ]}
      />
      {visibles.length ? (
        <ul className="space-y-3">
          {visibles.map((a) => (
            <ReviewReplyCard key={a.id} avis={a} />
          ))}
        </ul>
      ) : (
        <EmptyState illustration={<NoMessages />} titre="Rien à traiter" texte="Tous les avis de ce filtre ont reçu une réponse." />
      )}
    </div>
  );
}
