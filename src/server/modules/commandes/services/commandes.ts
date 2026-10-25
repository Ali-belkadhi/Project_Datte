// MODULE C — Commandes (Karim Ouertatani) — CommandeService : scission par fournisseur + machine à états.
import "server-only";
import type { Filter } from "mongodb";
import type { Adresse, Commande, EtapeSuivi, LigneCommande, LignePanier, SousCommande } from "@/types/domain";
import type { MethodePaiement, StatutCommande, StatutSousCommande } from "@/types/enums";
import { VARIETY_PRESETS } from "@/components/three/presets";
import { LIVRAISON } from "@/lib/constants";
import { totalLigne } from "@/lib/format";
import { ligneDepuisProduit, totauxPanier } from "@/lib/panier";
import { getProduitsPourPanier, libererStock, reserverStock } from "@/server/contracts/catalogue";
import { getUtilisateurCourant, notifier } from "@/server/contracts/comptes";
import { ForbiddenError, NotFoundError } from "@/server/core/errors";
import { db, prochainNumero, SANS_ID, type CommandeDoc, type HistoriqueStatut, type SousCommandeDoc } from "../repositories/mongo";
import { evaluerCodePromo, consommerCodePromo } from "./codes-promo";
import { encaisserALaLivraison, initierPaiement, rembourserCommande } from "./paiements";
import { calculerCommission } from "./versements";

/* ----------------------------- Lecture / vues ---------------------------- */

const ETAPES: { cle: string; libelle: string; statut: StatutSousCommande }[] = [
  { cle: "passee", libelle: "Commande passée", statut: "EN_ATTENTE" },
  { cle: "acceptee", libelle: "Acceptée par le vendeur", statut: "ACCEPTEE" },
  { cle: "preparation", libelle: "En préparation", statut: "EN_PREPARATION" },
  { cle: "expediee", libelle: "Expédiée", statut: "EXPEDIEE" },
  { cle: "livree", libelle: "Livrée", statut: "LIVREE" },
];
const FIN_NEGATIVE: Partial<Record<StatutSousCommande, string>> = {
  REFUSEE: "Refusée par le vendeur",
  ANNULEE: "Annulée",
  REMBOURSEE: "Remboursée",
};

/** Timeline affichée au client et au vendeur, reconstruite depuis l'historique des statuts. */
function etapesDepuis(s: SousCommandeDoc): EtapeSuivi[] {
  const date = (st: StatutSousCommande) => s.historique.findLast((h) => h.nouveauStatut === st)?.date;
  const atteint = new Set(s.historique.map((h) => h.nouveauStatut));
  const fin = FIN_NEGATIVE[s.statut];
  if (fin) {
    const faites = ETAPES.filter((e) => atteint.has(e.statut));
    return [
      ...faites.map((e) => ({ cle: e.cle, libelle: e.libelle, date: date(e.statut), etat: "terminee" as const })),
      { cle: s.statut.toLowerCase(), libelle: fin, date: date(s.statut), etat: "terminee" as const },
    ];
  }
  const courant = ETAPES.findIndex((e) => e.statut === s.statut);
  return ETAPES.map((e, i) => {
    if (i === 0 && s.enAttentePaiement) return { cle: e.cle, libelle: "En attente de paiement", date: date(e.statut), etat: "en-cours" as const };
    const etat = i <= courant ? "terminee" : i === courant + 1 && !s.enAttentePaiement ? "en-cours" : "a-venir";
    return { cle: e.cle, libelle: e.libelle, date: i <= courant ? date(e.statut) : undefined, etat };
  });
}

function versSousCommande(s: SousCommandeDoc): SousCommande {
  return { ...s, id: s.numero, etapes: etapesDepuis(s) };
}

function assembler(c: CommandeDoc, sous: SousCommandeDoc[]): Commande {
  return { ...c, id: c.numero, sousCommandes: sous.filter((s) => s.commandeNumero === c.numero).map(versSousCommande) };
}

async function chargerCommandes(filtre: Filter<CommandeDoc>, limite = 200): Promise<Commande[]> {
  const entetes = await (await db.commandes()).find(filtre, SANS_ID).sort({ creeLe: -1 }).limit(limite).toArray();
  if (!entetes.length) return [];
  const sous = await (await db.sousCommandes()).find({ commandeNumero: { $in: entetes.map((c) => c.numero) } }, SANS_ID).toArray();
  return entetes.map((c) => assembler(c, sous));
}

