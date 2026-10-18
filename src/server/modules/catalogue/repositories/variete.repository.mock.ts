import "server-only";
import { VARIETES } from "@/mocks/varietes";
import { mockDelay } from "@/server/core/mock-delay";
import type { VarieteRepository } from "./variete.repository";

export const varieteRepositoryMock: VarieteRepository = {
  async lister() {
    await mockDelay();
    return VARIETES;
  },
  async parSlug(slug) {
    return VARIETES.find((v) => v.slug === slug) ?? null;
  },
};
