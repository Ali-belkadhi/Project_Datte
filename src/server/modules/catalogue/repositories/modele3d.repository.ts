import "server-only";
import type { Modele3DVendeur, MouvementCredit3D, PackCredits3D, SoldeCredits3D } from "@/types/domain";

export interface Modele3DRepository {
  parFournisseur(fournisseurId: string): Promise<Modele3DVendeur[]>;
  parId(id: string): Promise<Modele3DVendeur | null>;
  parTaskId(taskId: string): Promise<Modele3DVendeur | null>;
  parProduitId(produitId: string): Promise<Modele3DVendeur | null>;
  creer(data: Partial<Modele3DVendeur> & { produitId: string; produitNom: string; fournisseurId?: string; taskId?: string; glbUrl?: string; usdzUrl?: string }): Promise<Modele3DVendeur>;
  maj(id: string, data: Partial<Modele3DVendeur> & { glbUrl?: string; usdzUrl?: string; taskId?: string }): Promise<Modele3DVendeur | null>;
}

export interface CreditsRepository {
  packs(): Promise<PackCredits3D[]>;
  solde(fournisseurId: string): Promise<SoldeCredits3D>;
  mouvements(fournisseurId: string): Promise<MouvementCredit3D[]>;
}

export interface FavoriRepository {
  produitIds(clientId: string): Promise<string[]>;
  fournisseurIds(clientId: string): Promise<string[]>;
  basculer(clientId: string, produitId: string): Promise<boolean>;
}
