import "server-only";
import type { Variete, VarieteSlug } from "@/types/domain";

export interface VarieteRepository {
  lister(): Promise<Variete[]>;
  parSlug(slug: VarieteSlug | string): Promise<Variete | null>;
}
