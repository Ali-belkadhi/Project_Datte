/**
 * DEGLA - Énumérations TypeScript
 * Miroir exact du cahier des charges section 09
 */

// ===== COMPTES =====
export enum Role {
  CLIENT = 'CLIENT',
  FOURNISSEUR = 'FOURNISSEUR',
  ADMIN = 'ADMIN',
}

export enum Langue {
  FR = 'FR',
  AR = 'AR',
  EN = 'EN',
}

export enum StatutCompte {
  ACTIF = 'ACTIF',
  SUSPENDU = 'SUSPENDU',
  SUPPRIME = 'SUPPRIME',
}

export enum TypeFournisseur {
  PRODUCTEUR = 'PRODUCTEUR',
  COOPERATIVE = 'COOPERATIVE',
  REVENDEUR = 'REVENDEUR',
  TRANSFORMATEUR = 'TRANSFORMATEUR',
}

export enum StatutVerification {
  EN_ATTENTE = 'EN_ATTENTE',
  VERIFIE = 'VERIFIE',
  REFUSE = 'REFUSE',
  SUSPENDU = 'SUSPENDU',
}

export enum TypeDocument {
  CIN = 'CIN',
  RNE = 'RNE',
  PATENTE = 'PATENTE',
  ATTESTATION_BIO = 'ATTESTATION_BIO',
  AUTRE = 'AUTRE',
}

export enum NiveauAdmin {
  SUPER_ADMIN = 'SUPER_ADMIN',
  MODERATEUR = 'MODERATEUR',
}

// ===== GÉOGRAPHIE =====
export enum Gouvernorat {
  TUNIS = 'TUNIS',
  ARIANA = 'ARIANA',
  BEN_AROUS = 'BEN_AROUS',
  MANOUBA = 'MANOUBA',
  NABEUL = 'NABEUL',
  ZAGHOUAN = 'ZAGHOUAN',
  BIZERTE = 'BIZERTE',
  BEJA = 'BEJA',
  JENDOUBA = 'JENDOUBA',
  KEF = 'KEF',
  SILIANA = 'SILIANA',
  SOUSSE = 'SOUSSE',
  MONASTIR = 'MONASTIR',
  MAHDIA = 'MAHDIA',
  SFAX = 'SFAX',
  KAIROUAN = 'KAIROUAN',
  KASSERINE = 'KASSERINE',
  SIDI_BOUZID = 'SIDI_BOUZID',
  GABES = 'GABES',
  MEDENINE = 'MEDENINE',
  TATAOUINE = 'TATAOUINE',
  GAFSA = 'GAFSA',
  TOZEUR = 'TOZEUR',
  KEBILI = 'KEBILI',
}

// ===== PRODUITS =====
export enum TypeProduit {
  DATTE = 'DATTE',
  DERIVE = 'DERIVE',
}

export enum StatutProduit {
  BROUILLON = 'BROUILLON',
  PUBLIE = 'PUBLIE',
  MASQUE = 'MASQUE',
  RUPTURE = 'RUPTURE',
  ARCHIVE = 'ARCHIVE',
}

export enum CategorieQualite {
  EXTRA = 'EXTRA',
  CAT_I = 'CAT_I',
  CAT_II = 'CAT_II',
}

export enum Presentation {
  BRANCHEE = 'BRANCHEE',
  VRAC = 'VRAC',
  CONDITIONNEE = 'CONDITIONNEE',
  DENOYAUTEE = 'DENOYAUTEE',
}

export enum Maturite {
  BSER = 'BSER',
  RTOB = 'RTOB',
  TAMR = 'TAMR',
}

export enum TypeDerive {
  JUS = 'JUS',
  CONFITURE = 'CONFITURE',
  PATE = 'PATE',
  ROB = 'ROB',
  MIEL = 'MIEL',
  CAFE_NOYAUX = 'CAFE_NOYAUX',
  AUTRE = 'AUTRE',
}

export enum UniteContenance {
  ML = 'ML',
  G = 'G',
}

// ===== 3D =====
export enum ModeGeneration3D {
  IMAGE = 'IMAGE',
  MULTI_IMAGE = 'MULTI_IMAGE',
}

