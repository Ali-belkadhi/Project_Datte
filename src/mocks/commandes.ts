// données de démonstration — commandes de l'acheteur et sous-commandes reçues par le vendeur
import type {
  Commande,
  EtapeSuivi,
  LigneCommande,
  SousCommande,
} from "@/types/domain";
import type { StatutSousCommande } from "@/types/enums";
import { ADRESSES } from "./utilisateurs";
import { FOURNISSEURS } from "./fournisseurs";
import { PRODUITS } from "./produits";
import { VARIETES } from "./varietes";

/* ------------------------------ Helpers ------------------------------ */

const ETAPES = [
  ["PAYEE", "Payée"],
  ["ACCEPTEE", "Acceptée"],
  ["EN_PREPARATION", "En préparation"],
  ["EXPEDIEE", "Expédiée"],
  ["LIVREE", "Livrée"],
] as const;

const RANG: Partial<Record<StatutSousCommande, number>> = {
  EN_ATTENTE: 0,
  ACCEPTEE: 1,
  EN_PREPARATION: 2,
  EXPEDIEE: 3,
  LIVREE: 4,
};

function etapes(statut: StatutSousCommande, debut: string): EtapeSuivi[] {
  const rang = RANG[statut];
  const t0 = new Date(debut).getTime();
  return ETAPES.map(([cle, libelle], i) => {
    if (rang === undefined) {
      // refusée / annulée / remboursée : seule l'étape « Payée » est terminée
      return { cle, libelle, etat: i === 0 ? "terminee" : "a-venir", date: i === 0 ? debut : undefined };
    }
    const etat = i < rang ? "terminee" : i === rang ? (i === 4 ? "terminee" : "en-cours") : "a-venir";
    return {
      cle,
      libelle,
      etat,
      date: i <= rang ? new Date(t0 + i * 20 * 3600 * 1000).toISOString() : undefined,
    };
  });
}

function ligne(produitId: string, quantite: number, i: number): LigneCommande {
  const p = PRODUITS.find((x) => x.id === produitId)!;
  const variete = p.variete ? VARIETES.find((v) => v.slug === p.variete) : undefined;
  if (p.typeProduit === "DATTE") {
    return {
      id: `lc-${produitId}-${i}`,
      produitId,
      slug: p.slug,
      nomProduit: p.nom,
      nomVariete: variete?.nom,
      variete: p.variete,
      visuel: p.visuel.type,
      typeProduit: "DATTE",
      quantiteGrammes: quantite,
      prixUnitaire: p.prixParKg,
      total: Math.round((p.prixParKg * quantite) / 1000),
    };
  }
  return {
    id: `lc-${produitId}-${i}`,
    produitId,
    slug: p.slug,
    nomProduit: p.nom,
    nomVariete: variete?.nom,
    variete: p.variete,
    visuel: p.visuel.type,
    typeProduit: "DERIVE",
    quantiteUnites: quantite,
    prixUnitaire: p.prixUnitaire,
    total: p.prixUnitaire * quantite,
  };
}

type SousCommandeInput = {
  numero: string;
  commandeNumero: string;
  fournisseurId: string;
  client?: SousCommande["client"];
  statut: StatutSousCommande;
  lignes: [string, number][];
  creeLe: string;
  frais?: number;
  transporteur?: string;
  numeroSuivi?: string;
};

function sousCommande(s: SousCommandeInput): SousCommande {
  const f = FOURNISSEURS.find((x) => x.id === s.fournisseurId)!;
  const lignes = s.lignes.map(([id, q], i) => ligne(id, q, i));
  const sousTotal = lignes.reduce((acc, l) => acc + l.total, 0);
  return {
    id: `sc-${s.numero}`,
    numero: s.numero,
    commandeNumero: s.commandeNumero,
    fournisseurId: f.id,
    fournisseurNom: f.nomBoutique,
    client: s.client ?? { prenom: "Sarra", ville: "Tunis", initiales: "SM" },
    statut: s.statut,
    lignes,
    sousTotal,
    fraisLivraison: s.frais ?? (sousTotal >= 80000 ? 0 : 7000),
    commission: Math.round(sousTotal * 0.08),
    transporteur: s.transporteur,
    numeroSuivi: s.numeroSuivi,
    creeLe: s.creeLe,
    etapes: etapes(s.statut, s.creeLe),
  };
}

