"use client";
import { useCallback, useMemo, useState } from "react";
import type { Produit, VarieteSlug } from "@/types/domain";
import type { CategorieQualite, Maturite, Presentation, TypeDerive } from "@/types/enums";

export type ProduitBrouillon = {
  typeProduit: "DATTE" | "DERIVE";
  nom: string;
  description: string;
  variete?: VarieteSlug;
  categorieQualite: CategorieQualite;
  presentation: Presentation;
  maturite: Maturite;
  anneeRecolte: number;
  bio: boolean;
  prixDT: string; // saisi en DT (« 18,500 »), converti en millimes
  stockQte: string; // kg (datte) ou unités (dérivé)
  optionsPoids: number[];
  typeDerive: TypeDerive;
  contenance: string;
  uniteContenance: "ML" | "G";
  ingredients: string;
  statut: "BROUILLON" | "PUBLIE";
  photos: number; // nombre de photos (visuel)
};

export const CHAMPS_IA = ["nom", "variete", "categorieQualite", "presentation", "maturite", "description"] as const;
export type ChampIA = (typeof CHAMPS_IA)[number];

const DT = (s: string) => Math.round(Number(s.replace(/\s/g, "").replace(",", ".")) * 1000) || 0;
const versDT = (m: number) => (m / 1000).toLocaleString("fr-FR", { minimumFractionDigits: 3 });

export function depuisProduit(p?: Produit | null): ProduitBrouillon {
  const base: ProduitBrouillon = {
    typeProduit: "DATTE",
    nom: "",
    description: "",
    categorieQualite: "EXTRA",
    presentation: "VRAC",
    maturite: "TAMR",
    anneeRecolte: 2026,
    bio: false,
    prixDT: "",
    stockQte: "",
    optionsPoids: [500, 1000, 2000],
    typeDerive: "CONFITURE",
    contenance: "350",
    uniteContenance: "G",
    ingredients: "",
    statut: "BROUILLON",
    photos: 0,
  };
  if (!p) return base;
  if (p.typeProduit === "DATTE")
    return {
      ...base,
      typeProduit: "DATTE",
      nom: p.nom,
      description: p.description,
      variete: p.variete,
      categorieQualite: p.categorieQualite,
      presentation: p.presentation,
      maturite: p.maturite,
      anneeRecolte: p.anneeRecolte,
      bio: p.bio,
      prixDT: versDT(p.prixParKg),
      stockQte: String(p.stockGrammes / 1000).replace(".", ","),
      optionsPoids: p.optionsPoids,
      statut: p.statut === "PUBLIE" ? "PUBLIE" : "BROUILLON",
      photos: 3,
    };
  return {
    ...base,
    typeProduit: "DERIVE",
    nom: p.nom,
    description: p.description,
    variete: p.variete,
    bio: p.bio,
    prixDT: versDT(p.prixUnitaire),
    stockQte: String(p.stockUnites),
    typeDerive: p.typeDerive,
    contenance: String(p.contenance),
    uniteContenance: p.uniteContenance,
    ingredients: p.ingredients,
    statut: p.statut === "PUBLIE" ? "PUBLIE" : "BROUILLON",
    photos: 3,
  };
}

/** Convertit le brouillon en entrée de produitSchema (millimes, grammes). */
export function versEntree(b: ProduitBrouillon) {
  const commun = { nom: b.nom, description: b.description, bio: b.bio, statut: b.statut, regionOrigine: "TOZEUR" as const };
  if (b.typeProduit === "DATTE")
    return {
      ...commun,
      typeProduit: "DATTE" as const,
      variete: b.variete,
      categorieQualite: b.categorieQualite,
      presentation: b.presentation,
      maturite: b.maturite,
      anneeRecolte: b.anneeRecolte,
      prixParKg: DT(b.prixDT),
      stockGrammes: Math.round(Number(b.stockQte.replace(",", ".")) * 1000) || 0,
      optionsPoids: b.optionsPoids,
    };
  return {
    ...commun,
    typeProduit: "DERIVE" as const,
    typeDerive: b.typeDerive,
    variete: b.variete,
    contenance: Number(b.contenance) || 0,
    uniteContenance: b.uniteContenance,
    prixUnitaire: DT(b.prixDT),
    stockUnites: Number(b.stockQte) || 0,
    ingredients: b.ingredients,
  };
}

/** État du formulaire produit + suivi des champs « Suggéré par l'IA ». */
export function useProductForm(initial?: Produit | null) {
  const [b, setB] = useState<ProduitBrouillon>(() => depuisProduit(initial));
  const [suggeres, setSuggeres] = useState<Set<ChampIA>>(new Set());

  /** Modification par le vendeur : retire le badge IA du champ. */
  const maj = useCallback(<K extends keyof ProduitBrouillon>(k: K, v: ProduitBrouillon[K]) => {
    setB((x) => ({ ...x, [k]: v }));
    setSuggeres((s) => {
      if (!s.has(k as ChampIA)) return s;
      const n = new Set(s);
      n.delete(k as ChampIA);
      return n;
    });
  }, []);

  /** Écriture par l'IA : pose le badge. */
  const suggerer = useCallback((k: ChampIA, v: string) => {
    setB((x) => ({ ...x, [k]: v }));
    setSuggeres((s) => new Set(s).add(k));
  }, []);

  const checklist = useMemo(
    () => [
      { ok: b.photos >= 1, label: "Au moins une photo" },
      { ok: b.nom.trim().length >= 3, label: "Un nom clair" },
      { ok: b.description.trim().length >= 30, label: "Une description de 30 caractères ou plus" },
      { ok: b.typeProduit === "DERIVE" || !!b.variete, label: "La variété" },
      { ok: DT(b.prixDT) > 0, label: b.typeProduit === "DATTE" ? "Un prix au kilo" : "Un prix unitaire" },
      { ok: Number(b.stockQte.replace(",", ".")) > 0, label: "Un stock disponible" },
    ],
    [b],
  );

  return { b, maj, suggerer, suggeres, checklist, entree: versEntree(b) };
}
