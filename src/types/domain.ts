/**
 * Types du domaine utilisés par l'interface (DTO).
 * Plus tard, les repositories Prisma convertiront les modèles Prisma vers ces types :
 * l'interface ne dépend jamais directement de Prisma.
 *
 * Unités : montants en millimes (1 DT = 1000), poids en grammes.
 */
import type {
  CategorieQualite,
  CibleSignalement,
  Gouvernorat,
  Maturite,
  MethodePaiement,
  MotifLitige,
  Presentation,
  Role,
  Statut3D,
  StatutCommande,
  StatutLitige,
  StatutProduit,
  StatutSousCommande,
  StatutTraitement,
  StatutVerification,
  StatutVersement,
  TypeDerive,
  TypeDocument,
  TypeFournisseur,
  TypeMouvementCredit,
  TypeNotification,
} from "./enums";
import type { ModelSource, VarieteSlug } from "./model-source";

export type { ModelSource, VarieteSlug } from "./model-source";

/* ------------------------------------------------------------------ */
/* Comptes (module A)                                                  */
/* ------------------------------------------------------------------ */

export interface Utilisateur {
  id: string;
  prenom: string;
  nom: string;
  email: string;
  telephone?: string;
  telephoneVerifie: boolean;
  role: Role;
  ville: string;
  initiales: string;
  /** Pour un fournisseur : identifiant de sa boutique. */
  fournisseurId?: string;
}

export interface Session {
  utilisateur: Utilisateur;
  /** Session factice : toujours `true` dans le template. */
  demo: true;
}

export interface Adresse {
  id: string;
  libelle: string;
  destinataire: string;
  ligne1: string;
  ligne2?: string;
  ville: string;
  gouvernorat: Gouvernorat;
  codePostal: string;
  telephone: string;
  parDefaut: boolean;
}

export interface Fournisseur {
  id: string;
  slug: string;
  nomBoutique: string;
  gerant: string;
  type: TypeFournisseur;
  region: Gouvernorat;
  ville: string;
  description: string;
  histoire: string;
  noteMoyenne: number;
  nombreAvis: number;
  nombreVentes: number;
  statutVerification: StatutVerification;
  verifie: boolean;
  /** Année d'inscription. */
  depuis: number;
  /** Clé de teinte d'avatar / bannière (voir lib/constants SHOP_TINTS). */
  couleur: ShopTint;
  delaiExpedition: string;
  varietes: VarieteSlug[];
}

export type ShopTint = "amber" | "date" | "palm" | "clay" | "night";

export interface DocumentFournisseur {
  id: string;
  fournisseurId: string;
  type: TypeDocument;
  nomFichier: string;
  deposeLe: string;
  valide: boolean | null;
}

export type StatutChampIA = "OK" | "DIFFERENCE" | "ILLISIBLE";

export interface ChampAnalyseIA {
  champ: string;
  document: TypeDocument;
  valeurSaisie: string;
  valeurLue: string | null;
  statut: StatutChampIA;
}

export interface AnalyseIA {
  fournisseurId: string;
  scoreConfiance: number; // 0..100
  analyseLe: string;
  champs: ChampAnalyseIA[];
  alertes: string[];
}

export interface Notification {
  id: string;
  type: TypeNotification;
  titre: string;
  contenu: string;
  lien?: string;
  lue: boolean;
  creeLe: string; // ISO
}

export interface Message {
  id: string;
  conversationId: string;
  auteur: "moi" | "autre";
  contenu: string;
  envoyeLe: string; // ISO
  lu: boolean;
}

export interface Conversation {
  id: string;
  interlocuteur: string;
  interlocuteurInitiales: string;
  couleur: ShopTint;
  sujet: string;
  produitNom?: string;
  dernierMessage: string;
  dernierMessageLe: string;
  nonLus: number;
  messages: Message[];
}

/* ------------------------------------------------------------------ */
/* Catalogue (module B)                                                */
/* ------------------------------------------------------------------ */

export interface Variete {
  slug: VarieteSlug;
  nom: string;
  nomArabe: string;
  origine: string;
  couleur: string;
  texture: string;
  saveur: string;
  saison: string;
  description: string;
  usages: string[];
  calibre: string;
  /** Résumé court pour les cartes. */
  resume: string;
}

export type VisuelProduit =
  | "vrac"
  | "branchee"
  | "barquette"
  | "boite"
  | "bocal"
  | "bouteille"
  | "sachet";

