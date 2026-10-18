import "server-only";
import type { Modele3DVendeur, MouvementCredit3D, PackCredits3D, SoldeCredits3D } from "@/types/domain";

export interface Modele3DRepository {
  parFournisseur(fournisseurId: string): Promise<Modele3DVendeur[]>;
  parId(id: string): Promise<Modele3DVendeur | null>;
}

export interface CreditsRepository {
  packs(): Promise<PackCredits3D[]>;
  solde(fournisseurId: string): Promise<SoldeCredits3D>;
  mouvements(fournisseurId: string): Promise<MouvementCredit3D[]>;
}

export interface FavoriRepository {
  produitIds(clientId: string): Promise<string[]>;
  fournisseurIds(clientId: string): Promise<string[]>;
}