export async function mesCommandes() {
  const u = await getUtilisateurCourant();
  return chargerCommandes({ clientId: u.id });
}

export async function derniereCommande() {
  return (await mesCommandes())[0] ?? null;
}

/** Commande complète. Un client ne voit que les siennes ; admin : toutes. */
export async function getCommande(numero: string): Promise<Commande | null> {
  const u = await getUtilisateurCourant();
  const filtre: Filter<CommandeDoc> = u.role === "ADMIN" ? { numero } : { numero, clientId: u.id };
  return (await chargerCommandes(filtre, 1))[0] ?? null;
}

/** Suivi d'une commande pour l'assistant IA-C : uniquement les commandes du client donné. */
export async function suiviPourClient(clientId: string, numero: string) {
  return (await chargerCommandes({ clientId, numero }, 1))[0] ?? null;
}

/** Identifiants des lignes déjà notées par le client (masque le formulaire d'avis). */
export async function lignesDejaNotees(numero: string) {
  const u = await getUtilisateurCourant();
  const avis = await (await db.avis()).find({ clientId: u.id, ligneCommandeId: { $regex: `^${numero}-` } }, { projection: { ligneCommandeId: 1 } }).toArray();
  return avis.map((a) => a.ligneCommandeId);
}

/* -------------------------------- Création ------------------------------- */

type EntreeCommande = {
  lignes: { produitId: string; quantiteGrammes?: number; quantiteUnites?: number }[];
  adresse: Adresse;
  livraison: Record<string, "standard" | "express">;
  methodePaiement: MethodePaiement;
  codePromo?: string;
  position?: { latitude: number; longitude: number };
};

/**
 * Crée la commande à partir des lignes du panier :
 * prix recalculés côté serveur (contrat B), scission par fournisseur, code promo, commission,
 * réservation du stock, puis paiement (Stripe ou à la livraison).
 */
export async function creerCommande({ lignes, adresse, livraison, methodePaiement, codePromo, position }: EntreeCommande) {
  const u = await getUtilisateurCourant();
  const produits = await getProduitsPourPanier(lignes.map((l) => l.produitId));
  const lignesPanier: LignePanier[] = lignes.map((l) => {
    const p = produits.find((x) => x.produit.id === l.produitId);
    if (!p) throw new NotFoundError(`produit ${l.produitId}`);
    const ligne = { id: l.produitId, ...ligneDepuisProduit(p, l) };
    const quantite = ligne.quantiteGrammes ?? ligne.quantiteUnites ?? 0;
    if (quantite > ligne.stockMax) throw new ForbiddenError(`Stock insuffisant pour « ${ligne.nom} ».`);
    return ligne;
  });

  const { groupes, sousTotal } = totauxPanier(lignesPanier);
  const promo = codePromo ? await evaluerCodePromo(codePromo, groupes) : null;
  if (codePromo && !promo?.valide) throw new ForbiddenError(promo?.message ?? "Code promo invalide.");

  await reserverStock(lignes);

  const annee = new Date().getFullYear();
  const numero = `DGL-${annee}-${String(await prochainNumero("commande", 1000)).padStart(6, "0")}`;
  const creeLe = new Date().toISOString();
  const carte = methodePaiement !== "A_LA_LIVRAISON";

  const sousCommandes: SousCommandeDoc[] = groupes.map((g, i) => {
    const frais = livraison[g.fournisseurId] === "express" ? LIVRAISON.express.prix : g.frais;
    const scNumero = `${numero}-${String.fromCharCode(65 + i)}`;
    const lignesCmd: LigneCommande[] = g.lignes.map((l, j) => ({
      id: `${scNumero}-${j + 1}`,
      produitId: l.produitId,
      slug: l.slug,
      nomProduit: l.nom,
      nomVariete: l.variete ? VARIETY_PRESETS[l.variete]?.nom : undefined,
      variete: l.variete,
      visuel: l.visuel,
      typeProduit: l.typeProduit,
      quantiteGrammes: l.quantiteGrammes,
      quantiteUnites: l.quantiteUnites,
      prixUnitaire: l.prix,
      total: totalLigne(l.prix, l.quantiteGrammes, l.quantiteUnites),
    }));
    return {
      numero: scNumero,
      commandeNumero: numero,
      clientId: u.id,
      fournisseurId: g.fournisseurId,
      fournisseurNom: g.fournisseurNom,
      client: { prenom: u.prenom, ville: adresse.ville, initiales: u.initiales },
      statut: "EN_ATTENTE",
      lignes: lignesCmd,
      sousTotal: g.sousTotal,
      fraisLivraison: frais,
      remise: promo?.parFournisseur[g.fournisseurId] ?? 0,
      commission: calculerCommission(g.sousTotal),
      creeLe,
      enAttentePaiement: carte,
      historique: [{ ancienStatut: null, nouveauStatut: "EN_ATTENTE", auteurId: u.id, date: creeLe }],
    };
  });

  const fraisLivraison = sousCommandes.reduce((a, s) => a + s.fraisLivraison, 0);
  const remise = promo?.remise ?? 0;
  const commande: CommandeDoc = {
    numero,
    clientId: u.id,
    creeLe,
    statut: "EN_ATTENTE_PAIEMENT",
    adresse,
    methodePaiement,
    sousTotal,
    fraisLivraison,
    remise,
    total: Math.max(0, sousTotal + fraisLivraison - remise),
    codePromo: promo?.valide ? promo.code : undefined,
    position,
  };

  await (await db.commandes()).insertOne({ ...commande });
  await (await db.sousCommandes()).insertMany(sousCommandes.map((s) => ({ ...s })));
  if (promo?.valide) await consommerCodePromo(promo.code);

  const paiement = await initierPaiement(commande.total, { type: "COMMANDE", reference: numero }, { methode: methodePaiement, email: u.email });
  await (await db.commandes()).updateOne({ numero }, { $set: { paiementReference: paiement.reference } });
  if (!carte) await notifier(u.id, "COMMANDE_STATUT", { numero, statut: "EN_ATTENTE" });
  return { numero, total: commande.total, urlPaiement: paiement.urlPaiement };
}

