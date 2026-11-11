import "server-only";
import type { Adresse, Utilisateur } from "@/types/domain";
import type { ZoneDemo } from "@/types/enums";

export interface UtilisateurRepository {
  /** Utilisateur de démo correspondant à une zone (session factice). */
  demoPourZone(zone: ZoneDemo): Promise<Utilisateur>;
  parId(id: string): Promise<Utilisateur | null>;
  adresses(utilisateurId: string): Promise<Adresse[]>;
}
