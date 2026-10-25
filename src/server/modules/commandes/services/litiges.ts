// MODULE C — Commandes (Karim Ouertatani) — litiges et remboursements (EF-53).
import "server-only";
import type { Litige } from "@/types/domain";
import type { MotifLitige } from "@/types/enums";
import { getUtilisateurCourant } from "@/server/contracts/comptes";
import { ForbiddenError, NotFoundError } from "@/server/core/errors";
import { db, prochainNumero, SANS_ID } from "../repositories/mongo";
import { rembourserColisParAdmin } from "./commandes";

const versLitige = ({ clientId: _c, montantRembourse: _m, adminId: _a, clotureLe: _l, ...l }: Litige & Record<string, unknown>): Litige => l;

export async function listLitiges() {
  return (await (await db.litiges()).find({}, SANS_ID).sort({ ouvertLe: -1 }).toArray()).map(versLitige);
}

export async function getLitige(id: string) {
  const l = await (await db.litiges()).findOne({ id }, SANS_ID);
  return l ? versLitige(l) : null;
}

export async function compterLitigesOuverts() {
  return (await db.litiges()).countDocuments({ statut: { $in: ["OUVERT", "EN_EXAMEN"] } });
}

/** Le client signale un problème sur un colis expédié ou livré (un seul litige ouvert par colis). */
export async function ouvrirLitige(d: { sousCommandeNumero: string; motif: MotifLitige; description: string }) {
  const u = await getUtilisateurCourant();
  const s = await (await db.sousCommandes()).findOne({ numero: d.sousCommandeNumero, clientId: u.id });
  if (!s) throw new NotFoundError(`colis ${d.sousCommandeNumero}`);
  if (!["EXPEDIEE", "LIVREE"].includes(s.statut)) throw new ForbiddenError("Un litige peut être ouvert une fois le colis expédié. Avant, vous pouvez annuler la commande.");
  const col = await db.litiges();
  if (await col.findOne({ sousCommandeNumero: s.numero, statut: { $in: ["OUVERT", "EN_EXAMEN"] } })) throw new ForbiddenError("Un litige est déjà en cours pour ce colis.");
  const numero = `LIT-${new Date().getFullYear()}-${String(await prochainNumero("litige", 100)).padStart(4, "0")}`;
  const now = new Date().toISOString();
  await col.insertOne({
    id: numero,
    numero,
    sousCommandeNumero: s.numero,
    client: `${u.prenom} ${u.nom.charAt(0)}.`,
    fournisseurNom: s.fournisseurNom,
    motif: d.motif,
    description: d.description,
    statut: "OUVERT",
    montant: Math.max(0, s.sousTotal + s.fraisLivraison - (s.remise ?? 0)),
    ouvertLe: now,
    echanges: [{ auteur: "client", nom: `${u.prenom} ${u.nom.charAt(0)}.`, contenu: d.description, date: now }],
    clientId: u.id,
  });
  return { numero };
}

/**
 * Décision de l'administrateur. RESOLU_CLIENT avec un montant : remboursement réel (Stripe) du colis,
 * plafonné au montant payé pour ce colis.
 */
export async function resoudreLitige(d: { litigeId: string; decision: "RESOLU_CLIENT" | "RESOLU_FOURNISSEUR" | "CLOS"; montantRembourse?: number; commentaire?: string }) {
  const u = await getUtilisateurCourant();
  const col = await db.litiges();
  const l = await col.findOne({ id: d.litigeId });
  if (!l) throw new NotFoundError(`litige ${d.litigeId}`);
  if (!["OUVERT", "EN_EXAMEN"].includes(l.statut)) throw new ForbiddenError("Ce litige est déjà clôturé.");
  let rembourse = 0;
  if (d.decision === "RESOLU_CLIENT" && d.montantRembourse) {
    const montant = Math.min(d.montantRembourse, l.montant);
    const avant = (await (await db.sousCommandes()).findOne({ numero: l.sousCommandeNumero }))?.montantRembourse ?? 0;
    rembourse = (await rembourserColisParAdmin(l.sousCommandeNumero, montant, u.id)) - avant;
  }
  const now = new Date().toISOString();
  await col.updateOne(
    { id: d.litigeId },
    {
      $set: { statut: d.decision, adminId: u.id, clotureLe: now, montantRembourse: rembourse },
      $push: { echanges: { auteur: "admin", nom: "Équipe DEGLA", contenu: d.commentaire || libelleDecision(d.decision, rembourse), date: now } },
    },
  );
  return { id: d.litigeId, statut: d.decision, rembourse };
}

function libelleDecision(decision: string, rembourse: number) {
  if (decision === "RESOLU_CLIENT") return rembourse ? `Litige résolu en faveur du client : ${(rembourse / 1000).toFixed(3).replace(".", ",")} DT remboursés.` : "Litige résolu en faveur du client.";
  if (decision === "RESOLU_FOURNISSEUR") return "Litige résolu en faveur du vendeur.";
  return "Litige clôturé.";
}
