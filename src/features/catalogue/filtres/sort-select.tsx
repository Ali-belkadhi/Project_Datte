"use client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { TriCatalogue } from "@/types/domain";

const OPTIONS: { v: TriCatalogue; l: string }[] = [
  { v: "pertinence", l: "Pertinence" },
  { v: "prix-asc", l: "Prix croissant" },
  { v: "prix-desc", l: "Prix décroissant" },
  { v: "nouveautes", l: "Nouveautés" },
  { v: "notes", l: "Mieux notés" },
];

export function SortSelect({ value, onChange }: { value?: TriCatalogue; onChange: (v?: string) => void }) {
  return (
    <Select value={value ?? "pertinence"} onValueChange={(v) => onChange(v === "pertinence" ? undefined : v)}>
      <SelectTrigger className="w-[180px]" aria-label="Trier par">
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="end">
        {OPTIONS.map((o) => (
          <SelectItem key={o.v} value={o.v}>
            {o.l}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
