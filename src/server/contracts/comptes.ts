// CONTRAT — fourni par le MODULE A (Comptes), utilisé par B et C.
// API stable : la signature ne change pas quand Prisma / Auth.js seront branchés.
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

export { requireRole } from "@/server/core/rbac";

export const getUtilisateurCourant = (): Promise<Utilisateur> => _getUtilisateur();

export const getFournisseur = (id: string): Promise<Fournisseur | null> => _getFournisseur(id);

/** Boutiques vérifiées (recherche, fiches variété). */
export const listFournisseursVerifies = (): Promise<Fournisseur[]> => _listFournisseurs("VERIFIE");

export const estFournisseurVerifie =(id: string): Promise<boolean> => _estVerifie(id);

export const notifier = (utilisateurId: string, type: TypeNotification, donnees: Record<string, unknown> = {}) =>
  _notifier(utilisateurId, type, donnees);
