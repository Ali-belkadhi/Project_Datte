import "server-only";
import { NOTIFICATIONS_CLIENT, NOTIFICATIONS_FOURNISSEUR } from "@/mocks/notifications";
import { mockDelay } from "@/server/core/mock-delay";
import type { NotificationRepository } from "./notification.repository";

export const notificationRepositoryMock: NotificationRepository = {
  async pourUtilisateur(_utilisateurId, role) {
    await mockDelay();
    return role === "FOURNISSEUR" ? NOTIFICATIONS_FOURNISSEUR : NOTIFICATIONS_CLIENT;
  },
};
