import "server-only";
import type { Commande, SousCommande } from "@/types/domain";

export interface CommandeRepository {
  pourClient(clientId: string): Promise<Commande[]>;
  parNumero(numero: string): Promise<Commande | null>;
  sousCommandesFournisseur(fournisseurId: string): Promise<SousCommande[]>;
  sousCommandeParNumero(numero: string): Promise<SousCommande | null>;
}

export interface PanierRepository {
  /** Lignes brutes du panier (produit + quantité). */
  lignes(clientId: string): Promise<{ produitId: string; quantiteGrammes?: number; quantiteUnites?: number }[]>;
}
