// MODULE A — Comptes (Baha Ayadi)
import "server-only";
import { adminRepository, fournisseurRepository } from "../repositories";

export const listSignalements = () => adminRepository.signalements();
export const getParametresPlateforme = () => adminRepository.parametres();

/** File « À traiter » de l'admin : dossiers en attente + signalements ouverts. */
export async function getFileATraiter() {
  const [enAttente, candidats, signalements] = await Promise.all([
    fournisseurRepository.lister({ statut: "EN_ATTENTE" }),
    fournisseurRepository.candidats(),
    adminRepository.signalements(),
  ]);
  return {
    dossiers: [
      ...enAttente.map((f) => ({ id: f.id, nom: f.nomBoutique, gerant: f.gerant, region: f.region, soumisLe: "2026-10-15T16:20:00+01:00", lien: `/admin/fournisseurs/${f.id}` })),
      ...candidats.map((c) => ({ id: c.id, nom: c.nomBoutique, gerant: c.gerant, region: c.region, soumisLe: c.soumisLe, lien: `/admin/fournisseurs` })),
    ],
    signalements: signalements.filter((s) => s.statut === "OUVERT"),
  };
}
