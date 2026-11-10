// données de démonstration — administration (dossiers, IA-A, modération, litiges, paramètres)
import type {
  AnalyseIA,
  DocumentFournisseur,
  Litige,
  ParametresPlateforme,
  PointVentes,
  Signalement,
} from "@/types/domain";

export const DOSSIERS_INFOS: Record<
  string,
  { email: string; telephone: string; matriculeFiscal: string; numeroRNE: string; ribMasque: string; soumisLe: string }
> = {
  "f-ben-amor": { email: "hedi@palmeraie-ben-amor.tn", telephone: "+216 98 112 233", matriculeFiscal: "1542876/A/M/000", numeroRNE: "B0412872024", ribMasque: "•••• •••• •••• 4821", soumisLe: "2024-03-02T10:00:00+01:00" },
  "f-oasis-douz": { email: "contact@oasis-douz.tn", telephone: "+216 75 470 112", matriculeFiscal: "1620455/B/P/000", numeroRNE: "B1120332024", ribMasque: "•••• •••• •••• 0937", soumisLe: "2024-04-11T10:00:00+01:00" },
  "f-delices-nefta": { email: "atelier@delices-nefta.tn", telephone: "+216 76 430 908", matriculeFiscal: "1703321/C/M/000", numeroRNE: "B2203412025", ribMasque: "•••• •••• •••• 2210", soumisLe: "2025-01-20T10:00:00+01:00" },
  "f-djerid": { email: "sami@dattes-djerid.tn", telephone: "+216 97 300 451", matriculeFiscal: "1711098/A/M/000", numeroRNE: "B2210982025", ribMasque: "•••• •••• •••• 7745", soumisLe: "2025-02-08T10:00:00+01:00" },
  "f-rob-gabes": { email: "nizar@maison-rob.tn", telephone: "+216 75 271 664", matriculeFiscal: "1588420/B/M/000", numeroRNE: "B0887412024", ribMasque: "•••• •••• •••• 5512", soumisLe: "2024-05-15T10:00:00+01:00" },
  "f-el-hamma": { email: "ferme.elhamma@exemple.tn", telephone: "+216 52 908 117", matriculeFiscal: "1820667/A/P/000", numeroRNE: "B3108472026", ribMasque: "•••• •••• •••• 3306", soumisLe: "2026-10-15T16:20:00+01:00" },
};

/** Dossiers supplémentaires en attente (candidats non encore boutiques). */
export const CANDIDATS_EN_ATTENTE = [
  { id: "cand-1", nomBoutique: "Oasis de Chebika", gerant: "Mourad Ferchichi", region: "TOZEUR" as const, type: "PRODUCTEUR" as const, soumisLe: "2026-10-17T11:00:00+01:00" },
  { id: "cand-2", nomBoutique: "Saveurs de Kébili", gerant: "Najet Ben Salem", region: "KEBILI" as const, type: "REVENDEUR" as const, soumisLe: "2026-10-16T09:30:00+01:00" },
];

export const DOCUMENTS_FOURNISSEURS: DocumentFournisseur[] = [
  { id: "doc-1", fournisseurId: "f-el-hamma", type: "CIN", nomFichier: "cin-recto-verso.jpg", deposeLe: "2026-10-15T16:10:00+01:00", valide: null },
  { id: "doc-2", fournisseurId: "f-el-hamma", type: "RNE", nomFichier: "extrait-rne-2026.pdf", deposeLe: "2026-10-15T16:12:00+01:00", valide: null },
  { id: "doc-3", fournisseurId: "f-el-hamma", type: "PATENTE", nomFichier: "patente.jpg", deposeLe: "2026-10-15T16:15:00+01:00", valide: null },
  { id: "doc-4", fournisseurId: "f-ben-amor", type: "CIN", nomFichier: "cin.jpg", deposeLe: "2024-03-02T10:00:00+01:00", valide: true },
  { id: "doc-5", fournisseurId: "f-ben-amor", type: "RNE", nomFichier: "rne.pdf", deposeLe: "2024-03-02T10:00:00+01:00", valide: true },
  { id: "doc-6", fournisseurId: "f-ben-amor", type: "PATENTE", nomFichier: "patente.pdf", deposeLe: "2024-03-02T10:00:00+01:00", valide: true },
  { id: "doc-7", fournisseurId: "f-ben-amor", type: "ATTESTATION_BIO", nomFichier: "bio-ecocert.pdf", deposeLe: "2024-03-02T10:00:00+01:00", valide: true },
];

