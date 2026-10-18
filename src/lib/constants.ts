/**
 * Constantes d'affichage : libellés des énumérations, statuts → libellé + ton,
 * régions, teintes de boutique. Aucune couleur codée en dur : uniquement des classes de tokens.
 */
import type {
  CategorieQualite,
  Gouvernorat,
  Maturite,
  MethodePaiement,
  MotifLitige,
  Presentation,
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
} from "@/types/enums";
import type { ShopTint } from "@/types/domain";

export type Tone = "amber" | "date" | "palm" | "clay" | "neutral" | "night";

/** Classes de badge par ton (fond + texte + point). */
export const TONE_CLASSES: Record<Tone, { badge: string; dot: string }> = {
  amber: { badge: "bg-brand-soft text-accent-foreground", dot: "bg-brand-fill" },
  date: { badge: "bg-secondary text-date", dot: "bg-date" },
  palm: { badge: "bg-success-soft text-success", dot: "bg-success" },
  clay: { badge: "bg-danger-soft text-danger", dot: "bg-danger" },
  neutral: { badge: "bg-muted text-muted-foreground", dot: "bg-muted-foreground" },
  night: { badge: "bg-primary text-primary-foreground", dot: "bg-brand-light" },
};

export type StatusDef = { label: string; tone: Tone };

export const STATUT_SOUS_COMMANDE: Record<StatutSousCommande, StatusDef> = {
  EN_ATTENTE: { label: "En attente", tone: "amber" },
  ACCEPTEE: { label: "Acceptée", tone: "date" },
  EN_PREPARATION: { label: "En préparation", tone: "date" },
  EXPEDIEE: { label: "Expédiée", tone: "night" },
  LIVREE: { label: "Livrée", tone: "palm" },
  REFUSEE: { label: "Refusée", tone: "clay" },
  ANNULEE: { label: "Annulée", tone: "clay" },
  REMBOURSEE: { label: "Remboursée", tone: "neutral" },
};

export const STATUT_COMMANDE: Record<StatutCommande, StatusDef> = {
  EN_ATTENTE_PAIEMENT: { label: "Paiement en attente", tone: "amber" },
  PAYEE: { label: "Payée", tone: "date" },
  PARTIELLEMENT_LIVREE: { label: "Partiellement livrée", tone: "night" },
  LIVREE: { label: "Livrée", tone: "palm" },
  ANNULEE: { label: "Annulée", tone: "clay" },
};

export const STATUT_PRODUIT: Record<StatutProduit, StatusDef> = {
  BROUILLON: { label: "Brouillon", tone: "neutral" },
  PUBLIE: { label: "Publié", tone: "palm" },
  MASQUE: { label: "Masqué", tone: "neutral" },
  RUPTURE: { label: "Rupture", tone: "clay" },
  ARCHIVE: { label: "Archivé", tone: "neutral" },
};

export const STATUT_3D: Record<Statut3D, StatusDef> = {
  EN_ATTENTE: { label: "En file d'attente", tone: "amber" },
  EN_COURS: { label: "Génération en cours", tone: "amber" },
  PRET: { label: "Prêt à publier", tone: "date" },
  PUBLIE: { label: "Publié", tone: "palm" },
  REJETE: { label: "Rejeté", tone: "neutral" },
  ECHEC: { label: "Échec", tone: "clay" },
};

export const STATUT_VERIFICATION: Record<StatutVerification, StatusDef> = {
  EN_ATTENTE: { label: "En attente", tone: "amber" },
  VERIFIE: { label: "Vérifié", tone: "palm" },
  REFUSE: { label: "Refusé", tone: "clay" },
  SUSPENDU: { label: "Suspendu", tone: "neutral" },
};

export const STATUT_VERSEMENT: Record<StatutVersement, StatusDef> = {
  PLANIFIE: { label: "Planifié", tone: "amber" },
  EFFECTUE: { label: "Effectué", tone: "palm" },
  ECHOUE: { label: "Échoué", tone: "clay" },
};

export const STATUT_LITIGE: Record<StatutLitige, StatusDef> = {
  OUVERT: { label: "Ouvert", tone: "clay" },
  EN_EXAMEN: { label: "En examen", tone: "amber" },
  RESOLU_CLIENT: { label: "Résolu (client)", tone: "palm" },
  RESOLU_FOURNISSEUR: { label: "Résolu (vendeur)", tone: "palm" },
  CLOS: { label: "Clos", tone: "neutral" },
};

export const STATUT_TRAITEMENT: Record<StatutTraitement, StatusDef> = {
  OUVERT: { label: "À traiter", tone: "amber" },
  TRAITE: { label: "Traité", tone: "palm" },
  REJETE: { label: "Rejeté", tone: "neutral" },
};

export const MOTIF_LITIGE: Record<MotifLitige, string> = {
  NON_RECU: "Colis non reçu",
  ABIME: "Produit abîmé",
  NON_CONFORME: "Non conforme à la description",
  AUTRE: "Autre motif",
};

