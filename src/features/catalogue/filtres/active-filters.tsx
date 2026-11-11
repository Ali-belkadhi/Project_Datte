"use client";
import { X } from "lucide-react";
import { VARIETY_PRESETS } from "@/components/three/presets";
import { CATEGORIE_QUALITE, GOUVERNORAT_LABEL, MATURITE, PRESENTATION } from "@/lib/constants";
import { formatPrix } from "@/lib/format";
import type { CatalogueFiltersApi } from "./use-catalogue-filters";

/** Chips des filtres actifs (supprimables). */
export function ActiveFilters({ api }: { api: CatalogueFiltersApi }) {
  const { filtres: f, basculerListe, basculerBool, definir, definirPrix, reinitialiser, nombreActifs } = api;
  const chips: { label: string; retirer: () => void }[] = [];
  if (f.type) chips.push({ label: f.type === "DATTE" ? "Dattes" : "Dérivés", retirer: () => definir("type") });
  f.varietes?.forEach((v) => chips.push({ label: VARIETY_PRESETS[v].nom, retirer: () => basculerListe("varietes", v) }));
  f.regions?.forEach((r) => chips.push({ label: GOUVERNORAT_LABEL[r], retirer: () => basculerListe("regions", r) }));
  f.presentations?.forEach((p) => chips.push({ label: PRESENTATION[p], retirer: () => basculerListe("presentations", p) }));
  f.maturites?.forEach((m) => chips.push({ label: MATURITE[m].label, retirer: () => basculerListe("maturites", m) }));
  f.categories?.forEach((c) => chips.push({ label: CATEGORIE_QUALITE[c], retirer: () => basculerListe("categories", c) }));
  if (f.prixMin || f.prixMax)
    chips.push({ label: `${f.prixMin ? formatPrix(f.prixMin) : "0 DT"} – ${f.prixMax ? formatPrix(f.prixMax) : "50 DT et +"}`, retirer: () => definirPrix() });
  if (f.bio) chips.push({ label: "Bio", retirer: () => basculerBool("bio") });
  if (f.avec3D) chips.push({ label: "Disponible en 3D", retirer: () => basculerBool("avec3D") });
  if (f.vendeurVerifie) chips.push({ label: "Vendeur vérifié", retirer: () => basculerBool("vendeurVerifie") });
  if (!chips.length) return null;
  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((c) => (
        <button
          key={c.label}
          type="button"
          onClick={c.retirer}
          className="inline-flex h-9 items-center gap-1.5 rounded-full bg-primary ps-3.5 pe-2.5 text-[13px] font-semibold text-primary-foreground"
          aria-label={`Retirer le filtre ${c.label}`}
        >
          {c.label}
          <X className="size-3.5" aria-hidden />
        </button>
      ))}
      {nombreActifs > 1 && (
        <button type="button" onClick={reinitialiser} className="h-9 px-2 text-[13px] font-semibold text-date underline-offset-4 hover:underline">
          Tout effacer
        </button>
      )}
    </div>
  );
}