export const ANALYSES_IA: AnalyseIA[] = [
  {
    fournisseurId: "f-el-hamma",
    scoreConfiance: 86,
    analyseLe: "2026-10-15T16:21:00+01:00",
    champs: [
      { champ: "Nom et prénom", document: "CIN", valeurSaisie: "Ben Amor Hédi", valeurLue: "Hédi Ben Amour", statut: "DIFFERENCE" },
      { champ: "Numéro CIN", document: "CIN", valeurSaisie: "09 412 873", valeurLue: "09 412 873", statut: "OK" },
      { champ: "Date de naissance", document: "CIN", valeurSaisie: "14/02/1991", valeurLue: "14/02/1991", statut: "OK" },
      { champ: "Raison sociale", document: "RNE", valeurSaisie: "Ferme El Hamma", valeurLue: "Ferme El Hamma SUARL", statut: "OK" },
      { champ: "Numéro RNE", document: "RNE", valeurSaisie: "B3108472026", valeurLue: "B3108472026", statut: "OK" },
      { champ: "Activité", document: "PATENTE", valeurSaisie: "Production de dattes", valeurLue: "Agriculture — phœniciculture", statut: "OK" },
      { champ: "Date d'expiration", document: "PATENTE", valeurSaisie: "—", valeurLue: "10/11/2026", statut: "OK" },
      { champ: "Cachet de l'administration", document: "PATENTE", valeurSaisie: "—", valeurLue: null, statut: "ILLISIBLE" },
    ],
    alertes: [
      "Patente : date d'expiration dans 23 jours.",
      "Le nom saisi diffère légèrement du nom lu sur la CIN (« Ben Amor » / « Ben Amour »).",
      "Attestation bio absente : le badge « Bio » ne pourra pas être affiché.",
    ],
  },
];

export const SIGNALEMENTS: Signalement[] = [
  { id: "sg-1", cibleType: "AVIS", cibleLibelle: "Avis sur « Deglet Nour dénoyautée »", motif: "Propos injurieux", auteur: "Les Délices de Nefta", statut: "OUVERT", creeLe: "2026-10-17T14:00:00+01:00", extrait: "« Arnaque totale, ne commandez jamais chez ces… »" },
  { id: "sg-2", cibleType: "PRODUIT", cibleLibelle: "« Medjool Royal 1er choix »", motif: "Variété douteuse (photos de Deglet Nour)", auteur: "Sarra M.", statut: "OUVERT", creeLe: "2026-10-16T19:20:00+01:00", extrait: "Photos ne correspondant pas à la variété annoncée." },
  { id: "sg-3", cibleType: "MESSAGE", cibleLibelle: "Message à Coopérative Oasis de Douz", motif: "Démarchage hors plateforme", auteur: "Coopérative Oasis de Douz", statut: "OUVERT", creeLe: "2026-10-15T08:45:00+01:00", extrait: "« Payez-moi directement par virement, c'est moins cher… »" },
  { id: "sg-4", cibleType: "FOURNISSEUR", cibleLibelle: "Boutique « Dattes Express 24 »", motif: "Délais non respectés", auteur: "Karim O.", statut: "TRAITE", creeLe: "2026-10-10T10:00:00+01:00", extrait: "Trois commandes sans expédition depuis 10 jours." },
  { id: "sg-5", cibleType: "AVIS", cibleLibelle: "Avis sur « Rob de datte au feu de bois »", motif: "Avis hors sujet", auteur: "Maison Rob Gabès", statut: "REJETE", creeLe: "2026-10-05T12:00:00+01:00", extrait: "« Livreur pas aimable » — concerne le transporteur." },
];