/** Nouvelle session de paiement pour une commande restée EN_ATTENTE_PAIEMENT (paiement abandonné). */
export async function reprendrePaiement(numero: string) {
  const u = await getUtilisateurCourant();
  const c = await (await db.commandes()).findOne({ numero, clientId: u.id });
  if (!c) throw new NotFoundError(`commande ${numero}`);
  if (c.statut !== "EN_ATTENTE_PAIEMENT" || c.methodePaiement === "A_LA_LIVRAISON") throw new ForbiddenError("Cette commande n'attend pas de paiement en ligne.");
  const paiement = await initierPaiement(c.total, { type: "COMMANDE", reference: numero }, { methode: c.methodePaiement, email: u.email });
  await (await db.commandes()).updateOne({ numero }, { $set: { paiementReference: paiement.reference } });
  return { numero, urlPaiement: paiement.urlPaiement };
}

/** Appelé par PaiementService quand un paiement de commande est confirmé ou échoue. */
export async function surPaiementCommande(numero: string, reference: string, statut: "REUSSI" | "ECHOUE") {
  const c = await (await db.commandes()).findOne({ numero });
  if (!c || c.statut !== "EN_ATTENTE_PAIEMENT") return;
  if (statut === "REUSSI") {
    await (await db.commandes()).updateOne({ numero, statut: "EN_ATTENTE_PAIEMENT" }, { $set: { statut: "PAYEE", paiementReference: reference } });
    await (await db.sousCommandes()).updateMany({ commandeNumero: numero }, { $unset: { enAttentePaiement: "" } });
    const { creerFacture } = await import("./factures");
    await creerFacture(numero);
    await notifier(c.clientId, "COMMANDE_STATUT", { numero, statut: "PAYEE" });
    return;
  }
  // Échec ou expiration : seule la session de paiement en cours annule la commande.
  if (c.paiementReference !== reference) return;
  const sous = await (await db.sousCommandes()).find({ commandeNumero: numero }).toArray();
  await libererStock(sous.flatMap(lignesStock));
  const now = new Date().toISOString();
  await (await db.sousCommandes()).updateMany(
    { commandeNumero: numero },
    { $set: { statut: "ANNULEE" }, $push: { historique: { ancienStatut: "EN_ATTENTE", nouveauStatut: "ANNULEE", auteurId: null, commentaire: "Paiement non abouti", date: now } } },
  );
  await (await db.commandes()).updateOne({ numero }, { $set: { statut: "ANNULEE", annuleeLe: now } });
  await notifier(c.clientId, "COMMANDE_STATUT", { numero, statut: "ANNULEE" });
}

