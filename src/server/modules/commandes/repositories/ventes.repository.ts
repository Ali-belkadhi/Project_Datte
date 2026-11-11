import "server-only";
import type { PointVentes, RepartitionVariete, ScenarioAssistantSource, TopProduit, Versement } from "@/types/domain";

export interface VentesRepository {
  serieQuotidienne(fournisseurId: string): Promise<PointVentes[]>;
  serieMensuelle(fournisseurId: string): Promise<PointVentes[]>;
  topProduits(fournisseurId: string): Promise<TopProduit[]>;
  repartitionVarietes(fournisseurId: string): Promise<RepartitionVariete[]>;
  versements(fournisseurId: string): Promise<Versement[]>;
  seriePlateforme(): Promise<PointVentes[]>;
}

export interface AssistantRepository {
  scenarios(): Promise<ScenarioAssistantSource[]>;
  suggestions(): Promise<string[]>;
  reponseGenerique(): Promise<string>;
}
