// MODULE C — Commandes (Karim Ouertatani) — codes promo (EF-33).
import "server-only";
import type { GroupePanier } from "@/lib/panier";
import { ForbiddenError } from "@/server/core/errors";
import { db, SANS_ID, type CodePromoDoc } from "../repositories/mongo";

export type ResultatCodePromo =
  | { valide: true; code: string; remise: number; parFournisseur: Record<string, number>; message: string }
  | { valide: false; code: string; remise: 0; parFournisseur: Record<string, number>; message: string };

const refus = (code: string, message: string): ResultatCodePromo => ({ valide: false, code, remise: 0, parFournisseur: {}, message });

/**
 * Évalue un code sur un panier scindé par fournisseur.
 * Code global : s'applique au sous-total total. Code fournisseur : uniquement aux articles de ce vendeur.
 * La remise est répartie entre les colis au prorata (utile pour les remboursements partiels).
 */
export async function evaluerCodePromo(saisie: string, groupes: GroupePanier[]): Promise<ResultatCodePromo> {
  const code = saisie.trim().toUpperCase();
  const p = await (await db.codesPromo()).findOne({ code });
  const now = new Date();
  if (!p || !p.actif) return refus(code, "Ce code promo n'existe pas.");
  if (now < p.debut || now > p.fin) return refus(code, "Ce code promo a expiré.");
  if (p.utilisationsMax != null && p.utilisations >= p.utilisationsMax) return refus(code, "Ce code promo a atteint sa limite d'utilisation.");

  const concernes = p.fournisseurId ? groupes.filter((g) => g.fournisseurId === p.fournisseurId) : groupes;
  const base = concernes.reduce((a, g) => a + g.sousTotal, 0);
  if (!concernes.length) return refus(code, "Ce code ne s'applique à aucun article de votre panier.");
  if (base < p.montantMinimum) return refus(code, `Minimum d'achat : ${(p.montantMinimum / 1000).toFixed(3).replace(".", ",")} DT.`);

  const remise = Math.min(base, p.type === "POURCENTAGE" ? Math.round((base * p.valeur) / 100) : p.valeur);
  const parFournisseur: Record<string, number> = {};
  let reste = remise;
  concernes.forEach((g, i) => {
    const part = i === concernes.length - 1 ? reste : Math.round((remise * g.sousTotal) / base);
    parFournisseur[g.fournisseurId] = part;
    reste -= part;
  });
  return { valide: true, code, remise, parFournisseur, message: p.type === "POURCENTAGE" ? `−${p.valeur} % appliqué` : "Remise appliquée" };
}

export async function consommerCodePromo(code: string) {
  await (await db.codesPromo()).updateOne({ code }, { $inc: { utilisations: 1 } });
}

/* ------------------------------ Administration ---------------------------- */

export async function listCodesPromo() {
  return (await db.codesPromo()).find({}, SANS_ID).sort({ actif: -1, fin: -1 }).toArray();
}

export async function creerCodePromo(d: Omit<CodePromoDoc, "utilisations" | "actif">) {
  const col = await db.codesPromo();
  if (await col.findOne({ code: d.code })) throw new ForbiddenError("Ce code existe déjà.");
  if (d.type === "POURCENTAGE" && (d.valeur < 1 || d.valeur > 90)) throw new ForbiddenError("Le pourcentage doit être compris entre 1 et 90.");
  await col.insertOne({ ...d, utilisations: 0, actif: true });
  return d.code;
}

/** Modification d'un code existant (le code lui-même et son compteur d'utilisations ne changent pas). */
export async function modifierCodePromo(code: string, d: Omit<CodePromoDoc, "code" | "utilisations" | "actif">) {
  if (d.type === "POURCENTAGE" && (d.valeur < 1 || d.valeur > 90)) throw new ForbiddenError("Le pourcentage doit être compris entre 1 et 90.");
  const r = await (await db.codesPromo()).updateOne({ code }, { $set: d });
  if (!r.matchedCount) throw new ForbiddenError("Code introuvable.");
}

/** Suppression : seulement si le code n'a jamais servi (sinon on le désactive, pour garder l'historique des commandes). */
export async function supprimerCodePromo(code: string) {
  const col = await db.codesPromo();
  const p = await col.findOne({ code });
  if (!p) throw new ForbiddenError("Code introuvable.");
  if (p.utilisations > 0) throw new ForbiddenError("Ce code a déjà été utilisé : désactivez-le plutôt que de le supprimer.");
  await col.deleteOne({ code });
}

export async function basculerCodePromo(code: string, actif: boolean) {
  const r = await (await db.codesPromo()).updateOne({ code }, { $set: { actif } });
  if (!r.matchedCount) throw new ForbiddenError("Code introuvable.");
}