/* ---------------------------- Machine à états ---------------------------- */

/** Transitions autorisées : la SEULE source de vérité du cycle de vie d'un colis. */
const TRANSITIONS: Record<StatutSousCommande, StatutSousCommande[]> = {
  EN_ATTENTE: ["ACCEPTEE", "REFUSEE", "ANNULEE"],
  ACCEPTEE: ["EN_PREPARATION", "ANNULEE"],
  EN_PREPARATION: ["EXPEDIEE", "ANNULEE"],
  EXPEDIEE: ["LIVREE"],
  LIVREE: ["REMBOURSEE"],
  REFUSEE: ["REMBOURSEE"],
  ANNULEE: ["REMBOURSEE"],
  REMBOURSEE: [],
};

const lignesStock = (s: SousCommandeDoc) =>
  s.lignes.map((l) => ({ produitId: l.produitId, quantiteGrammes: l.quantiteGrammes, quantiteUnites: l.quantiteUnites }));

/** Montant payé pour un colis (sous-total + livraison − part de remise). */
const montantColis = (s: SousCommandeDoc) => Math.max(0, s.sousTotal + s.fraisLivraison - (s.remise ?? 0));

async function transition(
  numero: string,
  vers: StatutSousCommande,
  auteurId: string | null,
  options: { commentaire?: string; set?: Partial<SousCommandeDoc>; controle?: (s: SousCommandeDoc) => void } = {},
) {
  const col = await db.sousCommandes();
  const s = await col.findOne({ numero });
  if (!s) throw new NotFoundError(`colis ${numero}`);
  options.controle?.(s);
  if (s.enAttentePaiement) throw new ForbiddenError("Cette commande n'est pas encore payée.");
  if (!TRANSITIONS[s.statut].includes(vers)) throw new ForbiddenError(`Transition impossible : ${s.statut} → ${vers}.`);
  const h: HistoriqueStatut = { ancienStatut: s.statut, nouveauStatut: vers, auteurId, commentaire: options.commentaire, date: new Date().toISOString() };
  // filtre sur l'ancien statut : deux actions simultanées ne peuvent pas passer toutes les deux
  const r = await col.findOneAndUpdate(
    { numero, statut: s.statut },
    { $set: { statut: vers, ...options.set }, $push: { historique: h } },
    { returnDocument: "after" },
  );
  if (!r) throw new ForbiddenError("Le colis a changé d'état entre-temps, rechargez la page.");
  await recalculerStatutCommande(r.commandeNumero);
  await notifier(r.clientId, "COMMANDE_STATUT", { numero, statut: vers });
  return r;
}

/** Statut global d'une commande, déduit de ses colis. */
async function recalculerStatutCommande(numero: string) {
  const c = await (await db.commandes()).findOne({ numero });
  if (!c || (c.statut === "EN_ATTENTE_PAIEMENT" && c.methodePaiement !== "A_LA_LIVRAISON")) return;
  const sous = await (await db.sousCommandes()).find({ commandeNumero: numero }).toArray();
  const actifs = sous.filter((s) => !["ANNULEE", "REFUSEE"].includes(s.statut) && !(s.statut === "REMBOURSEE" && !s.livreeLe));
  let statut: StatutCommande = c.statut;
  if (!actifs.length) statut = "ANNULEE";
  else if (actifs.every((s) => s.livreeLe)) statut = "LIVREE";
  else if (actifs.some((s) => s.livreeLe)) statut = "PARTIELLEMENT_LIVREE";
  else if (c.methodePaiement !== "A_LA_LIVRAISON") statut = "PAYEE";
  if (statut !== c.statut) await (await db.commandes()).updateOne({ numero }, { $set: { statut } });
  if (statut === "ANNULEE") {
    // plus rien à encaisser : un paiement à la livraison en attente est clos
    await (await db.paiements()).updateMany({ "objet.reference": numero, statut: "EN_ATTENTE" }, { $set: { statut: "ECHOUE", majLe: new Date() } });
  }
  if (statut === "LIVREE" && c.methodePaiement === "A_LA_LIVRAISON") {
    await encaisserALaLivraison(numero);
    const { creerFacture } = await import("./factures");
    await creerFacture(numero);
  }
}

