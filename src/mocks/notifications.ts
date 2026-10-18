// données de démonstration — notifications
import type { Notification } from "@/types/domain";

export const NOTIFICATIONS_CLIENT: Notification[] = [
  { id: "n-01", type: "COMMANDE_STATUT", titre: "Votre colis est en route", contenu: "Les Délices de Nefta ont expédié la sous-commande DGL-2026-000123-B (Aramex).", lien: "/compte/commandes/DGL-2026-000123", lue: false, creeLe: "2026-10-18T08:12:00+01:00" },
  { id: "n-02", type: "COMMANDE_STATUT", titre: "Commande en préparation", contenu: "Palmeraie Ben Amor prépare vos 2 kg de Deglet Nour Extra branchée.", lien: "/compte/commandes/DGL-2026-000123", lue: false, creeLe: "2026-10-18T07:30:00+01:00" },
  { id: "n-03", type: "NOUVEAU_MESSAGE", titre: "Nouveau message de Palmeraie Ben Amor", contenu: "« Bonjour Sarra, votre régime partira demain matin… »", lien: "/compte/messages", lue: false, creeLe: "2026-10-17T21:05:00+01:00" },
  { id: "n-04", type: "COMMANDE_STATUT", titre: "Paiement en attente", contenu: "Finalisez le paiement de la commande DGL-2026-000121 pour qu'elle soit transmise à Maison Rob Gabès.", lien: "/compte/commandes/DGL-2026-000121", lue: true, creeLe: "2026-10-16T12:10:00+01:00" },
  { id: "n-05", type: "COMMANDE_STATUT", titre: "Medjool expédiées", contenu: "Coopérative Oasis de Douz a expédié vos Medjool Jumbo (Rapid-Poste).", lien: "/compte/commandes/DGL-2026-000120", lue: true, creeLe: "2026-10-15T10:00:00+01:00" },
  { id: "n-06", type: "NOUVEL_AVIS", titre: "Merci pour votre avis", contenu: "Palmeraie Ben Amor a répondu à votre avis sur la Deglet Nour Extra branchée.", lien: "/produit/deglet-nour-extra-branchee", lue: true, creeLe: "2026-10-15T09:00:00+01:00" },
  { id: "n-07", type: "STOCK_BAS", titre: "Un favori bientôt épuisé", contenu: "Plus que 4 boîtes de « Dattes fourrées aux amandes ».", lien: "/produit/dattes-fourrees-aux-amandes", lue: false, creeLe: "2026-10-14T18:00:00+01:00" },
  { id: "n-08", type: "COMMANDE_STATUT", titre: "Commande livrée", contenu: "Votre commande DGL-2026-000118 a été livrée. Dites-nous ce que vous en pensez !", lien: "/compte/commandes/DGL-2026-000118", lue: true, creeLe: "2026-10-08T14:20:00+01:00" },
  { id: "n-09", type: "LITIGE", titre: "Remboursement effectué", contenu: "Le coffret « Oasis » de la commande DGL-2026-000109 vous a été remboursé (35,100 DT).", lien: "/compte/commandes/DGL-2026-000109", lue: true, creeLe: "2026-09-30T11:00:00+01:00" },
  { id: "n-10", type: "NOUVEAU_MESSAGE", titre: "Réponse de Maison Rob Gabès", contenu: "« Le rob se conserve un an à l'abri de la lumière… »", lien: "/compte/messages", lue: true, creeLe: "2026-09-28T17:45:00+01:00" },
  { id: "n-11", type: "COMMANDE_STATUT", titre: "Commande annulée", contenu: "La commande DGL-2026-000104 a été annulée à votre demande.", lien: "/compte/commandes/DGL-2026-000104", lue: true, creeLe: "2026-09-11T09:00:00+01:00" },
  { id: "n-12", type: "FOURNISSEUR_VALIDE", titre: "Bienvenue sur DEGLA", contenu: "Votre compte est prêt. Découvrez les dattes de la récolte 2026.", lien: "/catalogue", lue: true, creeLe: "2026-09-01T09:00:00+01:00" },
];

export const NOTIFICATIONS_FOURNISSEUR: Notification[] = [
  { id: "nf-01", type: "NOUVELLE_COMMANDE", titre: "Nouvelle commande", contenu: "Sarra (Tunis) a commandé 2 kg de Deglet Nour Extra branchée.", lien: "/vendeur/commandes/DGL-2026-000150-A", lue: false, creeLe: "2026-10-18T09:12:00+01:00" },
  { id: "nf-02", type: "MODELE_3D_PRET", titre: "Modèle 3D prêt", contenu: "Le modèle de « Kenta bio en barquette » est prêt à être publié.", lien: "/vendeur/studio-3d/m3d-06", lue: false, creeLe: "2026-10-18T08:00:00+01:00" },
  { id: "nf-03", type: "STOCK_BAS", titre: "Stock bas", contenu: "Plus que 4 boîtes de « Dattes fourrées aux amandes ».", lien: "/vendeur/produits/p24", lue: false, creeLe: "2026-10-17T19:00:00+01:00" },
  { id: "nf-04", type: "NOUVEL_AVIS", titre: "Nouvel avis 5 étoiles", contenu: "Seifeddine A. a noté « Dattes fourrées aux amandes ».", lien: "/vendeur/avis", lue: true, creeLe: "2026-10-15T12:00:00+01:00" },
  { id: "nf-05", type: "MODELE_3D_ECHEC", titre: "Échec de génération 3D", contenu: "« Dattes fourrées aux amandes » : photos trop sombres. 2 crédits restitués.", lien: "/vendeur/studio-3d", lue: true, creeLe: "2026-10-16T15:12:00+01:00" },
  { id: "nf-06", type: "ACHAT_CREDITS_CONFIRME", titre: "Crédits ajoutés", contenu: "Pack Pro : 20 crédits 3D ont été ajoutés à votre solde.", lien: "/vendeur/credits", lue: true, creeLe: "2026-10-10T19:31:00+01:00" },
];
