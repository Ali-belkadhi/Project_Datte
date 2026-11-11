"use client";
import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { FiltresCatalogue, TriCatalogue } from "@/types/domain";

const LISTES = ["varietes", "regions", "presentations", "maturites", "categories"] as const;
const BOOLS = ["bio", "avec3D", "vendeurVerifie"] as const;
type Liste = (typeof LISTES)[number];
type Bool = (typeof BOOLS)[number];

/** Filtres du catalogue lus et écrits dans l'URL (?type=DATTE&varietes=alig,kenta&prixMax=30000…). */
export function useCatalogueFilters() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const filtres = useMemo<FiltresCatalogue>(() => {
    const f: FiltresCatalogue = {};
    const type = params.get("type");
    if (type === "DATTE" || type === "DERIVE") f.type = type;
    for (const k of LISTES) {
      const v = params.get(k);
      if (v) (f as Record<Liste, string[]>)[k] = v.split(",");
    }
    for (const k of BOOLS) if (params.get(k) === "1") f[k] = true;
    const min = params.get("prixMin");
    const max = params.get("prixMax");
    if (min) f.prixMin = Number(min);
    if (max) f.prixMax = Number(max);
    const q = params.get("q");
    if (q) f.q = q;
    const tri = params.get("tri") as TriCatalogue | null;
    if (tri) f.tri = tri;
    return f;
  }, [params]);

  const ecrire = useCallback(
    (maj: (p: URLSearchParams) => void) => {
      const p = new URLSearchParams(params.toString());
      maj(p);
      const qs = p.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [params, pathname, router],
  );

  const basculerListe = (k: Liste, valeur: string) =>
    ecrire((p) => {
      const actuel = new Set((p.get(k) ?? "").split(",").filter(Boolean));
      if (actuel.has(valeur)) actuel.delete(valeur);
      else actuel.add(valeur);
      if (actuel.size) p.set(k, [...actuel].join(","));
      else p.delete(k);
    });

  const basculerBool = (k: Bool) => ecrire((p) => (p.get(k) === "1" ? p.delete(k) : p.set(k, "1")));
  const definir = (k: "type" | "tri" | "prixMin" | "prixMax" | "q", v?: string) => ecrire((p) => (v ? p.set(k, v) : p.delete(k)));
  const definirPrix = (min?: number, max?: number) =>
    ecrire((p) => {
      if (min) p.set("prixMin", String(min));
      else p.delete("prixMin");
      if (max) p.set("prixMax", String(max));
      else p.delete("prixMax");
    });
  const reinitialiser = () => ecrire((p) => [...p.keys()].forEach((k) => k !== "q" && p.delete(k)));

  const nombreActifs =
    (filtres.type ? 1 : 0) +
    LISTES.reduce((a, k) => a + (filtres[k]?.length ?? 0), 0) +
    BOOLS.filter((k) => filtres[k]).length +
    (filtres.prixMin || filtres.prixMax ? 1 : 0);

  return { filtres, basculerListe, basculerBool, definir, definirPrix, reinitialiser, nombreActifs };
}

export type CatalogueFiltersApi = ReturnType<typeof useCatalogueFilters>;