/** Rembourse un colis payé par carte puis le passe en REMBOURSEE. */
async function rembourserColis(s: SousCommandeDoc, montant: number, auteurId: string | null, commentaire: string) {
  const c = await (await db.commandes()).findOne({ numero: s.commandeNumero });
  if (!c || (c.methodePaiement === "A_LA_LIVRAISON" && !s.livreeLe)) return; // rien d'encaissé
  const { rembourse } = await rembourserCommande(s.commandeNumero, montant);
  if (rembourse <= 0) return;
  const total = (s.montantRembourse ?? 0) + rembourse;
  if (total >= montantColis(s)) {
    await transition(s.numero, "REMBOURSEE", auteurId, { commentaire, set: { montantRembourse: total } });
  } else {
    await (await db.sousCommandes()).updateOne({ numero: s.numero }, { $set: { montantRembourse: total } });
  }
}

/* ------------------------------ Côté client ------------------------------ */

/** Annulation par le client (EF-36) : commande entière ou un colis, tant qu'il n'est pas expédié. */
export async function annulerParClient(numero: string, motif?: string) {
  const u = await getUtilisateurCourant();
  const col = await db.sousCommandes();
  const cibles = await col.find({ clientId: u.id, $or: [{ numero }, { commandeNumero: numero }] }).toArray();
  if (!cibles.length) throw new NotFoundError(`commande ${numero}`);
  const annulables = cibles.filter((s) => ["EN_ATTENTE", "ACCEPTEE", "EN_PREPARATION"].includes(s.statut));
  if (!annulables.length) throw new ForbiddenError("Cette commande ne peut plus être annulée (déjà expédiée).");

  const c = await (await db.commandes()).findOne({ numero: cibles[0].commandeNumero });
  if (c?.statut === "EN_ATTENTE_PAIEMENT" && c.methodePaiement !== "A_LA_LIVRAISON") {
    // pas encore payé : on annule directement, sans remboursement
    await libererStock(annulables.flatMap(lignesStock));
    const now = new Date().toISOString();
    for (const s of annulables) {
      await col.updateOne({ numero: s.numero }, { $set: { statut: "ANNULEE" }, $unset: { enAttentePaiement: "" }, $push: { historique: { ancienStatut: s.statut, nouveauStatut: "ANNULEE", auteurId: u.id, commentaire: motif, date: now } } });
    }
    await (await db.paiements()).updateMany({ "objet.reference": c.numero, statut: "EN_ATTENTE" }, { $set: { statut: "ECHOUE", majLe: new Date() } });
    if (annulables.length === cibles.length) await (await db.commandes()).updateOne({ numero: c.numero }, { $set: { statut: "ANNULEE", annuleeLe: now } });
    return { annules: annulables.map((s) => s.numero), rembourse: 0 };
  }

  let rembourse = 0;
  for (const s of annulables) {
    const apres = await transition(s.numero, "ANNULEE", u.id, { commentaire: motif ?? "Annulée par le client" });
    await libererStock(lignesStock(s));
    const avant = apres.montantRembourse ?? 0;
    await rembourserColis(apres, montantColis(apres), null, "Remboursement automatique après annulation");
    rembourse += ((await col.findOne({ numero: s.numero }))?.montantRembourse ?? 0) - avant;
  }
  return { annules: annulables.map((s) => s.numero), rembourse };
}

/* ------------------------------ Côté vendeur ----------------------------- */

async function fournisseurCourant() {
  const u = await getUtilisateurCourant();
  if (!u.fournisseurId) throw new ForbiddenError("Profil fournisseur requis.");
  return { utilisateurId: u.id, fournisseurId: u.fournisseurId };
}

const proprietaire = (fournisseurId: string) => (s: SousCommandeDoc) => {
  if (s.fournisseurId !== fournisseurId) throw new ForbiddenError("Ce colis appartient à un autre vendeur.");
};

export async function sousCommandesRecues() {
  const { fournisseurId } = await fournisseurCourant();
  const docs = await (await db.sousCommandes()).find({ fournisseurId, enAttentePaiement: { $ne: true } }, SANS_ID).sort({ creeLe: -1 }).toArray();
  return docs.map(versSousCommande);
}

