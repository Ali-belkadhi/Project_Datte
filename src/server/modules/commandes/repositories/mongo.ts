// MODULE C — Commandes (Karim Ouertatani) — accès MongoDB (collections, index, amorçage de démo).
import "server-only";
import type { Collection } from "mongodb";
import { COMMANDES_ACHETEUR, PANIER_DEMO, SOUS_COMMANDES_VENDEUR } from "@/mocks/commandes";
import { AVIS } from "@/mocks/avis";
import { LITIGES } from "@/mocks/admin";
import { VERSEMENTS } from "@/mocks/ventes";
import { getDb } from "@/server/core/mongo";
import type { ObjetPaiement } from "@/server/contracts/commandes";
import type { Adresse, Avis, Commande, Litige, SousCommande, Versement } from "@/types/domain";
import type { MethodePaiement, StatutCommande, StatutPaiement, StatutSousCommande } from "@/types/enums";

/* ------------------------------- Documents ------------------------------- */

export type HistoriqueStatut = {
  ancienStatut: StatutSousCommande | null;
  nouveauStatut: StatutSousCommande;
  auteurId: string | null; // null = système
  commentaire?: string;
  date: string;
};

export type CommandeDoc = Omit<Commande, "sousCommandes" | "id"> & {
  clientId: string;
  codePromo?: string;
  paiementReference?: string;
  annuleeLe?: string;
};

export type SousCommandeDoc = Omit<SousCommande, "etapes" | "id"> & {
  clientId: string;
  historique: HistoriqueStatut[];
  motifRefus?: string;
  expedieeLe?: string;
  livreeLe?: string;
  montantRembourse?: number;
  /** Part de la remise (code promo) affectée à ce colis, en millimes. */
  remise?: number;
  /** Paiement par carte pas encore confirmé : le colis est invisible pour le vendeur. */
  enAttentePaiement?: boolean;
  /** Versement fournisseur qui inclut ce colis. */
  versementId?: string;
};

export type LignePanierDoc = { produitId: string; quantiteGrammes?: number; quantiteUnites?: number };
export type PanierDoc = { proprietaire: string; lignes: LignePanierDoc[]; codePromo?: string; majLe: Date };

export type PaiementDoc = {
  reference: string;
  objet: ObjetPaiement;
  montant: number; // millimes
  methode: MethodePaiement;
  statut: StatutPaiement;
  referenceExterne?: string; // id de session Stripe
  paymentIntent?: string;
  urlPaiement?: string;
  reponseBrute?: unknown;
  montantRembourse: number;
  payeLe?: Date;
  creeLe: Date;
  majLe: Date;
};

export type CodePromoDoc = {
  code: string;
  type: "POURCENTAGE" | "MONTANT_FIXE";
  valeur: number; // % ou millimes
  fournisseurId?: string | null;
  montantMinimum: number;
  debut: Date;
  fin: Date;
  utilisationsMax?: number | null;
  utilisations: number;
  actif: boolean;
};

export type FactureDoc = { numero: string; commandeNumero: string; emiseLe: Date };
export type AvisDoc = Avis & { clientId: string | null; ligneCommandeId: string; statut: "VISIBLE" | "MASQUE" };
export type LitigeDoc = Litige & { clientId: string; montantRembourse?: number; adminId?: string; clotureLe?: string };
export type VersementDoc = Versement & { fournisseurId: string; sousCommandes: string[] };

/* ------------------------------ Collections ------------------------------ */

async function col<T extends object>(nom: string): Promise<Collection<T>> {
  await amorcer();
  return (await getDb()).collection<T>(nom);
}

export const db = {
  commandes: () => col<CommandeDoc>("commandes"),
  sousCommandes: () => col<SousCommandeDoc>("sousCommandes"),
  paniers: () => col<PanierDoc>("paniers"),
  paiements: () => col<PaiementDoc>("paiements"),
  evenementsStripe: () => col<{ _id: string; type: string; recuLe: Date }>("evenementsStripe"),
  codesPromo: () => col<CodePromoDoc>("codesPromo"),
  factures: () => col<FactureDoc>("factures"),
  avis: () => col<AvisDoc>("avis"),
  litiges: () => col<LitigeDoc>("litiges"),
  versements: () => col<VersementDoc>("versements"),
};