export const CATEGORIE_QUALITE: Record<CategorieQualite, string> = {
  EXTRA: "Extra",
  CAT_I: "Catégorie I",
  CAT_II: "Catégorie II",
};

export const PRESENTATION: Record<Presentation, string> = {
  BRANCHEE: "Branchée",
  VRAC: "Vrac",
  CONDITIONNEE: "Conditionnée",
  DENOYAUTEE: "Dénoyautée",
};

export const MATURITE: Record<Maturite, { label: string; detail: string }> = {
  BSER: { label: "Bser", detail: "fraîche" },
  RTOB: { label: "Rtob", detail: "semi-molle" },
  TAMR: { label: "Tamr", detail: "mûre" },
};

export const TYPE_DERIVE: Record<TypeDerive, string> = {
  JUS: "Jus",
  CONFITURE: "Confiture",
  PATE: "Pâte de datte",
  ROB: "Rob / sirop",
  MIEL: "Miel de datte",
  CAFE_NOYAUX: "Café de noyaux",
  AUTRE: "Spécialité",
};

export const TYPE_FOURNISSEUR: Record<TypeFournisseur, string> = {
  PRODUCTEUR: "Producteur",
  COOPERATIVE: "Coopérative",
  REVENDEUR: "Revendeur",
  TRANSFORMATEUR: "Transformateur",
};

export const TYPE_DOCUMENT: Record<TypeDocument, string> = {
  CIN: "Carte d'identité (CIN)",
  RNE: "Extrait RNE",
  PATENTE: "Patente",
  ATTESTATION_BIO: "Attestation bio",
  AUTRE: "Autre document",
};

export const METHODE_PAIEMENT: Record<MethodePaiement, string> = {
  A_LA_LIVRAISON: "Paiement à la livraison",
  KONNECT: "Carte bancaire (Konnect)",
  FLOUCI: "Flouci",
  CARTE: "Carte bancaire",
};

export const TYPE_MOUVEMENT_CREDIT: Record<TypeMouvementCredit, StatusDef> = {
  ACHAT: { label: "Achat", tone: "palm" },
  RESERVATION: { label: "Réservation", tone: "amber" },
  CONSOMMATION: { label: "Consommation", tone: "date" },
  RESTITUTION: { label: "Restitution", tone: "palm" },
  BONUS: { label: "Bonus", tone: "amber" },
  AJUSTEMENT_ADMIN: { label: "Ajustement", tone: "neutral" },
};

export const GOUVERNORAT_LABEL: Record<Gouvernorat, string> = {
  TUNIS: "Tunis",
  ARIANA: "Ariana",
  BEN_AROUS: "Ben Arous",
  MANOUBA: "Manouba",
  NABEUL: "Nabeul",
  ZAGHOUAN: "Zaghouan",
  BIZERTE: "Bizerte",
  BEJA: "Béja",
  JENDOUBA: "Jendouba",
  KEF: "Le Kef",
  SILIANA: "Siliana",
  SOUSSE: "Sousse",
  MONASTIR: "Monastir",
  MAHDIA: "Mahdia",
  SFAX: "Sfax",
  KAIROUAN: "Kairouan",
  KASSERINE: "Kasserine",
  SIDI_BOUZID: "Sidi Bouzid",
  GABES: "Gabès",
  MEDENINE: "Médenine",
  TATAOUINE: "Tataouine",
  GAFSA: "Gafsa",
  TOZEUR: "Tozeur",
  KEBILI: "Kébili",
};

/** Régions productrices proposées dans les filtres du catalogue. */
export const REGIONS_PRODUCTRICES: Gouvernorat[] = ["TOZEUR", "KEBILI", "GABES", "GAFSA"];

/** Teintes d'accent de boutique (5 teintes de la palette). */
export const SHOP_TINTS: Record<ShopTint, { label: string; bg: string; soft: string; text: string }> = {
  amber: { label: "Ambre", bg: "bg-brand-fill", soft: "bg-brand-soft", text: "text-brand-foreground" },
  date: { label: "Datte", bg: "bg-date", soft: "bg-secondary", text: "text-cream" },
  palm: { label: "Palme", bg: "bg-success", soft: "bg-success-soft", text: "text-cream" },
  clay: { label: "Argile", bg: "bg-danger", soft: "bg-danger-soft", text: "text-cream" },
  night: { label: "Nuit", bg: "bg-night", soft: "bg-muted", text: "text-cream" },
};

/** Poids rapides du WeightPicker (grammes). */
export const POIDS_RAPIDES = [500, 1000, 2000, 5000];
export const PAS_POIDS = 500;

/** Livraison (démo) — miroir des ParametresPlateforme. */
export const LIVRAISON = {
  standard: { label: "Standard", delai: "3 à 5 jours ouvrés", prix: 7000 },
  express: { label: "Express", delai: "24 à 48 h", prix: 12000 },
  gratuiteDes: 80000,
};
