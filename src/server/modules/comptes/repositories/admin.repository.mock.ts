import "server-only";
import { PARAMETRES, SIGNALEMENTS } from "@/mocks/admin";
import { mockDelay } from "@/server/core/mock-delay";
import type { AdminRepository } from "./admin.repository";

export const adminRepositoryMock: AdminRepository = {
  async signalements() {
    await mockDelay();
    return SIGNALEMENTS;
  },
  async parametres() {
    await mockDelay();
    return PARAMETRES;
  },
};
