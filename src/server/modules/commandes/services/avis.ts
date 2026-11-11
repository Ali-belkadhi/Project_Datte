// MODULE C — Commandes (Karim Ouertatani) — AvisService (EF-40, EF-41).
import "server-only";
import type { Avis, RepartitionNotes } from "@/types/domain";
import { majNoteProduit } from "@/server/contracts/catalogue";
import { getUtilisateurCourant } from "@/server/contracts/comptes";
import { ForbiddenError, NotFoundError } from "@/server/core/errors";
import { db } from "../repositories/mongo";

export function repartition(avis: Avis[]): RepartitionNotes {
  const parNote: RepartitionNotes["parNote"] = [0, 0, 0, 0, 0];
  for (const a of avis) parNote[a.note - 1]++;
  const total = avis.length;
  const moyenne = total ? avis.reduce((s, a) => s + a.note, 0) / total : 0;
  return { moyenne, total, parNote };
}

const versAvis = ({ clientId: _c, ligneCommandeId: _l, statut: _s, ...a }: Avis & Record<string, unknown>): Avis => a;

async function lister(filtre: Record<string, unknown>) {
  const docs = await (await db.avis()).find({ ...filtre, statut: "VISIBLE" }, { projection: { _id: 0 } }).sort({ creeLe: -1 }).toArray();
  return docs.map(versAvis);
}

export async function avisProduit(produitId: string) {
  const avis = await lister({ produitId });
  return { avis, repartition: repartition(avis) };
}

export async function avisFournisseur(fournisseurId: string) {
  const avis = await lister({ fournisseurId });
  return { avis, repartition: repartition(avis) };
}

export async function mesAvisRecus() {
  const u = await getUtilisateurCourant();
  return avisFournisseur(u.fournisseurId ?? "");
}

/** Avis sur une ligne d'un colis LIVRÉ du client connecté, un seul par achat. */
export async function laisserAvis(d: { ligneCommandeId: string; note: number; commentaire: string; photos?: string[] }) {
  const u = await getUtilisateurCourant();
  const s = await (await db.sousCommandes()).findOne({ clientId: u.id, "lignes.id": d.ligneCommandeId });
  if (!s) throw new NotFoundError("achat introuvable");
  if (s.statut !== "LIVREE") throw new ForbiddenError("Vous pourrez donner votre avis une fois le colis livré.");
  const ligne = s.lignes.find((l) => l.id === d.ligneCommandeId)!;
  const col = await db.avis();
  if (await col.findOne({ ligneCommandeId: d.ligneCommandeId })) throw new ForbiddenError("Vous avez déjà donné votre avis sur cet achat.");
  const id = `av-${d.ligneCommandeId}`;
  await col.insertOne({
    id,
    produitId: ligne.produitId,
    produitNom: ligne.nomProduit,
    fournisseurId: s.fournisseurId,
    auteur: `${u.prenom} ${u.nom.charAt(0)}.`,
    note: d.note,
    commentaire: d.commentaire,
    creeLe: new Date().toISOString(),
    achatVerifie: true,
    clientId: u.id,
    ligneCommandeId: d.ligneCommandeId,
    statut: "VISIBLE",
    photos: (d.photos ?? []).slice(0, 3).map((url, i) => ({ id: `${id}-photo-${i + 1}`, url })),
  });
  await majNoteProduit(ligne.produitId);
  return { id };
}

/* ------------------------- CRUD client : ses avis ------------------------- */

export async function mesAvis() {
  const u = await getUtilisateurCourant();
  return (await db.avis()).find({ clientId: u.id }, { projection: { _id: 0 } }).sort({ creeLe: -1 }).toArray();
}

async function avisDuClient(avisId: string) {
  const u = await getUtilisateurCourant();
  const a = await (await db.avis()).findOne({ id: avisId });
  if (!a) throw new NotFoundError(`avis ${avisId}`);
  if (a.clientId !== u.id) throw new ForbiddenError("Vous ne pouvez modifier que vos propres avis.");
  return a;
}

/** Le client modifie la note ou le commentaire de son avis (la réponse du vendeur est conservée). */
export async function modifierAvis(d: { avisId: string; note: number; commentaire: string }) {
  const a = await avisDuClient(d.avisId);
  await (await db.avis()).updateOne({ id: a.id }, { $set: { note: d.note, commentaire: d.commentaire, modifieLe: new Date().toISOString() } });
  await majNoteProduit(a.produitId);
  return { id: a.id };
}

/** Le client supprime son avis (il pourra en redonner un sur le même achat). */
export async function supprimerAvis(avisId: string) {
  const a = await avisDuClient(avisId);
  await (await db.avis()).deleteOne({ id: a.id });
  await majNoteProduit(a.produitId);
  return { id: a.id };
}

/* --------------------------- Modération (admin) --------------------------- */

export async function tousLesAvis(statut?: "VISIBLE" | "MASQUE") {
  return (await db.avis()).find(statut ? { statut } : {}, { projection: { _id: 0 } }).sort({ creeLe: -1 }).limit(200).toArray();
}

/** Avis.masquer() : un avis masqué n'apparaît plus sur la fiche produit ni dans la note moyenne. */
export async function modererAvis(avisId: string, statut: "VISIBLE" | "MASQUE") {
  const r = await (await db.avis()).findOneAndUpdate({ id: avisId }, { $set: { statut } });
  if (!r) throw new NotFoundError(`avis ${avisId}`);
  await majNoteProduit(r.produitId);
  return { id: avisId, statut };
}

/** Réponse publique du vendeur, une seule fois, uniquement sur ses propres avis. */
export async function repondreAvis(avisId: string, reponse: string) {
  const u = await getUtilisateurCourant();
  const col = await db.avis();
  const a = await col.findOne({ id: avisId });
  if (!a) throw new NotFoundError(`avis ${avisId}`);
  if (a.fournisseurId !== u.fournisseurId) throw new ForbiddenError("Cet avis concerne un autre vendeur.");
  if (a.reponseFournisseur) throw new ForbiddenError("Vous avez déjà répondu à cet avis.");
  await col.updateOne({ id: avisId }, { $set: { reponseFournisseur: reponse, reponduLe: new Date().toISOString() } });
  return { avisId };
}
