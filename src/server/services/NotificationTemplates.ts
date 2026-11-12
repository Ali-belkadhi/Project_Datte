import "server-only";

export const EMAIL_TYPES = new Set([
  "FOURNISSEUR_VALIDE",
  "FOURNISSEUR_REFUSE",
  "FOURNISSEUR_SUSPENDU",
  "NOUVELLE_COMMANDE",
  "COMMANDE_STATUT",
  "LITIGE",
  "ACHAT_CREDITS_CONFIRME",
]);

type Template = { titre: string; contenu: string; lien?: string };
type Donnees = Record<string, unknown> | undefined;

/** Lecture sûre d'un champ texte / nombre des données de notification. */
const txt = (d: Donnees, k: string) => (typeof d?.[k] === "string" && d[k] ? (d[k] as string) : "");
const num = (d: Donnees, k: string) => (typeof d?.[k] === "number" ? (d[k] as number) : null);
/** Montant en millimes → « 32,000 DT ». */
const dt = (m: number | null) => (m === null ? "" : `${(m / 1000).toFixed(3).replace(".", ",")} DT`);
/** « Sirop de datte », « Sirop de datte et Rob de datte », « Sirop de datte et 2 autres produits ». */
function listeProduits(d: Donnees) {
  const p = Array.isArray(d?.produits) ? (d.produits as unknown[]).filter((x): x is string => typeof x === "string") : [];
  if (!p.length) return "";
  if (p.length === 1) return p[0];
  if (p.length === 2) return `${p[0]} et ${p[1]}`;
  return `${p[0]} et ${p.length - 1} autres produits`;
}

/** Notifications de suivi de commande (module C) : un titre et un texte par statut, lien vers la commande. */
function statutCommande(d: Donnees): Template {
  const colis = txt(d, "numero");
  const commande = txt(d, "commande") || colis.replace(/-[A-Z]$/, "");
  const vendeur = txt(d, "vendeur");
  const produits = listeProduits(d);
  const de = vendeur ? ` de ${vendeur}` : "";
  const quoi = produits ? ` (${produits})` : "";
  const lien = commande ? `/compte/commandes/${commande}` : "/compte/commandes";
  switch (txt(d, "statut")) {
    case "EN_ATTENTE":
      return { titre: "Commande enregistrée", contenu: `Votre commande ${commande}${num(d, "total") !== null ? ` de ${dt(num(d, "total"))}` : ""} est enregistrée${d?.aLaLivraison ? ", à régler à la livraison" : ""}. Les vendeurs vont la confirmer.`, lien };
    case "PAYEE":
      return { titre: "Paiement confirmé", contenu: `Le paiement de votre commande ${commande}${num(d, "total") !== null ? ` (${dt(num(d, "total"))})` : ""} est confirmé. Votre facture est disponible.`, lien };
    case "ACCEPTEE":
      return { titre: "Commande acceptée", contenu: `Bonne nouvelle : votre colis ${colis}${de}${quoi} a été accepté.`, lien };
    case "EN_PREPARATION":
      return { titre: "Colis en préparation", contenu: `Votre colis ${colis}${de}${quoi} est en cours de préparation.`, lien };
    case "EXPEDIEE": {
      const suivi = txt(d, "numeroSuivi");
      const par = txt(d, "transporteur");
      return { titre: "Colis expédié", contenu: `Votre colis ${colis}${de} est en route${par ? ` avec ${par}` : ""}${suivi ? ` (n° de suivi ${suivi})` : ""}.`, lien };
    }
    case "LIVREE":
      return { titre: "Colis livré", contenu: `Votre colis ${colis}${de}${quoi} est livré. Bonne dégustation ! Donnez votre avis sur vos produits.`, lien };
    case "REFUSEE":
      return { titre: "Colis refusé par le vendeur", contenu: `${vendeur || "Le vendeur"} ne peut pas honorer votre colis ${colis}${txt(d, "motif") ? ` : ${txt(d, "motif")}` : "."} S'il a été payé, il vous est remboursé.`, lien };
    case "ANNULEE":
      return { titre: "Commande annulée", contenu: `${colis && colis !== commande ? `Le colis ${colis}` : `La commande ${commande}`} est annulée${txt(d, "motif") ? ` : ${txt(d, "motif")}` : "."}`, lien };
    case "REMBOURSEE":
      return { titre: "Remboursement effectué", contenu: `${num(d, "montant") !== null ? `${dt(num(d, "montant"))} vous ont été remboursés` : "Vous avez été remboursé"} pour le colis ${colis}${de}.`, lien };
    default:
      return { titre: "Suivi de commande", contenu: `Votre commande ${commande || ""} a été mise à jour.`.replace("  ", " "), lien };
  }
}

