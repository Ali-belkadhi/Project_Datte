// CONTRAT — fourni par le MODULE B (Catalogue), utilisé par C (panier, avis, assistant IA).
import "server-only";
import type { FiltresCatalogue, Produit, ProduitAvecVendeur, Variete } from "@/types/domain";
import { getProduitsParIds, listProduits } from "@/server/modules/catalogue/services/produits";
import { getVariete } from "@/server/modules/catalogue/services/varietes";
import mongoose from "mongoose";
import { creditsRepository, produitRepository } from "@/server/modules/catalogue/repositories";
import { ProductModel } from "@/server/modules/catalogue/repositories/produit.model";
import { notifier } from "@/server/contracts/comptes";
import { ForbiddenError } from "@/server/core/errors";
import { connectMongo, getDb } from "@/server/core/mongo";

/** Produit + vendeur pour construire une ligne de panier. */
export async function getProduitPourPanier(produitId: string): Promise<ProduitAvecVendeur | null> {
  const [item] = await getProduitsParIds([produitId]);
  return item ?? null;
}

export const getProduitsPourPanier = (ids: string[]) => getProduitsParIds(ids);

export async function getProduitBrut(produitId: string): Promise<Produit | null> {
  return produitRepository.parId(produitId);
}

type LigneStock = { produitId: string; quantiteGrammes?: number; quantiteUnites?: number };

/** Quantité dans l'unité du stock du catalogue : kg pour une datte, unités pour un dérivé. */
const quantiteStock = (l: LigneStock) => (l.quantiteGrammes !== undefined ? l.quantiteGrammes / 1000 : (l.quantiteUnites ?? 0));

/**
 * Réserve le stock à la commande (EF-32) : décrément atomique, ligne par ligne, uniquement si le stock suffit.
 * En cas de stock insuffisant, les lignes déjà réservées sont restituées et une erreur est levée.
 */
export async function reserverStock(lignes: LigneStock[]) {
  await connectMongo();
  const faites: LigneStock[] = [];
  for (const l of lignes) {
    const q = quantiteStock(l);
    if (q <= 0 || !mongoose.isValidObjectId(l.produitId)) continue; // produit de démonstration (hors base)
    const r = await ProductModel.updateOne({ _id: l.produitId, stock: { $gte: q } }, { $inc: { stock: -q, salesCount: 1 } });
    if (r.matchedCount === 0) {
      await libererStock(faites);
      throw new ForbiddenError("Stock insuffisant pour un des produits du panier.");
    }
    faites.push(l);
  }
  return { reserve: true as const };
}

/** Restitue le stock (annulation, refus, paiement échoué). */
export async function libererStock(lignes: LigneStock[]) {
  await connectMongo();
  for (const l of lignes) {
    const q = quantiteStock(l);
    if (q <= 0 || !mongoose.isValidObjectId(l.produitId)) continue;
    await ProductModel.updateOne({ _id: l.produitId }, { $inc: { stock: q, salesCount: -1 } });
  }
  return { libere: true as const };
}

/** Recalcule la note moyenne et le nombre d'avis visibles d'un produit (après un avis, une modification ou une modération). */
export async function majNoteProduit(produitId: string) {
  if (!mongoose.isValidObjectId(produitId)) return { note: null };
  const [stats] = await (await getDb())
    .collection("avis")
    .aggregate<{ moyenne: number; total: number }>([{ $match: { produitId, statut: "VISIBLE" } }, { $group: { _id: null, moyenne: { $avg: "$note" }, total: { $sum: 1 } } }])
    .toArray();
  await connectMongo();
  const note = stats ? Math.round(stats.moyenne * 10) / 10 : 0;
  await ProductModel.updateOne({ _id: produitId }, { $set: { averageRating: note, reviewCount: stats?.total ?? 0 } });
  return { note };
}

/** Référence d'un achat de crédits 3D, transmise à PaiementService et relue par le callback. */
export const referenceAchatCredits = (a: { fournisseurId: string; utilisateurId: string; packId: string }) =>
  `CR3D.${a.fournisseurId}.${a.utilisateurId}.${a.packId}.${Date.now().toString(36)}`;

/**
 * Callback de PaiementService (module C) pour un achat de crédits 3D, appelé UNE seule fois
 * (confirmation idempotente) quand le paiement aboutit ou échoue : crédite le solde du fournisseur.
 */
export async function confirmerAchatCredits3D(achat: { reference: string; paiementReference: string; montant: number; statut: "REUSSI" | "ECHOUE" }) {
  const [prefixe, fournisseurId, utilisateurId, packId] = achat.reference.split(".");
  if (prefixe !== "CR3D" || !fournisseurId) return { credite: 0 };
  if (achat.statut !== "REUSSI") {
    await notifier(utilisateurId, "ACHAT_CREDITS_CONFIRME", { statut: "ECHOUE", pack: packId }).catch(() => undefined);
    return { credite: 0 };
  }
  const pack = (await creditsRepository.packs()).find((p) => p.id === packId);
  const credits = pack?.nombreCredits ?? 0;
  if (credits > 0) await creditsRepository.crediter(fournisseurId, credits, `Achat pack ${pack?.nom ?? packId} (${credits} crédits) — paiement ${achat.paiementReference}`);
  await notifier(utilisateurId, "ACHAT_CREDITS_CONFIRME", { pack: packId, credits }).catch(() => undefined);
  return { credite: credits };
}

export const rechercherProduits = (filtres: FiltresCatalogue): Promise<ProduitAvecVendeur[]> => listProduits(filtres);

export const infosVariete = (slug: string): Promise<Variete | null> => getVariete(slug);
