// MODULE C — Commandes (Karim Ouertatani) — PanierService : panier persistant (client) ou visiteur (cookie).
import "server-only";
import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import type { LignePanier } from "@/types/domain";
import { ligneDepuisProduit } from "@/lib/panier";
import { getProduitsPourPanier } from "@/server/contracts/catalogue";
import { getUtilisateurCourant } from "@/server/contracts/comptes";
import { ForbiddenError, NotFoundError } from "@/server/core/errors";
import { db, type LignePanierDoc } from "../repositories/mongo";

const COOKIE_VISITEUR = "degla-panier";

/**
 * Propriétaire du panier : l'identifiant du client connecté, sinon un identifiant visiteur (cookie).
 * `creer` : pose le cookie visiteur s'il manque (uniquement dans une Server Action / un Route Handler).
 */
async function proprietaire(creer = false): Promise<string | null> {
  const u = await getUtilisateurCourant().catch(() => null);
  if (u?.role === "CLIENT") return u.id;
  const jar = await cookies();
  const existant = jar.get(COOKIE_VISITEUR)?.value;
  if (existant) return `visiteur:${existant}`;
  if (!creer) return null;
  const id = randomUUID();
  jar.set(COOKIE_VISITEUR, id, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 30 });
  return `visiteur:${id}`;
}

/** Lignes du panier, enrichies via le contrat du module B (prix et stock À JOUR). */
export async function getPanier(): Promise<LignePanier[]> {
  const p = await proprietaire();
  if (!p) return [];
  const doc = await (await db.paniers()).findOne({ proprietaire: p });
  if (!doc?.lignes.length) return [];
  const produits = await getProduitsPourPanier(doc.lignes.map((l) => l.produitId));
  return doc.lignes.flatMap((l) => {
    const item = produits.find((x) => x.produit.id === l.produitId);
    return item ? [{ id: l.produitId, ...ligneDepuisProduit(item, l) }] : [];
  });
}

/** Compatibilité : nom utilisé par le layout public. */
export const getPanierDemo = getPanier;

export async function ajouterLigne(l: LignePanierDoc) {
  const p = (await proprietaire(true))!;
  const [item] = await getProduitsPourPanier([l.produitId]);
  if (!item) throw new NotFoundError(`produit ${l.produitId}`);
  const col = await db.paniers();
  const doc = await col.findOne({ proprietaire: p });
  const existante = doc?.lignes.find((x) => x.produitId === l.produitId);
  const nouvelle: LignePanierDoc = existante
    ? {
        produitId: l.produitId,
        quantiteGrammes: existante.quantiteGrammes !== undefined ? existante.quantiteGrammes + (l.quantiteGrammes ?? 0) : undefined,
        quantiteUnites: existante.quantiteUnites !== undefined ? existante.quantiteUnites + (l.quantiteUnites ?? 0) : undefined,
      }
    : l;
  const stock = item.produit.typeProduit === "DATTE" ? item.produit.stockGrammes : item.produit.stockUnites;
  if ((nouvelle.quantiteGrammes ?? nouvelle.quantiteUnites ?? 0) > stock) throw new ForbiddenError("Quantité supérieure au stock disponible.");
  const lignes = [...(doc?.lignes ?? []).filter((x) => x.produitId !== l.produitId), nouvelle];
  await col.updateOne({ proprietaire: p }, { $set: { lignes, majLe: new Date() } }, { upsert: true });
  return nouvelle;
}

/** Nouvelle quantité d'une ligne (identifiant = produitId). 0 = retirer. */
export async function modifierLigne(produitId: string, q: { quantiteGrammes?: number; quantiteUnites?: number }) {
  const p = (await proprietaire(true))!;
  const col = await db.paniers();
  const doc = await col.findOne({ proprietaire: p });
  const quantite = q.quantiteGrammes ?? q.quantiteUnites ?? 0;
  const lignes = (doc?.lignes ?? []).flatMap((l) => (l.produitId !== produitId ? [l] : quantite > 0 ? [{ ...l, ...q }] : []));
  await col.updateOne({ proprietaire: p }, { $set: { lignes, majLe: new Date() } }, { upsert: true });
}

export const retirerLigne = (produitId: string) => modifierLigne(produitId, { quantiteUnites: 0 });

export async function viderPanier() {
  const p = await proprietaire();
  if (p) await (await db.paniers()).updateOne({ proprietaire: p }, { $set: { lignes: [], majLe: new Date() }, $unset: { codePromo: "" } });
}

export async function memoriserCodePromo(code: string | null) {
  const p = (await proprietaire(true))!;
  await (await db.paniers()).updateOne({ proprietaire: p }, code ? { $set: { codePromo: code } } : { $unset: { codePromo: "" } }, { upsert: true });
}

export async function codePromoMemorise() {
  const p = await proprietaire();
  return p ? ((await (await db.paniers()).findOne({ proprietaire: p }))?.codePromo ?? null) : null;
}

/**
 * Fusion du panier visiteur dans le panier client (EF-30).
 * À appeler par le module A juste après la connexion (contrat `fusionnerPanierVisiteur`).
 */
export async function fusionnerPanierVisiteur(clientId: string) {
  const jar = await cookies();
  const visiteur = jar.get(COOKIE_VISITEUR)?.value;
  if (!visiteur) return;
  const col = await db.paniers();
  const source = await col.findOne({ proprietaire: `visiteur:${visiteur}` });
  if (source?.lignes.length) {
    const cible = await col.findOne({ proprietaire: clientId });
    const fusion = new Map((cible?.lignes ?? []).map((l) => [l.produitId, l]));
    for (const l of source.lignes) {
      const e = fusion.get(l.produitId);
      fusion.set(
        l.produitId,
        e
          ? { produitId: l.produitId, quantiteGrammes: e.quantiteGrammes !== undefined ? e.quantiteGrammes + (l.quantiteGrammes ?? 0) : undefined, quantiteUnites: e.quantiteUnites !== undefined ? e.quantiteUnites + (l.quantiteUnites ?? 0) : undefined }
          : l,
      );
    }
    await col.updateOne({ proprietaire: clientId }, { $set: { lignes: [...fusion.values()], majLe: new Date() } }, { upsert: true });
  }
  await col.deleteOne({ proprietaire: `visiteur:${visiteur}` });
  jar.delete(COOKIE_VISITEUR);
}

export { scinderParFournisseur, totauxPanier } from "@/lib/panier";