function commande(
  numero: string,
  statut: Commande["statut"],
  creeLe: string,
  sous: SousCommande[],
  remise = 0,
): Commande {
  const sousTotal = sous.reduce((a, s) => a + s.sousTotal, 0);
  const fraisLivraison = sous.reduce((a, s) => a + s.fraisLivraison, 0);
  return {
    id: `cmd-${numero}`,
    numero,
    creeLe,
    statut,
    sousCommandes: sous,
    adresse: ADRESSES[0],
    methodePaiement: statut === "EN_ATTENTE_PAIEMENT" ? "KONNECT" : numero.endsWith("8") ? "A_LA_LIVRAISON" : "KONNECT",
    sousTotal,
    fraisLivraison,
    remise,
    total: sousTotal + fraisLivraison - remise,
  };
}

/* ----------------------- Commandes de l'acheteur ---------------------- */

export const COMMANDES_ACHETEUR: Commande[] = [
  commande("DGL-2026-000123", "PAYEE", "2026-10-17T18:40:00+01:00", [
    sousCommande({
      numero: "DGL-2026-000123-A",
      commandeNumero: "DGL-2026-000123",
      fournisseurId: "f-ben-amor",
      statut: "EN_PREPARATION",
      lignes: [["p01", 2000], ["p19", 2]],
      creeLe: "2026-10-17T18:40:00+01:00",
    }),
    sousCommande({
      numero: "DGL-2026-000123-B",
      commandeNumero: "DGL-2026-000123",
      fournisseurId: "f-delices-nefta",
      statut: "EXPEDIEE",
      lignes: [["p18", 2]],
      creeLe: "2026-10-17T18:40:00+01:00",
      transporteur: "Aramex Tunisie",
      numeroSuivi: "ARX-TN-48213907",
    }),
  ]),
  commande("DGL-2026-000121", "EN_ATTENTE_PAIEMENT", "2026-10-16T12:05:00+01:00", [
    sousCommande({
      numero: "DGL-2026-000121-A",
      commandeNumero: "DGL-2026-000121",
      fournisseurId: "f-rob-gabes",
      statut: "EN_ATTENTE",
      lignes: [["p20", 1], ["p21", 1]],
      creeLe: "2026-10-16T12:05:00+01:00",
    }),
  ]),
  commande("DGL-2026-000120", "PAYEE", "2026-10-14T09:20:00+01:00", [
    sousCommande({
      numero: "DGL-2026-000120-A",
      commandeNumero: "DGL-2026-000120",
      fournisseurId: "f-oasis-douz",
      statut: "EXPEDIEE",
      lignes: [["p06", 1000]],
      creeLe: "2026-10-14T09:20:00+01:00",
      transporteur: "Rapid-Poste",
      numeroSuivi: "RP-2026-771045",
    }),
  ]),
  commande("DGL-2026-000118", "LIVREE", "2026-10-03T16:10:00+01:00", [
    sousCommande({
      numero: "DGL-2026-000118-A",
      commandeNumero: "DGL-2026-000118",
      fournisseurId: "f-oasis-douz",
      statut: "LIVREE",
      lignes: [["p02", 5000], ["p22", 1]],
      creeLe: "2026-10-03T16:10:00+01:00",
      transporteur: "Rapid-Poste",
      numeroSuivi: "RP-2026-702318",
    }),
  ]),
  commande(
    "DGL-2026-000109",
    "PARTIELLEMENT_LIVREE",
    "2026-09-22T11:00:00+01:00",
    [
      sousCommande({
        numero: "DGL-2026-000109-A",
        commandeNumero: "DGL-2026-000109",
        fournisseurId: "f-ben-amor",
        statut: "LIVREE",
        lignes: [["p07", 1000]],
        creeLe: "2026-09-22T11:00:00+01:00",
        transporteur: "Aramex Tunisie",
        numeroSuivi: "ARX-TN-47011236",
      }),
      sousCommande({
        numero: "DGL-2026-000109-B",
        commandeNumero: "DGL-2026-000109",
        fournisseurId: "f-delices-nefta",
        statut: "REMBOURSEE",
        lignes: [["p23", 1]],
        creeLe: "2026-09-22T11:00:00+01:00",
      }),
    ],
    5000,
  ),
  commande("DGL-2026-000104", "ANNULEE", "2026-09-10T20:30:00+01:00", [
    sousCommande({
      numero: "DGL-2026-000104-A",
      commandeNumero: "DGL-2026-000104",
      fournisseurId: "f-djerid",
      statut: "ANNULEE",
      lignes: [["p09", 2000]],
      creeLe: "2026-09-10T20:30:00+01:00",
    }),
  ]),
];

