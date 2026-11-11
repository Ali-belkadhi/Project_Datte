/* eslint-disable @typescript-eslint/no-explicit-any */
// MODULE A — Comptes (Baha Ayadi)
// Conversion des documents Mongoose vers les types de domaine consommés par l'UI.
import type {
  Adresse,
  Conversation,
  Fournisseur,
  Message,
  Notification,
  ShopTint,
  Utilisateur,
} from "@/types/domain";
import type { Role } from "@/types/enums";

const TINTS: ShopTint[] = ["amber", "date", "palm", "clay", "night"];

/** Teinte stable dérivée d'une chaîne (slug, id…). */
export function teinteDepuis(cle: string): ShopTint {
  let h = 0;
  for (let i = 0; i < cle.length; i++) h = (h * 31 + cle.charCodeAt(i)) | 0;
  return TINTS[Math.abs(h) % TINTS.length];
}

export function initialesDe(prenom?: string, nom?: string) {
  return `${(prenom ?? "").charAt(0)}${(nom ?? "").charAt(0)}`.toUpperCase();
}

export function toUtilisateur(doc: any, fournisseurId?: string): Utilisateur {
  return {
    id: String(doc._id),
    prenom: doc.prenom ?? "",
    nom: doc.nom ?? "",
    email: doc.email ?? "",
    telephone: doc.telephone ?? undefined,
    telephoneVerifie: Boolean(doc.telephoneVerifie),
    role: (doc.role ?? "CLIENT") as Role,
    ville: doc.ville ?? "",
    initiales: initialesDe(doc.prenom, doc.nom),
    fournisseurId,
  };
}

export function toAdresse(doc: any): Adresse {
  return {
    id: String(doc._id),
    libelle: doc.libelle ?? "",
    destinataire: doc.destinataire ?? "",
    ligne1: doc.ligne1 ?? "",
    ligne2: doc.ligne2 ?? undefined,
    ville: doc.ville ?? "",
    gouvernorat: doc.gouvernorat,
    codePostal: doc.codePostal ?? "",
    telephone: doc.telephone ?? "",
    parDefaut: Boolean(doc.parDefaut),
  };
}

export function toFournisseurDoc(doc: any): Fournisseur {
  const user = doc.userId && typeof doc.userId === "object" && "email" in doc.userId ? doc.userId : null;
  const nomBoutique = doc.nomBoutique ?? "";
  const titre = doc.slug ?? nomBoutique ?? String(doc._id ?? "");
  return {
    id: String(doc._id),
    slug: doc.slug ?? "",
    nomBoutique,
    gerant: user ? `${user.prenom ?? ""} ${user.nom ?? ""}`.trim() : "",
    type: doc.type ?? "PRODUCTEUR",
    region: doc.region ?? "TUNIS",
    ville: doc.adresseExploitation ?? doc.region ?? "",
    description: doc.description ?? "",
    histoire: doc.description ?? "",
    noteMoyenne: doc.noteMoyenne ?? 0,
    nombreAvis: doc.nombreAvis ?? 0,
    nombreVentes: doc.nombreVentes ?? 0,
    statutVerification: doc.statutVerification ?? "EN_ATTENTE",
    verifie: doc.statutVerification === "VERIFIE",
    depuis: doc.createdAt ? new Date(doc.createdAt).getFullYear() : new Date().getFullYear(),
    couleur: (doc.couleur as ShopTint) ?? teinteDepuis(titre),
    delaiExpedition: doc.delaiExpedition ?? "24–48 h",
    varietes: Array.isArray(doc.varietes) ? doc.varietes : [],
    logoUrl: doc.logoUrl ?? undefined,
    bannerUrl: doc.bannerUrl ?? undefined,
    onboardingComplete: doc.onboardingComplete ?? false,
    motifRefus: doc.motifRefus ?? undefined,
    soumisLe: doc.soumisLe ? new Date(doc.soumisLe).toISOString() : doc.updatedAt ? new Date(doc.updatedAt).toISOString() : undefined,
    verifieLe: doc.verifieLe ? new Date(doc.verifieLe).toISOString() : undefined,
  };
}

export function toNotification(doc: any): Notification {
  return {
    id: String(doc._id),
    type: doc.type,
    titre: doc.titre ?? "",
    contenu: doc.contenu ?? "",
    lien: doc.lien ?? undefined,
    lue: Boolean(doc.lue),
    creeLe: doc.creeLe ? new Date(doc.creeLe).toISOString() : new Date().toISOString(),
  };
}

export function toMessage(doc: any, moiId: string): Message {
  return {
    id: String(doc._id),
    conversationId: String(doc.conversationId),
    auteur: String(doc.expediteurId) === moiId ? "moi" : "autre",
    contenu: doc.contenu ?? "",
    envoyeLe: doc.creeLe ? new Date(doc.creeLe).toISOString() : new Date().toISOString(),
    lu: Boolean(doc.lu),
  };
}

export function toConversation(input: {
  id: string;
  interlocuteur: string;
  sujet: string;
  produitNom?: string;
  dernierMessage: string;
  dernierMessageLe: string;
  nonLus: number;
  messages: Message[];
}): Conversation {
  return {
    ...input,
    interlocuteurInitiales: input.interlocuteur
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((m) => m.charAt(0).toUpperCase())
      .join(""),
    couleur: teinteDepuis(input.id),
  };
}
