// données de démonstration — crédits 3D et modèles du vendeur de démo
import type { Modele3DVendeur, MouvementCredit3D, PackCredits3D, SoldeCredits3D } from "@/types/domain";

export const PACKS_CREDITS: PackCredits3D[] = [
  { id: "pack-decouverte", nom: "Découverte", nombreCredits: 5, prix: 25000, description: "Pour tester la 3D sur vos produits phares.", misEnAvant: false },
  { id: "pack-pro", nom: "Pro", nombreCredits: 20, prix: 80000, description: "Tout votre catalogue en 3D, avec quelques régénérations.", misEnAvant: true },
  { id: "pack-cooperative", nom: "Coopérative", nombreCredits: 50, prix: 175000, description: "Pour les grandes boutiques et les coopératives.", misEnAvant: false },
];

export const SOLDE_CREDITS: SoldeCredits3D = { solde: 12, seuilBas: 3, coutImage: 1, coutMultiImage: 2 };

export const MOUVEMENTS_CREDITS: MouvementCredit3D[] = [
  { id: "mc-10", type: "RESERVATION", quantite: -2, soldeApres: 12, motif: "Génération « Deglet Nour bio en barquette »", creeLe: "2026-10-18T08:40:00+01:00" },
  { id: "mc-09", type: "RESTITUTION", quantite: 2, soldeApres: 14, motif: "Échec « Dattes fourrées aux amandes » — crédits restitués", creeLe: "2026-10-16T15:12:00+01:00" },
  { id: "mc-08", type: "RESERVATION", quantite: -2, soldeApres: 12, motif: "Génération « Dattes fourrées aux amandes »", creeLe: "2026-10-16T14:55:00+01:00" },
  { id: "mc-07", type: "CONSOMMATION", quantite: -2, soldeApres: 14, motif: "Modèle « Kenta bio en barquette »", creeLe: "2026-10-14T10:02:00+01:00" },
  { id: "mc-06", type: "CONSOMMATION", quantite: -2, soldeApres: 16, motif: "Modèle « Khouat Alig de Nefta »", creeLe: "2026-10-02T11:20:00+01:00" },
  { id: "mc-05", type: "CONSOMMATION", quantite: -2, soldeApres: 18, motif: "Modèle « Pâte de datte (ghars) »", creeLe: "2026-09-28T09:45:00+01:00" },
  { id: "mc-04", type: "ACHAT", quantite: 20, soldeApres: 20, motif: "Pack Pro — 80,000 DT", creeLe: "2026-09-24T19:30:00+01:00" },
  { id: "mc-03", type: "CONSOMMATION", quantite: -2, soldeApres: 0, motif: "Modèle « Medjool en boîte cadeau »", creeLe: "2026-09-21T16:00:00+01:00" },
  { id: "mc-02", type: "CONSOMMATION", quantite: -1, soldeApres: 2, motif: "Modèle « Deglet Nour Extra branchée »", creeLe: "2026-09-15T10:10:00+01:00" },
  { id: "mc-01", type: "BONUS", quantite: 3, soldeApres: 3, motif: "Crédits offerts à l'ouverture de la boutique", creeLe: "2026-09-01T09:00:00+01:00" },
];

export const MODELES_3D: Modele3DVendeur[] = [
  { id: "m3d-01", produitId: "p01", produitNom: "Deglet Nour Extra branchée", source: { kind: "procedural-date", variete: "deglet-nour", arrangement: "cluster" }, visuel: "branchee", variete: "deglet-nour", statut: "PUBLIE", progression: 100, creeLe: "2026-09-15T10:10:00+01:00", creditsConsommes: 1, polycount: 48200 },
  { id: "m3d-02", produitId: "p07", produitNom: "Medjool en boîte cadeau", source: { kind: "procedural-date", variete: "medjool", arrangement: "box" }, visuel: "boite", variete: "medjool", statut: "PUBLIE", progression: 100, creeLe: "2026-09-21T16:00:00+01:00", creditsConsommes: 2, polycount: 36400 },
  { id: "m3d-03", produitId: "p08", produitNom: "Alig de Tozeur", source: { kind: "procedural-date", variete: "alig", arrangement: "pile" }, visuel: "vrac", variete: "alig", statut: "PUBLIE", progression: 100, creeLe: "2026-09-25T12:30:00+01:00", creditsConsommes: 0, polycount: 29800 },
  { id: "m3d-04", produitId: "p11", produitNom: "Khouat Alig de Nefta", source: { kind: "procedural-date", variete: "khouat-alig", arrangement: "single" }, visuel: "vrac", variete: "khouat-alig", statut: "PUBLIE", progression: 100, creeLe: "2026-10-02T11:20:00+01:00", creditsConsommes: 2, polycount: 12600 },
  { id: "m3d-05", produitId: "p19", produitNom: "Pâte de datte (ghars)", source: { kind: "procedural-product", produit: "bocal", variete: "alig", etiquette: "Pâte de datte" }, visuel: "bocal", variete: "alig", statut: "PUBLIE", progression: 100, creeLe: "2026-09-28T09:45:00+01:00", creditsConsommes: 2, polycount: 18900 },
  { id: "m3d-06", produitId: "p16", produitNom: "Kenta bio en barquette", source: { kind: "procedural-date", variete: "kenta", arrangement: "pile" }, visuel: "barquette", variete: "kenta", statut: "PRET", progression: 100, creeLe: "2026-10-14T10:02:00+01:00", creditsConsommes: 2, polycount: 27300 },
  { id: "m3d-07", produitId: "p03", produitNom: "Deglet Nour bio en barquette", source: null, visuel: "barquette", variete: "deglet-nour", statut: "EN_COURS", progression: 64, creeLe: "2026-10-18T08:40:00+01:00", creditsConsommes: 2 },
  { id: "m3d-08", produitId: "p24", produitNom: "Dattes fourrées aux amandes", source: null, visuel: "boite", variete: "deglet-nour", statut: "ECHEC", progression: 0, creeLe: "2026-10-16T14:55:00+01:00", creditsConsommes: 0 },
];
