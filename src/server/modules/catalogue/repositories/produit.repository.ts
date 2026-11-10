import "server-only";
import type { ProduitInput } from "@/lib/validation/catalogue";
import type { FiltresCatalogue, Produit } from "@/types/domain";

export interface ProduitRepository {
  lister(filtres: FiltresCatalogue): Promise<Produit[]>;
  parSlug(slug: string): Promise<Produit | null>;
  parId(id: string): Promise<Produit | null>;
  parIds(ids: string[]): Promise<Produit[]>;
  parFournisseur(fournisseurId: string): Promise<Produit[]>;
  /** Écritures : le `fournisseurId` vient toujours de la session serveur, jamais du navigateur. */
  creer(data: ProduitInput, fournisseurId: string): Promise<Produit>;
  maj(id: string, data: ProduitInput, fournisseurId: string): Promise<Produit | null>;
  supprimer(id: string, fournisseurId: string): Promise<boolean>;
}
