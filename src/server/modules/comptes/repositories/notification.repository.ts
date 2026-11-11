import "server-only";
import type { Notification } from "@/types/domain";
import type { Role } from "@/types/enums";

export interface NotificationRepository {
  pourUtilisateur(utilisateurId: string, role: Role): Promise<Notification[]>;
}
