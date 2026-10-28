/* eslint-disable @typescript-eslint/no-unused-vars */
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

const templates: Record<string, (d?: Record<string, unknown>) => Template> = {
  FOURNISSEUR_VALIDE: (_d) => ({ titre: "Boutique vérifiée", contenu: "Votre boutique a été vérifiée.", lien: "/vendeur" }),
  FOURNISSEUR_REFUSE: (d) => ({ titre: "Dossier refusé", contenu: `Motif: ${d?.motif ?? ""}`, lien: "/vendeur/onboarding" }),
  FOURNISSEUR_SUSPENDU: (d) => ({ titre: "Boutique suspendue", contenu: `Motif: ${d?.motif ?? ""}`, lien: "/vendeur" }),
  NOUVELLE_DEMANDE_FOURNISSEUR: (d) => ({ titre: "Nouvelle demande fournisseur", contenu: "Un nouveau dossier est en attente.", lien: "/admin/fournisseurs" }),
  ANALYSE_IA_PRETE: (d) => ({ titre: "Analyse IA prête", contenu: "L'analyse des documents est disponible.", lien: "/admin/fournisseurs" }),
  NOUVELLE_COMMANDE: (d) => ({ titre: "Nouvelle commande", contenu: "Vous avez reçu une commande.", lien: "/vendeur/commandes" }),
  COMMANDE_STATUT: (d) => ({ titre: "Statut de commande", contenu: "Le statut de votre commande a changé.", lien: "/compte/commandes" }),
  LITIGE: (d) => ({ titre: "Litige", contenu: "Un litige a été ouvert.", lien: "/admin/litiges" }),
  ACHAT_CREDITS_CONFIRME: (d) => ({ titre: "Crédits 3D confirmés", contenu: "Votre achat de crédits 3D est confirmé.", lien: "/vendeur/credits" }),
  NOUVEAU_MESSAGE: (d) => ({ titre: "Nouveau message", contenu: "Vous avez reçu un message.", lien: "/compte/messages" }),
  STOCK_BAS: (d) => ({ titre: "Stock bas", contenu: "Un produit est en stock bas.", lien: "/vendeur/produits" }),
  NOUVEL_AVIS: (d) => ({ titre: "Nouvel avis", contenu: "Vous avez reçu un avis.", lien: "/vendeur/avis" }),
  MODELE_3D_PRET: (d) => ({ titre: "Modèle 3D prêt", contenu: "Votre modèle 3D est prêt.", lien: "/vendeur/studio-3d" }),
  MODELE_3D_ECHEC: (d) => ({ titre: "Échec modèle 3D", contenu: "La génération 3D a échoué.", lien: "/vendeur/studio-3d" }),
  CREDITS_3D_BAS: (d) => ({ titre: "Crédits 3D bas", contenu: "Votre solde de crédits 3D est bas.", lien: "/vendeur/credits" }),
};

export function buildNotification(type: string, donnees?: Record<string, unknown>) {
  const fn = templates[type];
  if (!fn) return { titre: type, contenu: "", lien: undefined };
  return fn(donnees);
}