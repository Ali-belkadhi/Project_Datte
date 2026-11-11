// CONTRAT — fourni par le MODULE A (Comptes), utilisé par B et C.
// API stable : les modules B/C ne dépendent que de ces signatures.
import "server-only";
import type { Fournisseur, ParametresPlateforme, Utilisateur } from "@/types/domain";
import type { TypeNotification } from "@/types/enums";
import {
  estFournisseurVerifie as _estVerifie,
  getFournisseur as _getFournisseur,
  getUtilisateurCourant as _getUtilisateur,
  listFournisseurs as _listFournisseurs,
  notifier as _notifier,
} from "@/server/modules/comptes/services";
import { fournisseurRepository as _fournisseursLegacy } from "@/server/modules/comptes/repositories";
import { getParametresPlateforme as _getParametres } from "@/server/modules/comptes/services/admin";
import { connectMongoose } from "@/server/db/mongoose";
import { JournalAudit } from "@/server/models";
import mongoose from "mongoose";

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

/** Paramètres globaux (taux de commission en %, frais de livraison…) — utilisé par C. */
export const getParametresPlateforme = (): Promise<ParametresPlateforme> => _getParametres();

/**
 * Journal d'audit (classe JournalAudit du module A), utilisé par C pour tracer l'usage de l'IA
 * (tokens, durée) et les actions sensibles. Ne lève jamais : un échec de journalisation n'interrompt rien.
 */
export async function journaliser(e: { utilisateurId?: string | null; action: string; entite: string; entiteId: string; details?: Record<string, unknown>; ip?: string }) {
  try {
    await connectMongoose();
    await JournalAudit.create({ ...e, utilisateurId: e.utilisateurId && mongoose.isValidObjectId(e.utilisateurId) ? e.utilisateurId : undefined });
  } catch (err) {
    console.error("[journal d'audit]", err);
  }
}

export const notifier = (utilisateurId: string, type: TypeNotification, donnees: Record<string, unknown> = {}) =>
  _notifier(utilisateurId, type, donnees);