export enum Statut3D {
  EN_ATTENTE = 'EN_ATTENTE',
  EN_COURS = 'EN_COURS',
  PRET = 'PRET',
  PUBLIE = 'PUBLIE',
  REJETE = 'REJETE',
  ECHEC = 'ECHEC',
}

export enum TypeMouvementCredit {
  ACHAT = 'ACHAT',
  RESERVATION = 'RESERVATION',
  CONSOMMATION = 'CONSOMMATION',
  RESTITUTION = 'RESTITUTION',
  BONUS = 'BONUS',
  AJUSTEMENT_ADMIN = 'AJUSTEMENT_ADMIN',
}

// ===== COMMANDES =====
export enum StatutCommande {
  EN_ATTENTE_PAIEMENT = 'EN_ATTENTE_PAIEMENT',
  PAYEE = 'PAYEE',
  PARTIELLEMENT_LIVREE = 'PARTIELLEMENT_LIVREE',
  LIVREE = 'LIVREE',
  ANNULEE = 'ANNULEE',
}

export enum StatutSousCommande {
  EN_ATTENTE = 'EN_ATTENTE',
  ACCEPTEE = 'ACCEPTEE',
  EN_PREPARATION = 'EN_PREPARATION',
  EXPEDIEE = 'EXPEDIEE',
  LIVREE = 'LIVREE',
  REFUSEE = 'REFUSEE',
  ANNULEE = 'ANNULEE',
  REMBOURSEE = 'REMBOURSEE',
}

export enum MethodePaiement {
  A_LA_LIVRAISON = 'A_LA_LIVRAISON',
  KONNECT = 'KONNECT',
  FLOUCI = 'FLOUCI',
  CARTE = 'CARTE',
}

export enum StatutPaiement {
  EN_ATTENTE = 'EN_ATTENTE',
  REUSSI = 'REUSSI',
  ECHOUE = 'ECHOUE',
  REMBOURSE = 'REMBOURSE',
}

export enum TypeRemise {
  POURCENTAGE = 'POURCENTAGE',
  MONTANT_FIXE = 'MONTANT_FIXE',
}

// ===== INTERACTIONS =====
export enum StatutModeration {
  VISIBLE = 'VISIBLE',
  MASQUE = 'MASQUE',
}

export enum TypeNotification {
  COMMANDE_STATUT = 'COMMANDE_STATUT',
  NOUVELLE_COMMANDE = 'NOUVELLE_COMMANDE',
  MODELE_3D_PRET = 'MODELE_3D_PRET',
  MODELE_3D_ECHEC = 'MODELE_3D_ECHEC',
  NOUVEAU_MESSAGE = 'NOUVEAU_MESSAGE',
  STOCK_BAS = 'STOCK_BAS',
  NOUVEL_AVIS = 'NOUVEL_AVIS',
  FOURNISSEUR_VALIDE = 'FOURNISSEUR_VALIDE',
  LITIGE = 'LITIGE',
  CREDITS_3D_BAS = 'CREDITS_3D_BAS',
  ACHAT_CREDITS_CONFIRME = 'ACHAT_CREDITS_CONFIRME',
}

export enum CibleSignalement {
  PRODUIT = 'PRODUIT',
  AVIS = 'AVIS',
  FOURNISSEUR = 'FOURNISSEUR',
  MESSAGE = 'MESSAGE',
}

export enum StatutTraitement {
  OUVERT = 'OUVERT',
  TRAITE = 'TRAITE',
  REJETE = 'REJETE',
}

export enum MotifLitige {
  NON_RECU = 'NON_RECU',
  ABIME = 'ABIME',
  NON_CONFORME = 'NON_CONFORME',
  AUTRE = 'AUTRE',
}

export enum StatutLitige {
  OUVERT = 'OUVERT',
  EN_EXAMEN = 'EN_EXAMEN',
  RESOLU_CLIENT = 'RESOLU_CLIENT',
  RESOLU_FOURNISSEUR = 'RESOLU_FOURNISSEUR',
  CLOS = 'CLOS',
}

export enum StatutVersement {
  PLANIFIE = 'PLANIFIE',
  EFFECTUE = 'EFFECTUE',
  ECHOUE = 'ECHOUE',
}
