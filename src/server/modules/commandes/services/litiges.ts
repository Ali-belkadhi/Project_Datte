// MODULE C — Commandes (Karim Ouertatani)
import "server-only";
import { litigeRepository } from "../repositories";

export const listLitiges = () => litigeRepository.lister();
export const getLitige = (id: string) => litigeRepository.parId(id);

export async function compterLitigesOuverts() {
  const l = await litigeRepository.lister();
  return l.filter((x) => x.statut === "OUVERT" || x.statut === "EN_EXAMEN").length;
}
