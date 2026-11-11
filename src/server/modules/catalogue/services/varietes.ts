// MODULE B — Catalogue (Ali Belkathi)
import "server-only";
import { listFournisseursVerifies } from "@/server/contracts/comptes";
import { varieteRepository } from "../repositories";

export const listVarietes = () => varieteRepository.lister();
export const getVariete = (slug: string) => varieteRepository.parSlug(slug);

/** Boutiques vérifiées qui proposent cette variété. */
export async function vendeursDeVariete(slug: string) {
  const vendeurs = await listFournisseursVerifies();
  return vendeurs.filter((f) => f.varietes.includes(slug as never));
}
