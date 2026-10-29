/**
 * Énumérations du domaine DEGLA — alignées sur l'annexe A (prisma/schema.prisma).
 * Les valeurs sont des chaînes littérales pour rester sérialisables (Server → Client).
 */

export type Role = "CLIENT" | "FOURNISSEUR" | "ADMIN";
export type Langue = "FR" | "AR" | "EN";
export type StatutCompte = "ACTIF" | "SUSPENDU" | "SUPPRIME";

export type TypeFournisseur = "PRODUCTEUR" | "COOPERATIVE" | "REVENDEUR" | "TRANSFORMATEUR";
export type StatutVerification = "EN_ATTENTE" | "VERIFIE" | "REFUSE" | "SUSPENDU";
export type TypeDocument = "CIN" | "RNE" | "PATENTE" | "ATTESTATION_BIO" | "AUTRE";
export type NiveauAdmin = "SUPER_ADMIN" | "MODERATEUR";

export const GOUVERNORATS = [
  "TUNIS",
  "ARIANA",
  "BEN_AROUS",
  "MANOUBA",
  "NABEUL",
  "ZAGHOUAN",
  "BIZERTE",
  "BEJA",
  "JENDOUBA",
  "KEF",
  "SILIANA",
  "SOUSSE",
  "MONASTIR",
  "MAHDIA",
  "SFAX",
  "KAIROUAN",
  "KASSERINE",
  "SIDI_BOUZID",
  "GABES",
  "MEDENINE",
  "TATAOUINE",
  "GAFSA",
  "TOZEUR",
  "KEBILI",
] as const;
export type Gouvernorat = (typeof GOUVERNORATS)[number];

export type TypeProduit = "DATTE" | "DERIVE";
export type StatutProduit = "BROUILLON" | "PUBLIE" | "MASQUE" | "RUPTURE" | "ARCHIVE";
export type CategorieQualite = "EXTRA" | "CAT_I" | "CAT_II";
export type Presentation = "BRANCHEE" | "VRAC" | "CONDITIONNEE" | "DENOYAUTEE";
export type Maturite = "BSER" | "RTOB" | "TAMR";
export type TypeDerive = "JUS" | "CONFITURE" | "PATE" | "ROB" | "MIEL" | "CAFE_NOYAUX" | "AUTRE";
export type UniteContenance = "ML" | "G";

export type ModeGeneration3D = "IMAGE" | "MULTI_IMAGE";
export type Statut3D = "EN_ATTENTE" | "EN_COURS" | "PRET" | "PUBLIE" | "REJETE" | "ECHEC";

export type StatutCommande =
  | "EN_ATTENTE_PAIEMENT"
  | "PAYEE"
  | "PARTIELLEMENT_LIVREE"
  | "LIVREE"
  | "ANNULEE";
export type StatutSousCommande =
  | "EN_ATTENTE"
  | "ACCEPTEE"
  | "EN_PREPARATION"
  | "EXPEDIEE"
  | "LIVREE"
  | "REFUSEE"
  | "ANNULEE"
  | "REMBOURSEE";

export type MethodePaiement = "A_LA_LIVRAISON" | "KONNECT" | "FLOUCI" | "CARTE";
export type StatutPaiement = "EN_ATTENTE" | "REUSSI" | "ECHOUE" | "REMBOURSE";
export type TypeRemise = "POURCENTAGE" | "MONTANT_FIXE";
export type StatutModeration = "VISIBLE" | "MASQUE";

export type TypeNotification =
  | "COMMANDE_STATUT"
  | "NOUVELLE_COMMANDE"
  | "MODELE_3D_PRET"
  | "MODELE_3D_ECHEC"
  | "NOUVEAU_MESSAGE"
  | "STOCK_BAS"
  | "NOUVEL_AVIS"
  | "FOURNISSEUR_VALIDE"
  | "LITIGE"
  | "CREDITS_3D_BAS"
  | "ACHAT_CREDITS_CONFIRME";

export type CibleSignalement = "PRODUIT" | "AVIS" | "FOURNISSEUR" | "MESSAGE";
export type StatutTraitement = "OUVERT" | "TRAITE" | "REJETE";
export type MotifLitige = "NON_RECU" | "ABIME" | "NON_CONFORME" | "AUTRE";
export type StatutLitige = "OUVERT" | "EN_EXAMEN" | "RESOLU_CLIENT" | "RESOLU_FOURNISSEUR" | "CLOS";
export type StatutVersement = "PLANIFIE" | "EFFECTUE" | "ECHOUE";
export type TypeMouvementCredit =
  | "ACHAT"
  | "RESERVATION"
  | "CONSOMMATION"
  | "RESTITUTION"
  | "BONUS"
  | "AJUSTEMENT_ADMIN";

/** Zone de l'application (vue de démo) — utilisée par la session factice. */
export type ZoneDemo = "acheteur" | "vendeur" | "admin";
