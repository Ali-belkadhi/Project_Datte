import "server-only";
import type { Avis, Litige } from "@/types/domain";

export interface AvisRepository {
  parProduit(produitId: string): Promise<Avis[]>;
  parFournisseur(fournisseurId: string): Promise<Avis[]>;
}

export interface LitigeRepository {
  lister(): Promise<Litige[]>;
  parId(id: string): Promise<Litige | null>;
}
