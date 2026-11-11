/**
 * Formatage — seule source de vérité pour l'affichage des montants, poids et dates.
 * Montants en millimes (1 DT = 1000), poids en grammes.
 * Le fuseau est fixé (Africa/Tunis) pour un rendu identique serveur / client (hydratation).
 */

const TZ = "Africa/Tunis";

const prixFormatter = new Intl.NumberFormat("fr-TN", {
  minimumFractionDigits: 3,
  maximumFractionDigits: 3,
});

/** 18500 → "18,500 DT" */
export const formatPrix = (millimes: number) => prixFormatter.format(millimes / 1000) + " DT";

/** 18500 → "18,500" (sans devise) */
export const formatMontant = (millimes: number) => prixFormatter.format(millimes / 1000);

/** 1500 → "1,5 kg" ; 500 → "500 g" */
export const formatPoids = (g: number) =>
  g >= 1000 ? `${(g / 1000).toLocaleString("fr-FR")} kg` : `${g} g`;

/** 1000 ML → "1 L" ; 500 ML → "500 ml" ; 350 G → "350 g" */
export const formatContenance = (valeur: number, unite: "ML" | "G") => {
  if (unite === "ML") return valeur >= 1000 ? `${(valeur / 1000).toLocaleString("fr-FR")} L` : `${valeur} ml`;
  return formatPoids(valeur);
};

const dateLongue = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: TZ,
});
const dateCourte = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "short",
  timeZone: TZ,
});
const heure = new Intl.DateTimeFormat("fr-FR", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: TZ,
});

/** "18 octobre 2026" */
export const formatDate = (iso: string) => dateLongue.format(new Date(iso));
/** "18 oct." */
export const formatDateCourte = (iso: string) => dateCourte.format(new Date(iso));
/** "14:32" */
export const formatHeure = (iso: string) => heure.format(new Date(iso));
/** "18 oct. · 14:32" */
export const formatDateHeure = (iso: string) => `${formatDateCourte(iso)} · ${formatHeure(iso)}`;

/** 4.75 → "4,8" */
export const formatNote = (note: number) =>
  note.toLocaleString("fr-FR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

/** 12.4 → "+12,4 %" */
export const formatVariation = (pct: number) =>
  `${pct > 0 ? "+" : pct < 0 ? "−" : ""}${Math.abs(pct).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} %`;

/** 1234 → "1 234" */
export const formatNombre = (n: number) => n.toLocaleString("fr-FR");

/** Date de référence de la démo : les mocks sont datés autour de ce jour. */
export const DEMO_NOW = "2026-10-18T10:00:00+01:00";

/** "Aujourd'hui" / "Cette semaine" / "Plus ancien" par rapport à DEMO_NOW. */
export function groupeTemporel(iso: string): "Aujourd'hui" | "Cette semaine" | "Plus ancien" {
  const diff = new Date(DEMO_NOW).getTime() - new Date(iso).getTime();
  const jour = 24 * 3600 * 1000;
  if (diff < jour) return "Aujourd'hui";
  if (diff < 7 * jour) return "Cette semaine";
  return "Plus ancien";
}

/** Prix d'une ligne : datte (prix/kg × grammes) ou dérivé (prix × unités). */
export function totalLigne(prix: number, quantiteGrammes?: number, quantiteUnites?: number) {
  if (quantiteGrammes !== undefined) return Math.round((prix * quantiteGrammes) / 1000);
  return prix * (quantiteUnites ?? 1);
}