/* -------------------- Sous-commandes reçues (vendeur) ------------------ */

const CLIENTS: SousCommande["client"][] = [
  { prenom: "Sarra", ville: "Tunis", initiales: "SM" },
  { prenom: "Youssef", ville: "Sfax", initiales: "YK" },
  { prenom: "Ines", ville: "Sousse", initiales: "IB" },
  { prenom: "Mehdi", ville: "Bizerte", initiales: "MT" },
  { prenom: "Rania", ville: "Nabeul", initiales: "RH" },
  { prenom: "Karim", ville: "Ariana", initiales: "KO" },
  { prenom: "Leila", ville: "Monastir", initiales: "LG" },
  { prenom: "Tarek", ville: "Tozeur", initiales: "TJ" },
  { prenom: "Meriem", ville: "La Marsa", initiales: "MA" },
];

const STATUTS_VENDEUR: StatutSousCommande[] = [
  "EN_ATTENTE", "EN_ATTENTE", "EN_ATTENTE", "EN_ATTENTE",
  "ACCEPTEE", "ACCEPTEE", "ACCEPTEE",
  "EN_PREPARATION", "EN_PREPARATION", "EN_PREPARATION",
  "EXPEDIEE", "EXPEDIEE", "EXPEDIEE",
  "LIVREE", "LIVREE", "LIVREE",
  "REFUSEE", "ANNULEE",
];

const LIGNES_VENDEUR: [string, number][][] = [
  [["p01", 2000]],
  [["p07", 1000], ["p24", 1]],
  [["p08", 3000]],
  [["p03", 1000], ["p19", 2]],
  [["p01", 1000]],
  [["p24", 2]],
  [["p01", 5000]],
  [["p07", 500], ["p03", 500]],
  [["p08", 2000], ["p19", 1]],
  [["p01", 2000], ["p24", 1]],
  [["p03", 2000]],
  [["p19", 4]],
  [["p01", 1000], ["p08", 1000]],
  [["p07", 1000]],
  [["p01", 2000]],
  [["p24", 1], ["p19", 2]],
  [["p08", 5000]],
  [["p03", 1000]],
];

export const SOUS_COMMANDES_VENDEUR: SousCommande[] = STATUTS_VENDEUR.map((statut, i) => {
  const num = 150 - i;
  const jour = 18 - Math.floor(i * 0.9);
  return sousCommande({
    numero: `DGL-2026-000${num}-A`,
    commandeNumero: `DGL-2026-000${num}`,
    fournisseurId: "f-ben-amor",
    client: CLIENTS[i % CLIENTS.length],
    statut,
    lignes: LIGNES_VENDEUR[i],
    creeLe: new Date(Date.UTC(2026, 9, jour, 7 + (i % 10), (i * 17) % 60)).toISOString(),
    transporteur: ["EXPEDIEE", "LIVREE"].includes(statut) ? "Aramex Tunisie" : undefined,
    numeroSuivi: ["EXPEDIEE", "LIVREE"].includes(statut) ? `ARX-TN-48${String(300000 + i * 731)}` : undefined,
  });
});

/* -------------------------- Panier de démo ---------------------------- */

/** Panier pré-rempli : 3 lignes chez 2 vendeurs. */
export const PANIER_DEMO: { produitId: string; quantiteGrammes?: number; quantiteUnites?: number }[] = [
  { produitId: "p01", quantiteGrammes: 2000 },
  { produitId: "p19", quantiteUnites: 1 },
  { produitId: "p17", quantiteUnites: 2 },
];

