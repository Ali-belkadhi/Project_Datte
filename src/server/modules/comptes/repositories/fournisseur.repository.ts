import "server-only";
import type { AnalyseIA, DocumentFournisseur, DossierFournisseur, Fournisseur } from "@/types/domain";
import type { StatutVerification, TypeFournisseur, Gouvernorat } from "@/types/enums";

export type CandidatFournisseur = {
  id: string;
  nomBoutique: string;
  gerant: string;
  region: Gouvernorat;
  type: TypeFournisseur;
  soumisLe: string;
};

export interface FournisseurRepository {
  lister(filtre?: { statut?: StatutVerification }): Promise<Fournisseur[]>;
  parId(id: string): Promise<Fournisseur | null>;
  parSlug(slug: string): Promise<Fournisseur | null>;
  dossier(id: string): Promise<DossierFournisseur | null>;
  documents(id: string): Promise<DocumentFournisseur[]>;
  analyseIA(id: string): Promise<AnalyseIA | null>;
  candidats(): Promise<CandidatFournisseur[]>;
}