export async function getSousCommande(numero: string) {
  const u = await getUtilisateurCourant();
  const s = await (await db.sousCommandes()).findOne({ numero }, SANS_ID);
  if (!s) return null;
  if (u.role === "FOURNISSEUR" && s.fournisseurId !== u.fournisseurId) return null;
  if (u.role === "CLIENT" && s.clientId !== u.id) return null;
  return versSousCommande(s);
}

/**
 * Adresse de livraison d'un colis pour le vendeur : visible seulement une fois le colis accepté
 * (protection des données du client), avec le point choisi sur la carte s'il existe.
 */
export async function adresseLivraisonVendeur(numero: string) {
  const { fournisseurId } = await fournisseurCourant();
  const s = await (await db.sousCommandes()).findOne({ numero, fournisseurId });
  if (!s || ["EN_ATTENTE", "REFUSEE", "ANNULEE"].includes(s.statut)) return null;
  const c = await (await db.commandes()).findOne({ numero: s.commandeNumero }, { projection: { adresse: 1, position: 1 } });
  return c ? { adresse: c.adresse, position: c.position } : null;
}

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

/** Actions proposées au vendeur selon le statut (miroir de TRANSITIONS). */
export function actionsPossibles(statut: StatutSousCommande) {
  switch (statut) {
    case "EN_ATTENTE":
      return ["accepter", "refuser"] as const;
    case "ACCEPTEE":
      return ["preparer"] as const;
    case "EN_PREPARATION":
      return ["expedier", "bordereau"] as const;
    case "EXPEDIEE":
      return ["livrer", "bordereau"] as const;
    default:
      return [] as const;
  }
}

export async function accepterColis(numero: string) {
  const f = await fournisseurCourant();
  return transition(numero, "ACCEPTEE", f.utilisateurId, { controle: proprietaire(f.fournisseurId) });
}

export async function preparerColis(numero: string) {
  const f = await fournisseurCourant();
  return transition(numero, "EN_PREPARATION", f.utilisateurId, { controle: proprietaire(f.fournisseurId) });
}

export async function expedierColis(numero: string, transporteur: string, numeroSuivi: string) {
  const f = await fournisseurCourant();
  return transition(numero, "EXPEDIEE", f.utilisateurId, {
    controle: proprietaire(f.fournisseurId),
    commentaire: `${transporteur} · ${numeroSuivi}`,
    set: { transporteur, numeroSuivi, expedieeLe: new Date().toISOString() },
  });
}

export async function livrerColis(numero: string) {
  const f = await fournisseurCourant();
  return transition(numero, "LIVREE", f.utilisateurId, { controle: proprietaire(f.fournisseurId), set: { livreeLe: new Date().toISOString() } });
}

/** Refus : stock libéré et colis remboursé automatiquement s'il a été payé. */
export async function refuserColis(numero: string, motif: string) {
  const f = await fournisseurCourant();
  const s = await transition(numero, "REFUSEE", f.utilisateurId, { controle: proprietaire(f.fournisseurId), commentaire: motif, set: { motifRefus: motif } });
  await libererStock(lignesStock(s));
  await rembourserColis(s, montantColis(s), null, "Remboursement automatique après refus");
  return s;
}

/* ----------------------------- Administration ---------------------------- */

/** Vue globale des commandes (admin), filtrable par statut et numéro. */
export async function toutesCommandes(filtres: { statut?: StatutCommande; recherche?: string } = {}) {
  const f: Filter<CommandeDoc> = {};
  if (filtres.statut) f.statut = filtres.statut;
  if (filtres.recherche) f.numero = { $regex: filtres.recherche.replace(/[^A-Z0-9-]/gi, ""), $options: "i" };
  return chargerCommandes(f, 100);
}

export async function statistiquesCommandes() {
  const parStatut = await (await db.commandes())
    .aggregate<{ _id: StatutCommande; n: number; total: number }>([{ $group: { _id: "$statut", n: { $sum: 1 }, total: { $sum: "$total" } } }])
    .toArray();
  return parStatut;
}

/** Utilisé par les litiges (remboursement décidé par l'admin). */
export async function rembourserColisParAdmin(numero: string, montant: number, adminId: string) {
  const s = await (await db.sousCommandes()).findOne({ numero });
  if (!s) throw new NotFoundError(`colis ${numero}`);
  await rembourserColis(s, montant, adminId, "Remboursement suite à un litige");
  return (await (await db.sousCommandes()).findOne({ numero }))?.montantRembourse ?? 0;
}
