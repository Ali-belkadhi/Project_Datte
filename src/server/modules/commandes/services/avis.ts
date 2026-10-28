// MODULE C — Commandes (Karim Ouertatani)
import "server-only";
import type { Avis, RepartitionNotes } from "@/types/domain";
import { getUtilisateurCourant } from "@/server/contracts/comptes";
import { avisRepository } from "../repositories";

export function repartition(avis: Avis[]): RepartitionNotes {
  const parNote: RepartitionNotes["parNote"] = [0, 0, 0, 0, 0];
  for (const a of avis) parNote[a.note - 1]++;
  const total = avis.length;
  const moyenne = total ? avis.reduce((s, a) => s + a.note, 0) / total : 0;
  return { moyenne, total, parNote };
}

export async function avisProduit(produitId: string) {
  const avis = await avisRepository.parProduit(produitId);
  return { avis, repartition: repartition(avis) };
}

export async function avisFournisseur(fournisseurId: string) {
  const avis = await avisRepository.parFournisseur(fournisseurId);
  return { avis, repartition: repartition(avis) };
}

export async function mesAvisRecus() {
  const u = await getUtilisateurCourant();
  return avisFournisseur(u.fournisseurId ?? "");
}