interface ProduitBase {
  id: string;
  slug: string;
  nom: string;
  description: string;
  fournisseurId: string;
  regionOrigine: Gouvernorat;
  bio: boolean;
  noteMoyenne: number;
  nombreAvis: number;
  nombreVentes: number;
  visuel: { type: VisuelProduit };
  modele3D: ModelSource | null; // null = pas de 3D (afficher l'appel à l'action côté vendeur)
  statut: StatutProduit;
  /** Remise en pourcentage (badge « -10 % »). */
  remise?: number;
  nouveaute?: boolean;
  creeLe: string;
}

export interface ProduitDatte extends ProduitBase {
  typeProduit: "DATTE";
  variete: VarieteSlug;
  categorieQualite: CategorieQualite;
  presentation: Presentation;
  maturite: Maturite;
  anneeRecolte: number;
  prixParKg: number; // millimes
  stockGrammes: number;
  optionsPoids: number[]; // grammes
}

export interface ProduitDerive extends ProduitBase {
  typeProduit: "DERIVE";
  typeDerive: TypeDerive;
  variete?: VarieteSlug;
  contenance: number;
  uniteContenance: "ML" | "G";
  prixUnitaire: number; // millimes
  stockUnites: number;
  ingredients: string;
}

export type Produit = ProduitDatte | ProduitDerive;

/** Produit enrichi du minimum de son vendeur, pour les cartes. */
export interface ProduitAvecVendeur {
  produit: Produit;
  vendeur: Pick<Fournisseur, "id" | "slug" | "nomBoutique" | "verifie" | "region" | "couleur">;
}

export type TriCatalogue = "pertinence" | "prix-asc" | "prix-desc" | "nouveautes" | "notes";

export interface FiltresCatalogue {
  q?: string;
  type?: "DATTE" | "DERIVE";
  varietes?: VarieteSlug[];
  prixMin?: number; // millimes
  prixMax?: number; // millimes
  regions?: Gouvernorat[];
  presentations?: Presentation[];
  maturites?: Maturite[];
  categories?: CategorieQualite[];
  bio?: boolean;
  avec3D?: boolean;
  vendeurVerifie?: boolean;
  tri?: TriCatalogue;
  fournisseurId?: string;
}

export interface Modele3DVendeur {
  id: string;
  produitId: string;
  produitNom: string;
  source: ModelSource | null;
  visuel: VisuelProduit;
  variete?: VarieteSlug;
  statut: Statut3D;
  progression: number; // 0..100
  creeLe: string;
  creditsConsommes: number;
  polycount?: number;
}

export interface PackCredits3D {
  id: string;
  nom: string;
  nombreCredits: number;
  prix: number; // millimes
  description: string;
  misEnAvant: boolean;
}

export interface MouvementCredit3D {
  id: string;
  type: TypeMouvementCredit;
  quantite: number; // + ou −
  soldeApres: number;
  motif: string;
  creeLe: string;
}

export interface SoldeCredits3D {
  solde: number;
  seuilBas: number;
  coutImage: number;
  coutMultiImage: number;
}

/* ------------------------------------------------------------------ */
/* Commandes (module C)                                                */
/* ------------------------------------------------------------------ */

export interface LignePanier {
  id: string;
  produitId: string;
  slug: string;
  nom: string;
  typeProduit: "DATTE" | "DERIVE";
  variete?: VarieteSlug;
  visuel: VisuelProduit;
  fournisseurId: string;
  fournisseurNom: string;
  fournisseurVerifie: boolean;
  /** Prix au kg (datte) ou à l'unité (dérivé), en millimes. */
  prix: number;
  quantiteGrammes?: number;
  quantiteUnites?: number;
  stockMax: number;
}

export interface LigneCommande {
  id: string;
  produitId: string;
  slug: string;
  nomProduit: string;
  nomVariete?: string;
  variete?: VarieteSlug;
  visuel: VisuelProduit;
  typeProduit: "DATTE" | "DERIVE";
  quantiteGrammes?: number;
  quantiteUnites?: number;
  prixUnitaire: number;
  total: number;
}

export type EtatEtape = "terminee" | "en-cours" | "a-venir";

export interface EtapeSuivi {
  cle: string;
  libelle: string;
  date?: string;
  etat: EtatEtape;
}

export interface SousCommande {
  id: string;
  numero: string;
  commandeNumero: string;
  fournisseurId: string;
  fournisseurNom: string;
  client: { prenom: string; ville: string; initiales: string };
  statut: StatutSousCommande;
  lignes: LigneCommande[];
  sousTotal: number;
  fraisLivraison: number;
  commission: number;
  transporteur?: string;
  numeroSuivi?: string;
  creeLe: string;
  etapes: EtapeSuivi[];
}

