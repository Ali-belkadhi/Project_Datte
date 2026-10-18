// données de démonstration — ventes du vendeur de démo (Palmeraie Ben Amor) et versements
import type { PointVentes, RepartitionVariete, TopProduit, Versement } from "@/types/domain";

/** Pseudo-aléatoire déterministe (pas de Math.random : rendu stable). */
function onde(i: number, graine: number) {
  return (Math.sin(i * 1.7 + graine) + Math.sin(i * 0.43 + graine * 2) * 0.6 + 1.6) / 3.2;
}

/** Chiffre d'affaires quotidien sur 30 jours (jusqu'au 18 octobre 2026). */
export const VENTES_30J: PointVentes[] = Array.from({ length: 30 }, (_, i) => {
  const date = new Date(Date.UTC(2026, 9, 18 - 29 + i)).toISOString();
  const tendance = 0.75 + i / 60; // montée en saison
  const weekend = [5, 6].includes(new Date(date).getUTCDay()) ? 1.25 : 1;
  const ca = Math.round((180000 + onde(i, 3) * 260000) * tendance * weekend);
  return { date, chiffreAffaires: ca - (ca % 100), commandes: Math.max(2, Math.round(ca / 52000)) };
});

/** 12 derniers mois (agrégat mensuel). */
export const VENTES_12M: PointVentes[] = Array.from({ length: 12 }, (_, i) => {
  const mois = (9 - 11 + i + 12) % 12;
  const annee = i < 2 ? 2025 : 2026;
  const saison = [9, 10, 11, 0].includes(mois) ? 2.1 : [8, 1, 2].includes(mois) ? 1.3 : 0.7;
  const ca = Math.round((3200000 + onde(i, 7) * 2400000) * saison);
  return {
    date: new Date(Date.UTC(annee, mois, 1)).toISOString(),
    chiffreAffaires: ca - (ca % 1000),
    commandes: Math.round(ca / 48000),
  };
});

export const TOP_PRODUITS: TopProduit[] = [
  { produitId: "p01", nom: "Deglet Nour Extra branchée", ventes: 142, chiffreAffaires: 3621000 },
  { produitId: "p07", nom: "Medjool en boîte cadeau", ventes: 64, chiffreAffaires: 2688000 },
  { produitId: "p24", nom: "Dattes fourrées aux amandes", ventes: 58, chiffreAffaires: 1305000 },
  { produitId: "p03", nom: "Deglet Nour bio en barquette", ventes: 47, chiffreAffaires: 1170300 },
  { produitId: "p19", nom: "Pâte de datte (ghars)", ventes: 91, chiffreAffaires: 627900 },
];

export const REPARTITION_VARIETES: RepartitionVariete[] = [
  { variete: "deglet-nour", nom: "Deglet Nour", part: 58 },
  { variete: "medjool", nom: "Medjool", part: 21 },
  { variete: "alig", nom: "Alig", part: 12 },
  { variete: "khouat-alig", nom: "Khouat Alig", part: 6 },
  { variete: "kenta", nom: "Kenta", part: 3 },
];

export const VERSEMENTS: Versement[] = [
  { id: "v-10", reference: "VRS-2026-10-B", periodeDebut: "2026-10-16", periodeFin: "2026-10-31", montantBrut: 4218000, commission: 337440, montantNet: 3880560, statut: "PLANIFIE", dateVersement: "2026-11-03" },
  { id: "v-09", reference: "VRS-2026-10-A", periodeDebut: "2026-10-01", periodeFin: "2026-10-15", montantBrut: 5104500, commission: 408360, montantNet: 4696140, statut: "EFFECTUE", dateVersement: "2026-10-17" },
  { id: "v-08", reference: "VRS-2026-09-B", periodeDebut: "2026-09-16", periodeFin: "2026-09-30", montantBrut: 3630000, commission: 290400, montantNet: 3339600, statut: "EFFECTUE", dateVersement: "2026-10-02" },
  { id: "v-07", reference: "VRS-2026-09-A", periodeDebut: "2026-09-01", periodeFin: "2026-09-15", montantBrut: 2415800, commission: 193264, montantNet: 2222536, statut: "EFFECTUE", dateVersement: "2026-09-17" },
  { id: "v-06", reference: "VRS-2026-08-B", periodeDebut: "2026-08-16", periodeFin: "2026-08-31", montantBrut: 1288000, commission: 103040, montantNet: 1184960, statut: "ECHOUE", dateVersement: "2026-09-02" },
  { id: "v-05", reference: "VRS-2026-08-A", periodeDebut: "2026-08-01", periodeFin: "2026-08-15", montantBrut: 1102500, commission: 88200, montantNet: 1014300, statut: "EFFECTUE", dateVersement: "2026-08-18" },
];
