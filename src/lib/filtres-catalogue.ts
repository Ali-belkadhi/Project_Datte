import type { FiltresCatalogue, Produit } from "@/types/domain";

/** Prix de référence d'un produit (au kg pour une datte, à l'unité pour un dérivé). */
export const prixReference = (p: Produit) => (p.typeProduit === "DATTE" ? p.prixParKg : p.prixUnitaire);

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

/**
 * Filtrage et tri EN MÉMOIRE — partagé par le repository mock (serveur) et le catalogue (client, via l'URL).
 * Côté Prisma, ces critères deviendront une clause `where` + `orderBy`.
 * `vendeurVerifie` est appliqué par le service (donnée du module A).
 */
export function applyFiltres(produits: Produit[], f: FiltresCatalogue = {}): Produit[] {
  let r = produits.filter((p) => p.statut === "PUBLIE" || f.fournisseurId !== undefined);
  if (f.fournisseurId) r = r.filter((p) => p.fournisseurId === f.fournisseurId);
  if (f.q) {
    const q = norm(f.q);
    r = r.filter((p) => norm(`${p.nom} ${p.description} ${p.variete ?? ""}`).includes(q));
  }
  if (f.type) r = r.filter((p) => p.typeProduit === f.type);
  if (f.varietes?.length) r = r.filter((p) => p.variete && f.varietes!.includes(p.variete));
  if (f.prixMin !== undefined) r = r.filter((p) => prixReference(p) >= f.prixMin!);
  if (f.prixMax !== undefined) r = r.filter((p) => prixReference(p) <= f.prixMax!);
  if (f.regions?.length) r = r.filter((p) => f.regions!.includes(p.regionOrigine));
  if (f.presentations?.length)
    r = r.filter((p) => p.typeProduit === "DATTE" && f.presentations!.includes(p.presentation));
  if (f.maturites?.length) r = r.filter((p) => p.typeProduit === "DATTE" && f.maturites!.includes(p.maturite));
  if (f.categories?.length)
    r = r.filter((p) => p.typeProduit === "DATTE" && f.categories!.includes(p.categorieQualite));
  if (f.bio) r = r.filter((p) => p.bio);
  if (f.avec3D) r = r.filter((p) => p.modele3D !== null);

  switch (f.tri) {
    case "prix-asc":
      return [...r].sort((a, b) => prixReference(a) - prixReference(b));
    case "prix-desc":
      return [...r].sort((a, b) => prixReference(b) - prixReference(a));
    case "nouveautes":
      return [...r].sort((a, b) => b.creeLe.localeCompare(a.creeLe));
    case "notes":
      return [...r].sort((a, b) => b.noteMoyenne - a.noteMoyenne);
    default:
      return [...r].sort((a, b) => b.nombreVentes * b.noteMoyenne - a.nombreVentes * a.noteMoyenne);
  }
}