export const SANS_ID = { projection: { _id: 0 } } as const;

/** Compteur atomique (numéros de commande, de litige, de facture). */
export async function prochainNumero(nom: string, depart: number) {
  const c = (await getDb()).collection<{ _id: string; seq: number }>("compteurs");
  const r = await c.findOneAndUpdate({ _id: nom }, { $inc: { seq: 1 } }, { upsert: true, returnDocument: "after" });
  return depart + (r?.seq ?? 1);
}

/* ------------------------------- Amorçage -------------------------------- */

let amorcage: Promise<void> | null = null;

/** Index + données de démonstration, une seule fois par base (désactivable : MONGODB_DEMO=false). */
function amorcer() {
  amorcage ??= (async () => {
    const base = await getDb();
    await Promise.all([
      base.collection("commandes").createIndex({ numero: 1 }, { unique: true }),
      base.collection("commandes").createIndex({ clientId: 1, creeLe: -1 }),
      base.collection("sousCommandes").createIndex({ numero: 1 }, { unique: true }),
      base.collection("sousCommandes").createIndex({ commandeNumero: 1 }),
      base.collection("sousCommandes").createIndex({ fournisseurId: 1, creeLe: -1 }),
      base.collection("paniers").createIndex({ proprietaire: 1 }, { unique: true }),
      base.collection("paiements").createIndex({ reference: 1 }, { unique: true }),
      base.collection("paiements").createIndex({ referenceExterne: 1 }, { sparse: true }),
      base.collection("codesPromo").createIndex({ code: 1 }, { unique: true }),
      base.collection("factures").createIndex({ commandeNumero: 1 }, { unique: true }),
      base.collection("avis").createIndex({ ligneCommandeId: 1 }, { unique: true }),
      base.collection("avis").createIndex({ produitId: 1 }),
      base.collection("litiges").createIndex({ id: 1 }, { unique: true }),
    ]);
    if (process.env.MONGODB_DEMO === "false") return;
    const meta = base.collection<{ _id: string; le: Date }>("meta");
    if (await meta.findOne({ _id: "demo-module-c" })) return;
    await insererDemo();
    await meta.insertOne({ _id: "demo-module-c", le: new Date() });
  })().catch((e) => {
    amorcage = null; // nouvel essai au prochain appel (ex. MongoDB démarré après Next)
    throw e;
  });
  return amorcage;
}

const ADRESSE_DEMO: Adresse = {
  id: "adr-demo",
  libelle: "Domicile",
  destinataire: "Client DEGLA",
  ligne1: "12 rue de la Palmeraie",
  ville: "Tunis",
  gouvernorat: "TUNIS",
  codePostal: "1000",
  telephone: "+216 20 000 000",
  parDefaut: true,
};

const ORDRE: StatutSousCommande[] = ["EN_ATTENTE", "ACCEPTEE", "EN_PREPARATION", "EXPEDIEE", "LIVREE"];

/** Historique plausible jusqu'au statut actuel (données de démo). */
function historiqueDemo(statut: StatutSousCommande, creeLe: string): HistoriqueStatut[] {
  const t0 = new Date(creeLe).getTime();
  const h: HistoriqueStatut[] = [{ ancienStatut: null, nouveauStatut: "EN_ATTENTE", auteurId: null, date: creeLe }];
  const cible = ORDRE.indexOf(statut);
  if (cible > 0) {
    for (let i = 1; i <= cible; i++) {
      h.push({ ancienStatut: ORDRE[i - 1], nouveauStatut: ORDRE[i], auteurId: null, date: new Date(t0 + i * 26 * 3600e3).toISOString() });
    }
  } else if (statut !== "EN_ATTENTE") {
    h.push({ ancienStatut: "EN_ATTENTE", nouveauStatut: statut, auteurId: null, date: new Date(t0 + 5 * 3600e3).toISOString() });
  }
  return h;
}

