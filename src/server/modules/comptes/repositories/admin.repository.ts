import "server-only";
import type { ParametresPlateforme, Signalement } from "@/types/domain";

export interface AdminRepository {
  signalements(): Promise<Signalement[]>;
  parametres(): Promise<ParametresPlateforme>;
}
