// MODULE C — Commandes (Karim Ouertatani) — statistiques de ventes calculées depuis MongoDB (EF-18).
import "server-only";
import type { Filter } from "mongodb";
import type { KpiVentes, PointVentes, RepartitionVariete, TopProduit } from "@/types/domain";
import type { VarieteSlug } from "@/types/model-source";
import { VARIETY_PRESETS } from "@/components/three/presets";
import { getUtilisateurCourant } from "@/server/contracts/comptes";
import { db, type SousCommandeDoc } from "../repositories/mongo";

const JOUR = 864e5;
/** Colis qui comptent comme des ventes : payés et non annulés / refusés / remboursés. */
const VENDU: Filter<SousCommandeDoc> = { statut: { $in: ["ACCEPTEE", "EN_PREPARATION", "EXPEDIEE", "LIVREE", "EN_ATTENTE"] }, enAttentePaiement: { $ne: true } };

async function colisVendus(fournisseurId: string | null, depuis: Date) {
  return (await db.sousCommandes())
    .find({ ...VENDU, ...(fournisseurId ? { fournisseurId } : {}), creeLe: { $gte: depuis.toISOString() } })
    .toArray();
}

const debutJour = (d: Date) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));

function serieJours(colis: SousCommandeDoc[], jours: number, fin = new Date()): PointVentes[] {
  const d0 = debutJour(new Date(fin.getTime() - (jours - 1) * JOUR));
  const serie = Array.from({ length: jours }, (_, i) => ({ date: new Date(d0.getTime() + i * JOUR).toISOString(), chiffreAffaires: 0, commandes: 0 }));
  for (const s of colis) {
    const i = Math.floor((debutJour(new Date(s.creeLe)).getTime() - d0.getTime()) / JOUR);
    if (i >= 0 && i < jours) {
      serie[i].chiffreAffaires += s.sousTotal;
      serie[i].commandes += 1;
    }
  }
  return serie;
}

function serieMois(colis: SousCommandeDoc[], fin = new Date()): PointVentes[] {
  const serie = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(Date.UTC(fin.getUTCFullYear(), fin.getUTCMonth() - 11 + i, 1));
    return { date: d.toISOString(), chiffreAffaires: 0, commandes: 0 };
  });
  for (const s of colis) {
    const d = new Date(s.creeLe);
    const i = serie.findIndex((p) => new Date(p.date).getUTCFullYear() === d.getUTCFullYear() && new Date(p.date).getUTCMonth() === d.getUTCMonth());
    if (i >= 0) {
      serie[i].chiffreAffaires += s.sousTotal;
      serie[i].commandes += 1;
    }
  }
  return serie;
}

const somme = (s: PointVentes[], k: "chiffreAffaires" | "commandes") => s.reduce((a, p) => a + p[k], 0);
const variation = (actuel: number, precedent: number) => (precedent === 0 ? 0 : Math.round(((actuel - precedent) / precedent) * 1000) / 10);

async function fournisseurId() {
  return (await getUtilisateurCourant()).fournisseurId ?? "";
}

/** KPIs du tableau de bord vendeur : période choisie comparée à la période précédente de même durée. */
export async function kpisVendeur(periode: KpiVentes["periode"] = "30j"): Promise<KpiVentes> {
  const id = await fournisseurId();
  const jours = periode === "7j" ? 7 : periode === "30j" ? 30 : 365;
  const now = new Date();
  const colis = await colisVendus(id, new Date(now.getTime() - 2 * jours * JOUR));
  const limite = now.getTime() - jours * JOUR;
  const actuels = colis.filter((s) => new Date(s.creeLe).getTime() >= limite);
  const precedents = colis.filter((s) => new Date(s.creeLe).getTime() < limite);
  const serie = periode === "12m" ? serieMois(actuels, now) : serieJours(actuels, jours, now);
  const ca = somme(serie, "chiffreAffaires");
  const commandes = somme(serie, "commandes");
  const caPrec = precedents.reduce((a, s) => a + s.sousTotal, 0);
  const cmdPrec = precedents.length;

  const avis = await (await db.avis()).find({ fournisseurId: id, statut: "VISIBLE" }, { projection: { note: 1, creeLe: 1 } }).toArray();
  const moyenne = (l: { note: number }[]) => (l.length ? l.reduce((a, x) => a + x.note, 0) / l.length : 0);
  const recents = avis.filter((a) => new Date(a.creeLe).getTime() >= limite);
  const note = Math.round(moyenne(avis) * 10) / 10;

  return {
    periode,
    serie,
    chiffreAffaires: ca,
    variationCA: variation(ca, caPrec),
    commandes,
    variationCommandes: variation(commandes, cmdPrec),
    panierMoyen: commandes ? Math.round(ca / commandes) : 0,
    variationPanier: commandes && cmdPrec ? variation(ca / commandes, caPrec / cmdPrec) : 0,
    noteMoyenne: note,
    variationNote: recents.length && avis.length ? variation(moyenne(recents), moyenne(avis)) : 0,
  };
}

export async function topProduitsVendeur(limite = 5): Promise<TopProduit[]> {
  const colis = await colisVendus(await fournisseurId(), new Date(Date.now() - 90 * JOUR));
  const parProduit = new Map<string, TopProduit>();
  for (const l of colis.flatMap((s) => s.lignes)) {
    const p = parProduit.get(l.produitId) ?? { produitId: l.produitId, nom: l.nomProduit, ventes: 0, chiffreAffaires: 0 };
    p.ventes += 1;
    p.chiffreAffaires += l.total;
    parProduit.set(l.produitId, p);
  }
  return [...parProduit.values()].sort((a, b) => b.chiffreAffaires - a.chiffreAffaires).slice(0, limite);
}

export async function repartitionVarietesVendeur(): Promise<RepartitionVariete[]> {
  const colis = await colisVendus(await fournisseurId(), new Date(Date.now() - 90 * JOUR));
  const parVariete = new Map<VarieteSlug, number>();
  for (const l of colis.flatMap((s) => s.lignes)) if (l.variete) parVariete.set(l.variete, (parVariete.get(l.variete) ?? 0) + l.total);
  const total = [...parVariete.values()].reduce((a, v) => a + v, 0);
  return [...parVariete.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([variete, v]) => ({ variete, nom: VARIETY_PRESETS[variete]?.nom ?? variete, part: total ? Math.round((v / total) * 100) : 0 }));
}

/** Ventes de toute la plateforme sur 30 jours (tableau de bord admin). */
export async function seriePlateforme() {
  return serieJours(await colisVendus(null, new Date(Date.now() - 30 * JOUR)), 30);
}
