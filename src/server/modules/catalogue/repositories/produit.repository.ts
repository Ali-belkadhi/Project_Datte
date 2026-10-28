import "server-only";
import type { FiltresCatalogue, Produit } from "@/types/domain";

export interface ProduitRepository {
  lister(filtres: FiltresCatalogue): Promise<Produit[]>;
  parSlug(slug: string): Promise<Produit | null>;
  parId(id: string): Promise<Produit | null>;
  parIds(ids: string[]): Promise<Produit[]>;
  parFournisseur(fournisseurId: string): Promise<Produit[]>;
}