export const LITIGES: Litige[] = [
  {
    id: "lt-1", numero: "LIT-2026-0042", sousCommandeNumero: "DGL-2026-000131-A", client: "Mehdi T.", fournisseurNom: "Dattes du Djérid", motif: "ABIME", statut: "OUVERT", montant: 35800, ouvertLe: "2026-10-17T09:00:00+01:00",
    description: "La boîte est arrivée écrasée, une partie des dattes est inconsommable.",
    echanges: [
      { auteur: "client", nom: "Mehdi T.", contenu: "Colis écrasé à la réception, photos jointes. Je souhaite un remboursement partiel.", date: "2026-10-17T09:00:00+01:00" },
      { auteur: "vendeur", nom: "Dattes du Djérid", contenu: "Nous sommes désolés. Le transporteur a confirmé un choc. Nous proposons un renvoi.", date: "2026-10-17T13:20:00+01:00" },
    ],
  },
  {
    id: "lt-2", numero: "LIT-2026-0041", sousCommandeNumero: "DGL-2026-000127-A", client: "Rania H.", fournisseurNom: "Coopérative Oasis de Douz", motif: "NON_RECU", statut: "EN_EXAMEN", montant: 45000, ouvertLe: "2026-10-14T18:00:00+01:00",
    description: "Colis indiqué livré mais jamais reçu.",
    echanges: [
      { auteur: "client", nom: "Rania H.", contenu: "Le suivi indique « livré » mais je n'ai rien reçu.", date: "2026-10-14T18:00:00+01:00" },
      { auteur: "admin", nom: "Équipe DEGLA", contenu: "Nous avons ouvert une enquête auprès de Rapid-Poste.", date: "2026-10-15T10:00:00+01:00" },
    ],
  },
  {
    id: "lt-3", numero: "LIT-2026-0038", sousCommandeNumero: "DGL-2026-000109-B", client: "Sarra M.", fournisseurNom: "Les Délices de Nefta", motif: "NON_CONFORME", statut: "RESOLU_CLIENT", montant: 35100, ouvertLe: "2026-09-26T10:00:00+01:00",
    description: "Le coffret reçu ne contenait pas de pot de confiture.",
    echanges: [
      { auteur: "client", nom: "Sarra M.", contenu: "Il manque le pot de confiture annoncé.", date: "2026-09-26T10:00:00+01:00" },
      { auteur: "admin", nom: "Équipe DEGLA", contenu: "Remboursement intégral accordé.", date: "2026-09-30T11:00:00+01:00" },
    ],
  },
  {
    id: "lt-4", numero: "LIT-2026-0031", sousCommandeNumero: "DGL-2026-000098-A", client: "Leila G.", fournisseurNom: "Palmeraie Ben Amor", motif: "AUTRE", statut: "CLOS", montant: 0, ouvertLe: "2026-09-12T10:00:00+01:00",
    description: "Erreur d'adresse, colis réexpédié.",
    echanges: [{ auteur: "admin", nom: "Équipe DEGLA", contenu: "Colis réexpédié à la bonne adresse, litige clos.", date: "2026-09-14T09:00:00+01:00" }],
  },
];

export const PARAMETRES: ParametresPlateforme = {
  tauxCommission: 8,
  fraisLivraisonDefaut: 7000,
  livraisonGratuiteDes: 80000,
  creditsOffertsInscription: 3,
  coutCreditsImage: 1,
  coutCreditsMultiImage: 2,
  seuilCreditsBas: 3,
  delaiMax3DMinutes: 30,
};

/** CA plateforme sur 30 jours. */
export const VENTES_PLATEFORME: PointVentes[] = Array.from({ length: 30 }, (_, i) => {
  const ca = Math.round((2400000 + (Math.sin(i * 0.9) + 1) * 900000 + i * 42000) / 100) * 100;
  return { date: new Date(Date.UTC(2026, 9, 18 - 29 + i)).toISOString(), chiffreAffaires: ca, commandes: Math.round(ca / 46000) };
});