function versDoc(s: SousCommande, clientId: string): SousCommandeDoc {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { etapes, id, ...reste } = s;
  return {
    ...reste,
    lignes: s.lignes.map((l, j) => ({ ...l, id: `${s.numero}-${j + 1}` })),
    clientId,
    historique: historiqueDemo(s.statut, s.creeLe),
    expedieeLe: ["EXPEDIEE", "LIVREE"].includes(s.statut) ? s.creeLe : undefined,
    livreeLe: s.statut === "LIVREE" ? s.creeLe : undefined,
  };
}

const statutCommandeDemo = (statuts: StatutSousCommande[]): StatutCommande =>
  statuts.every((s) => s === "LIVREE") ? "LIVREE" : statuts.every((s) => ["ANNULEE", "REFUSEE"].includes(s)) ? "ANNULEE" : "PAYEE";

async function insererDemo() {
  const base = await getDb();
  const commandes: CommandeDoc[] = [];
  const sousCommandes = new Map<string, SousCommandeDoc>();

  for (const c of COMMANDES_ACHETEUR) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { sousCommandes: sc, id, ...entete } = c;
    commandes.push({ ...entete, clientId: "u-sarra" });
    for (const s of sc) sousCommandes.set(s.numero, versDoc(s, "u-sarra"));
  }
  SOUS_COMMANDES_VENDEUR.forEach((s, i) => {
    if (sousCommandes.has(s.numero)) return;
    const clientId = `u-demo-${i}`;
    sousCommandes.set(s.numero, versDoc(s, clientId));
    if (!commandes.some((c) => c.numero === s.commandeNumero)) {
      commandes.push({
        numero: s.commandeNumero,
        clientId,
        creeLe: s.creeLe,
        statut: statutCommandeDemo([s.statut]),
        adresse: { ...ADRESSE_DEMO, destinataire: s.client.prenom, ville: s.client.ville },
        methodePaiement: "CARTE",
        sousTotal: s.sousTotal,
        fraisLivraison: s.fraisLivraison,
        remise: 0,
        total: s.sousTotal + s.fraisLivraison,
      });
    }
  });

  const now = new Date();
  const finAnnee = new Date(Date.UTC(now.getUTCFullYear() + 1, 11, 31));
  await Promise.all([
    base.collection<CommandeDoc>("commandes").insertMany(commandes),
    base.collection<SousCommandeDoc>("sousCommandes").insertMany([...sousCommandes.values()]),
    base.collection<PanierDoc>("paniers").updateOne(
      { proprietaire: "u-sarra" },
      { $setOnInsert: { proprietaire: "u-sarra", lignes: PANIER_DEMO, majLe: now } },
      { upsert: true },
    ),
    base.collection<CodePromoDoc>("codesPromo").insertMany([
      { code: "DEGLA10", type: "POURCENTAGE", valeur: 10, fournisseurId: null, montantMinimum: 0, debut: now, fin: finAnnee, utilisationsMax: null, utilisations: 0, actif: true },
      { code: "BIENVENUE5", type: "MONTANT_FIXE", valeur: 5000, fournisseurId: null, montantMinimum: 30000, debut: now, fin: finAnnee, utilisationsMax: 500, utilisations: 0, actif: true },
      { code: "BENAMOR15", type: "POURCENTAGE", valeur: 15, fournisseurId: "f-ben-amor", montantMinimum: 20000, debut: now, fin: finAnnee, utilisationsMax: null, utilisations: 0, actif: true },
    ]),
    base.collection<AvisDoc>("avis").insertMany(AVIS.map((a) => ({ ...a, clientId: null, ligneCommandeId: `demo-${a.id}`, statut: "VISIBLE" as const }))),
    base.collection<LitigeDoc>("litiges").insertMany(LITIGES.map((l) => ({ ...l, clientId: "u-demo" }))),
    base.collection<VersementDoc>("versements").insertMany(VERSEMENTS.map((v) => ({ ...v, fournisseurId: "f-ben-amor", sousCommandes: [] }))),
  ]);
}
