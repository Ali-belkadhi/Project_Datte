import "server-only";
import { VARIETES } from "@/mocks/varietes";
import { mockDelay } from "@/server/core/mock-delay";
import type { Variete } from "@/types/domain";
import type { VarieteRepository } from "./variete.repository";

export const varieteRepositoryMock: VarieteRepository = {
  async lister() {
    await mockDelay();
    return VARIETES;
  },
  async parSlug(slug) {
    return VARIETES.find((v) => v.slug === slug) ?? null;
  },
  async creer(data: Omit<Partial<Variete>, "slug"> & { slug: string; nom: string }) {
    const v = { ...VARIETES[0], ...data, slug: data.slug as never };
    return v;
  },
  async maj(slug, data) {
    const v = VARIETES.find((item) => item.slug === slug);
    return v ? { ...v, ...data } : null;
  },
  async supprimer() {
    return true;
  },
};
