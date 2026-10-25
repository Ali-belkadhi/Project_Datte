// MODULE C — Commandes (Karim Ouertatani)
import "server-only";
import type { Adresse, Commande, LigneCommande, LignePanier, SousCommande } from "@/types/domain";
import type { MethodePaiement, StatutCommande, StatutSousCommande } from "@/types/enums";
import { LIVRAISON } from "@/lib/constants";
import { totalLigne } from "@/lib/format";
import { ligneDepuisProduit, totauxPanier } from "@/lib/panier";
import { getDb } from "@/server/core/mongo";
import { getProduitsPourPanier, reserverStock } from "@/server/contracts/catalogue";
import { getUtilisateurCourant } from "@/server/contracts/comptes";
import { NotFoundError } from "@/server/core/errors";
import { commandeRepository } from "../repositories";

type CommandeDoc = Commande & { clientId: string; paiementReference?: string };
const collection = async () => (await getDb()).collection<CommandeDoc>("commandes");
const sansId = { projection: { _id: 0 } } as const;

export async function mesCommandes() {
  const u = await getUtilisateurCourant();
  const [reelles, demo] = await Promise.all([
    collection()
      .then((c) => c.find({ clientId: u.id }, sansId).sort({ creeLe: -1 }).toArray())
      .catch(() => [] as CommandeDoc[]),
    commandeRepository.pourClient(u.id),
  ]);
  return [...reelles, ...demo];
}

export async function getCommande(numero: string): Promise<Commande | null> {
  const reelle = await collection()
    .then((c) => c.findOne({ numero }, sansId))
    .catch(() => null);
  return reelle ?? commandeRepository.parNumero(numero);
}

export async function majStatutCommande(numero: string, statut: StatutCommande) {
  await (await collection()).updateOne({ numero }, { $set: { statut } });
}

type EntreeCommande = {
  lignes: { produitId: string; quantiteGrammes?: number; quantiteUnites?: number }[];
  adresse: Adresse;
  livraison: Record<string, "standard" | "express">;
  methodePaiement: MethodePaiement;
};

/** Crée la commande (scindée par fournisseur) à partir des lignes du panier. Prix recalculés côté serveur. */
export async function creerCommande({ lignes, adresse, livraison, methodePaiement }: EntreeCommande) {
  const u = await getUtilisateurCourant();
  const produits = await getProduitsPourPanier(lignes.map((l) => l.produitId));
  const lignesPanier: LignePanier[] = lignes.map((l) => {
    const p = produits.find((x) => x.produit.id === l.produitId);
    if (!p) throw new NotFoundError(`Produit introuvable : ${l.produitId}`);
    return { id: l.produitId, ...ligneDepuisProduit(p, l) };
  });
  await reserverStock(lignes);

  const numero = `DGL-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
  const creeLe = new Date().toISOString();
  const { groupes, sousTotal } = totauxPanier(lignesPanier);

  const sousCommandes: SousCommande[] = groupes.map((g, i) => {
    const frais = livraison[g.fournisseurId] === "express" ? LIVRAISON.express.prix : g.frais;
    const lignesCmd: LigneCommande[] = g.lignes.map((l, j) => ({
      id: `${numero}-${i + 1}-${j + 1}`,
      produitId: l.produitId,
      slug: l.slug,
      nomProduit: l.nom,
      variete: l.variete,
      visuel: l.visuel,
      typeProduit: l.typeProduit,
      quantiteGrammes: l.quantiteGrammes,
      quantiteUnites: l.quantiteUnites,
      prixUnitaire: l.prix,
      total: totalLigne(l.prix, l.quantiteGrammes, l.quantiteUnites),
    }));
    return {
      id: `${numero}-${i + 1}`,
      numero: `${numero}-${String.fromCharCode(65 + i)}`,
      commandeNumero: numero,
      fournisseurId: g.fournisseurId,
      fournisseurNom: g.fournisseurNom,
      client: { prenom: u.prenom, ville: adresse.ville, initiales: u.initiales },
      statut: "EN_ATTENTE",
      lignes: lignesCmd,
      sousTotal: g.sousTotal,
      fraisLivraison: frais,
      commission: 0,
      creeLe,
      etapes: [
        { cle: "passee", libelle: "Commande passée", date: creeLe, etat: "terminee" },
        { cle: "acceptee", libelle: "Acceptée par le vendeur", etat: "a-venir" },
        { cle: "expediee", libelle: "Expédiée", etat: "a-venir" },
        { cle: "livree", libelle: "Livrée", etat: "a-venir" },
      ],
    };
  });

  const fraisLivraison = sousCommandes.reduce((a, s) => a + s.fraisLivraison, 0);
  const commande: CommandeDoc = {
    id: numero,
    numero,
    clientId: u.id,
    creeLe,
    statut: "EN_ATTENTE_PAIEMENT",
    sousCommandes,
    adresse,
    methodePaiement,
    sousTotal,
    fraisLivraison,
    remise: 0,
    total: sousTotal + fraisLivraison,
  };
  await (await collection()).insertOne({ ...commande });
  return commande;
}

export async function lierPaiement(numero: string, reference: string) {
  await (await collection()).updateOne({ numero }, { $set: { paiementReference: reference } });
}

export async function derniereCommande() {
  const commandes = await mesCommandes();
  return commandes[0] ?? null;
}

/* ------------------------------ Vue vendeur ----------------------------- */

export async function sousCommandesRecues() {
  const u = await getUtilisateurCourant();
  return commandeRepository.sousCommandesFournisseur(u.fournisseurId ?? "");
}

export const getSousCommande = (numero: string) => commandeRepository.sousCommandeParNumero(numero);

/** Compteurs par statut pour les onglets « Commandes reçues ». */
export async function compteursSousCommandes() {
  const toutes = await sousCommandesRecues();
  const c: Partial<Record<StatutSousCommande | "TOUTES", number>> = { TOUTES: toutes.length };
  for (const s of toutes) c[s.statut] = (c[s.statut] ?? 0) + 1;
  return c;
}

export async function commandesATraiter(limite = 4) {
  const toutes = await sousCommandesRecues();
  return toutes.filter((s) => s.statut === "EN_ATTENTE" || s.statut === "ACCEPTEE").slice(0, limite);
}

/** Transitions autorisées depuis un statut (règle métier du cycle de vie). */
export function actionsPossibles(statut: StatutSousCommande) {
  switch (statut) {
    case "EN_ATTENTE":
      return ["accepter", "refuser"] as const;
    case "ACCEPTEE":
      return ["preparer"] as const;
    case "EN_PREPARATION":
      return ["expedier", "bordereau"] as const;
    case "EXPEDIEE":
      return ["bordereau"] as const;
    default:
      return [] as const;
  }
}