export interface Commande {
  id: string;
  numero: string;
  creeLe: string;
  statut: StatutCommande;
  sousCommandes: SousCommande[];
  adresse: Adresse;
  /** Point de livraison choisi sur la carte (OpenStreetMap), si le client l'a utilisé. */
  position?: { latitude: number; longitude: number };
  methodePaiement: MethodePaiement;
  sousTotal: number;
  fraisLivraison: number;
  remise: number;
  total: number;
}

export interface Avis {
  id: string;
  produitId: string;
  produitNom: string;
  fournisseurId: string;
  auteur: string; // « Prénom N. »
  note: number; // 1..5
  commentaire: string;
  creeLe: string;
  reponseFournisseur?: string;
  reponduLe?: string;
  achatVerifie: boolean;
}

export interface RepartitionNotes {
  moyenne: number;
  total: number;
  /** index 0 = 1 étoile … index 4 = 5 étoiles */
  parNote: [number, number, number, number, number];
}

export interface PointVentes {
  date: string; // ISO (jour)
  chiffreAffaires: number; // millimes
  commandes: number;
}

export interface KpiVentes {
  periode: "7j" | "30j" | "12m";
  chiffreAffaires: number;
  variationCA: number; // %
  commandes: number;
  variationCommandes: number;
  panierMoyen: number;
  variationPanier: number;
  noteMoyenne: number;
  variationNote: number;
  serie: PointVentes[];
}

export interface TopProduit {
  produitId: string;
  nom: string;
  ventes: number;
  chiffreAffaires: number;
}

export interface RepartitionVariete {
  variete: VarieteSlug;
  nom: string;
  part: number; // %
}

export interface Versement {
  id: string;
  reference: string;
  periodeDebut: string;
  periodeFin: string;
  montantBrut: number;
  commission: number;
  montantNet: number;
  statut: StatutVersement;
  dateVersement: string;
}

export interface Litige {
  id: string;
  numero: string;
  sousCommandeNumero: string;
  client: string;
  fournisseurNom: string;
  motif: MotifLitige;
  description: string;
  statut: StatutLitige;
  montant: number;
  ouvertLe: string;
  echanges: { auteur: "client" | "vendeur" | "admin"; nom: string; contenu: string; date: string }[];
}

/* ------------------------------------------------------------------ */
/* Administration                                                      */
/* ------------------------------------------------------------------ */

export interface Signalement {
  id: string;
  cibleType: CibleSignalement;
  cibleLibelle: string;
  motif: string;
  auteur: string;
  statut: StatutTraitement;
  creeLe: string;
  extrait: string;
}

export interface ParametresPlateforme {
  tauxCommission: number; // %
  fraisLivraisonDefaut: number; // millimes
  livraisonGratuiteDes: number; // millimes
  creditsOffertsInscription: number;
  coutCreditsImage: number;
  coutCreditsMultiImage: number;
  seuilCreditsBas: number;
  delaiMax3DMinutes: number;
}

export interface KpiPlateforme {
  vendeursActifs: number;
  dossiersEnAttente: number;
  litigesOuverts: number;
  chiffreAffaires: number;
  serie: PointVentes[];
}

export interface DossierFournisseur {
  fournisseur: Fournisseur;
  email: string;
  telephone: string;
  matriculeFiscal: string;
  numeroRNE: string;
  ribMasque: string;
  soumisLe: string;
  documents: DocumentFournisseur[];
}

/* ------------------------------------------------------------------ */
/* Assistant (IA-C)                                                    */
/* ------------------------------------------------------------------ */

export type ResultatOutil =
  | { outil: "recherche"; produits: ProduitAvecVendeur[] }
  | { outil: "varietes"; comparaison: [Variete, Variete] }
  | { outil: "suivi"; commandeNumero: string; etapes: EtapeSuivi[]; vendeur: string }
  | {
      outil: "ajout-panier";
      produit: ProduitAvecVendeur;
      quantiteGrammes: number;
      total: number;
    };

export interface ScenarioAssistant {
  id: string;
  declencheurs: string[];
  question: string;
  reponse: string;
  resultat?: ResultatOutil;
  suite?: string;
}

/** Forme brute stockée dans `mocks/assistant-script.ts` (références, pas d'objets). */
export type ResultatOutilSource =
  | { outil: "recherche"; produitIds: string[] }
  | { outil: "varietes"; varietes: [VarieteSlug, VarieteSlug] }
  | { outil: "suivi"; commandeNumero: string }
  | { outil: "ajout-panier"; produitId: string; quantiteGrammes: number };

export interface ScenarioAssistantSource extends Omit<ScenarioAssistant, "resultat"> {
  resultat?: ResultatOutilSource;
}
