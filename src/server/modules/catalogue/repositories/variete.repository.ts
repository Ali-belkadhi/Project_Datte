import "server-only";
import type { Variete, VarieteSlug } from "@/types/domain";

export interface VarieteRepository {
  lister(): Promise<Variete[]>;
  parSlug(slug: VarieteSlug | string): Promise<Variete | null>;
  creer(data: Omit<Partial<Variete>, "slug"> & { slug: string; nom: string }): Promise<Variete>;
  maj(slug: string, data: Partial<Variete>): Promise<Variete | null>;
  supprimer(slug: string): Promise<boolean>;
}
