// CONTRAT — fourni par le MODULE A (Comptes), utilisé par B et C.
// API stable : les modules B/C ne dépendent que de ces signatures.
import "server-only";
import type { Fournisseur, Utilisateur } from "@/types/domain";
import type { TypeNotification } from "@/types/enums";
import {
  estFournisseurVerifie as _estVerifie,
  getFournisseur as _getFournisseur,
  getUtilisateurCourant as _getUtilisateur,
  listFournisseurs as _listFournisseurs,
  notifier as _notifier,
} from "@/server/modules/comptes/services";
import { fournisseurRepository as _fournisseursLegacy } from "@/server/modules/comptes/repositories";

export { requireRole } from "@/server/core/rbac";

export const getUtilisateurCourant = (): Promise<Utilisateur> => _getUtilisateur();

/**
 * Fournisseur par identifiant.
 * Les données Module A sont réelles ; le repli sur le référentiel du template
 * permet aux pages catalogue (Module B, non implémenté) de continuer à fonctionner.
 */
export const getFournisseur = async (id: string): Promise<Fournisseur | null> => {
  const reel = await _getFournisseur(id).catch(() => null);
  if (reel) return reel;
  return _fournisseursLegacy.parId(id);
};

/** Boutiques vérifiées (recherche, fiches variété) : réelles + référentiel du template. */
export const listFournisseursVerifies = async (): Promise<Fournisseur[]> => {
  const res = await _listFournisseurs({ statut: "VERIFIE" });
  const reels = res.items;
  const legacy = await _fournisseursLegacy.lister({ statut: "VERIFIE" });
  const ids = new Set(reels.map((f) => f.id));
  return [...reels, ...legacy.filter((f) => !ids.has(f.id))];
};

export const estFournisseurVerifie = (id: string): Promise<boolean> => _estVerifie(id);

export const notifier = (utilisateurId: string, type: TypeNotification, donnees: Record<string, unknown> = {}) =>
  _notifier(utilisateurId, type, donnees);