const templates: Record<string, (d?: Record<string, unknown>) => Template> = {
  FOURNISSEUR_VALIDE: (d) => ({ titre: "Boutique vérifiée", contenu: `Félicitations : ${txt(d, "nomBoutique") || "votre boutique"} est vérifiée. Vous pouvez publier vos produits.`, lien: "/vendeur" }),
  FOURNISSEUR_REFUSE: (d) => ({ titre: "Dossier refusé", contenu: `Votre dossier n'a pas été validé${txt(d, "motif") ? ` : ${txt(d, "motif")}` : "."} Corrigez-le puis renvoyez-le.`, lien: "/vendeur/onboarding" }),
  FOURNISSEUR_SUSPENDU: (d) => ({ titre: "Boutique suspendue", contenu: `Votre boutique est suspendue${txt(d, "motif") ? ` : ${txt(d, "motif")}` : "."}`, lien: "/vendeur" }),
  NOUVELLE_DEMANDE_FOURNISSEUR: (d) => ({ titre: "Nouvelle demande fournisseur", contenu: txt(d, "motif") ? `Un fournisseur demande une nouvelle vérification (${txt(d, "motif")}).` : "Un nouveau dossier fournisseur attend votre validation.", lien: txt(d, "fournisseurId") ? `/admin/fournisseurs/${txt(d, "fournisseurId")}` : "/admin/fournisseurs" }),
  ANALYSE_IA_PRETE: (d) => ({ titre: "Analyse IA prête", contenu: "L'analyse automatique des documents du fournisseur est disponible.", lien: txt(d, "fournisseurId") ? `/admin/fournisseurs/${txt(d, "fournisseurId")}` : "/admin/fournisseurs" }),
  NOUVELLE_COMMANDE: (d) => ({ titre: "Nouvelle commande", contenu: `Vous avez reçu la commande ${txt(d, "numero")}${num(d, "total") !== null ? ` (${dt(num(d, "total"))})` : ""}. Acceptez-la pour lancer la préparation.`.replace("commande  (", "commande ("), lien: txt(d, "numero") ? `/vendeur/commandes/${txt(d, "numero")}` : "/vendeur/commandes" }),
  COMMANDE_STATUT: statutCommande,
  LITIGE: (d) => ({ titre: "Litige", contenu: txt(d, "decision") ? `Votre signalement a été traité : ${txt(d, "decision")}.` : "Un litige a été ouvert.", lien: txt(d, "decision") ? "/compte/notifications" : "/admin/litiges" }),
  ACHAT_CREDITS_CONFIRME: (d) =>
    txt(d, "statut") === "ECHOUE"
      ? { titre: "Achat de crédits non abouti", contenu: `Le paiement du pack ${txt(d, "pack") || "de crédits 3D"} n'a pas abouti : aucun crédit n'a été débité.`, lien: "/vendeur/credits" }
      : { titre: "Crédits 3D ajoutés", contenu: `${num(d, "credits") !== null ? `${num(d, "credits")} crédits 3D ont été ajoutés` : "Vos crédits 3D ont été ajoutés"} à votre solde${txt(d, "pack") ? ` (pack ${txt(d, "pack")}${num(d, "montant") !== null ? `, ${dt(num(d, "montant"))}` : ""})` : ""}.`, lien: "/vendeur/credits" },
  NOUVEAU_MESSAGE: (d) => ({ titre: "Nouveau message", contenu: `${txt(d, "expediteur") || "Un utilisateur"} vous a écrit${txt(d, "apercu") ? ` : « ${txt(d, "apercu")} »` : "."}`, lien: "/compte/messages" }),
  STOCK_BAS: (d) => ({ titre: "Stock bas", contenu: `${txt(d, "produit") || "Un de vos produits"} arrive bientôt en rupture${txt(d, "stock") ? ` (${txt(d, "stock")} restants)` : ""}.`, lien: "/vendeur/produits" }),
  NOUVEL_AVIS: (d) => ({ titre: "Nouvel avis", contenu: `${num(d, "note") !== null ? `${num(d, "note")}★ ` : ""}Un client a donné son avis${txt(d, "produit") ? ` sur ${txt(d, "produit")}` : ""}. Vous pouvez lui répondre.`, lien: "/vendeur/avis" }),
  MODELE_3D_PRET: (d) => ({ titre: "Modèle 3D prêt", contenu: `Le modèle 3D${txt(d, "produit") ? ` de ${txt(d, "produit")}` : ""} est prêt : vérifiez-le puis publiez-le sur la fiche produit.`, lien: "/vendeur/studio-3d" }),
  MODELE_3D_ECHEC: (d) => ({ titre: "Échec de la génération 3D", contenu: `La génération 3D${txt(d, "produit") ? ` de ${txt(d, "produit")}` : ""} a échoué : vos crédits ont été restitués.`, lien: "/vendeur/studio-3d" }),
  CREDITS_3D_BAS: (d) => ({ titre: "Crédits 3D bas", contenu: `Il vous reste ${num(d, "solde") ?? "peu de"} crédits 3D. Rechargez votre solde pour continuer à générer vos modèles.`, lien: "/vendeur/credits" }),
};

export function buildNotification(type: string, donnees?: Record<string, unknown>) {
  const fn = templates[type];
  if (!fn) return { titre: type, contenu: "", lien: undefined };
  return fn(donnees);
}