// MODULE B — Catalogue (Ali Belkathi)
import "server-only";
import { getUtilisateurCourant } from "@/server/contracts/comptes";
import { modele3DRepository } from "../repositories";

export async function mesModeles3D() {
  const u = await getUtilisateurCourant();
  return modele3DRepository.parFournisseur(u.fournisseurId ?? "");
}

export const getModele3D = (id: string) => modele3DRepository.parId(id);

/** Coût d'une génération : 1 crédit pour une photo, 2 pour plusieurs (ParametresPlateforme). */
export const coutGeneration = (nombrePhotos: number) => (nombrePhotos > 1 ? 2 : 1);
