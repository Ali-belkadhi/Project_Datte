// MODULE C — Commandes (Karim Ouertatani) — VersementService (EF-19) : reversement des ventes aux fournisseurs.
import "server-only";
import type { Versement } from "@/types/domain";
import { getUtilisateurCourant } from "@/server/contracts/comptes";
import { db, prochainNumero, SANS_ID } from "../repositories/mongo";

export const TAUX_COMMISSION = 8; // % — miroir de ParametresPlateforme.tauxCommission (module A)
/** Délai de rétractation avant de reverser un colis livré. */
export const DELAI_VERSEMENT_JOURS = 7;

/** Commission DEGLA sur un montant brut (millimes). */
export const calculerCommission = (brut: number) => Math.round((brut * TAUX_COMMISSION) / 100);

const versVersement = ({ fournisseurId: _f, sousCommandes: _s, ...v }: Versement & Record<string, unknown>): Versement => v;

export async function mesVersements() {
  const u = await getUtilisateurCourant();
  const versements = (await (await db.versements()).find({ fournisseurId: u.fournisseurId ?? "" }, SANS_ID).sort({ periodeFin: -1 }).toArray()).map(versVersement);
  const prochain = versements.find((v) => v.statut === "PLANIFIE") ?? null;
  const totalVerse = versements.filter((v) => v.statut === "EFFECTUE").reduce((a, v) => a + v.montantNet, 0);
  return { versements, prochain, totalVerse };
}

/**
 * Tâche planifiée (api/cron/versements) : regroupe, par fournisseur, les colis livrés depuis plus de
 * DELAI_VERSEMENT_JOURS et pas encore reversés, et crée un Versement PLANIFIE (brut − commission − remboursements).
 */
export async function planifierVersements(maintenant = new Date()) {
  const limite = new Date(maintenant.getTime() - DELAI_VERSEMENT_JOURS * 864e5).toISOString();
  const colis = await (await db.sousCommandes()).find({ statut: { $in: ["LIVREE", "REMBOURSEE"] }, livreeLe: { $lte: limite }, versementId: { $exists: false } }).toArray();
  const parFournisseur = new Map<string, typeof colis>();
  for (const s of colis) parFournisseur.set(s.fournisseurId, [...(parFournisseur.get(s.fournisseurId) ?? []), s]);

  const crees: string[] = [];
  for (const [fournisseurId, liste] of parFournisseur) {
    const brut = liste.reduce((a, s) => a + s.sousTotal + s.fraisLivraison - (s.remise ?? 0) - (s.montantRembourse ?? 0), 0);
    const commission = liste.reduce((a, s) => a + s.commission, 0);
    const dates = liste.map((s) => s.livreeLe!).sort();
    const id = `VRS-${maintenant.getFullYear()}-${String(await prochainNumero("versement", 0)).padStart(5, "0")}`;
    const prevu = new Date(maintenant.getTime() + 2 * 864e5).toISOString();
    await (await db.versements()).insertOne({
      id,
      reference: id,
      periodeDebut: dates[0],
      periodeFin: dates[dates.length - 1],
      montantBrut: Math.max(0, brut),
      commission,
      montantNet: Math.max(0, brut - commission),
      statut: "PLANIFIE",
      dateVersement: prevu,
      fournisseurId,
      sousCommandes: liste.map((s) => s.numero),
    });
    await (await db.sousCommandes()).updateMany({ numero: { $in: liste.map((s) => s.numero) } }, { $set: { versementId: id } });
    crees.push(id);
  }
  return { versements: crees, colis: colis.length };
}

/** Virement exécuté (ou échoué) : à appeler après l'ordre de virement bancaire. */
export async function marquerVersement(id: string, statut: "EFFECTUE" | "ECHOUE") {
  await (await db.versements()).updateOne({ id, statut: "PLANIFIE" }, { $set: { statut, dateVersement: new Date().toISOString() } });
}
