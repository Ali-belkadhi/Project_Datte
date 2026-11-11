// MODULE C — géocodage OpenStreetMap (Nominatim), appelé UNIQUEMENT côté serveur.
// Politique d'usage Nominatim : 1 requête / seconde max, User-Agent identifiable, cache conseillé.
import "server-only";
import { GOUVERNORATS, type Gouvernorat } from "@/types/enums";
import { GOUVERNORAT_LABEL } from "@/lib/constants";

export type AdresseGeocodee = {
  latitude: number;
  longitude: number;
  ligne1: string;
  ville: string;
  codePostal: string;
  gouvernorat: Gouvernorat | null;
  libelleComplet: string;
};

const BASE = process.env.NOMINATIM_URL ?? "https://nominatim.openstreetmap.org";
const USER_AGENT = process.env.NOMINATIM_USER_AGENT ?? "DEGLA/1.0 (marketplace de dattes tunisiennes)";

/* -------------------------- File d'attente 1 req/s ------------------------- */

let derniere = Promise.resolve();
function limiter<T>(fn: () => Promise<T>): Promise<T> {
  const suivante = derniere.then(fn);
  derniere = suivante.then(
    () => new Promise((r) => setTimeout(r, 1100)),
    () => new Promise((r) => setTimeout(r, 1100)),
  );
  return suivante;
}

const cache = new Map<string, { expire: number; valeur: unknown }>();
async function enCache<T>(cle: string, fn: () => Promise<T>): Promise<T> {
  const hit = cache.get(cle);
  if (hit && hit.expire > Date.now()) return hit.valeur as T;
  const valeur = await limiter(fn);
  if (cache.size > 500) cache.clear();
  cache.set(cle, { expire: Date.now() + 24 * 3600e3, valeur });
  return valeur;
}

async function appeler(chemin: string, params: Record<string, string>) {
  const url = new URL(chemin, BASE);
  for (const [k, v] of Object.entries({ format: "jsonv2", addressdetails: "1", "accept-language": "fr", ...params })) url.searchParams.set(k, v);
  const r = await fetch(url, { headers: { "User-Agent": USER_AGENT, Accept: "application/json" }, signal: AbortSignal.timeout(8000) });
  if (!r.ok) throw new Error(`Nominatim ${r.status}`);
  return r.json();
}

/* ------------------------------- Conversion ------------------------------- */

const normaliser = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/gouvernorat|governorate|wilaya|\b(de|du|des|le|la)\b/g, "")
    .replace(/[^a-z]/g, "");

const INDEX_GOUVERNORATS = new Map(GOUVERNORATS.map((g) => [normaliser(GOUVERNORAT_LABEL[g]), g]));

/** « Gouvernorat de Tunis », « Kébili », « Le Kef »… → valeur de l'énumération Gouvernorat. */
export function versGouvernorat(texte?: string): Gouvernorat | null {
  if (!texte) return null;
  return INDEX_GOUVERNORATS.get(normaliser(texte)) ?? null;
}

type ResultatNominatim = {
  lat: string;
  lon: string;
  display_name: string;
  address?: Record<string, string>;
};

function convertir(r: ResultatNominatim): AdresseGeocodee {
  const a = r.address ?? {};
  const rue = [a.house_number, a.road ?? a.pedestrian ?? a.footway].filter(Boolean).join(" ");
  const quartier = a.neighbourhood ?? a.suburb ?? a.quarter ?? a.residential;
  const ville = a.city ?? a.town ?? a.village ?? a.municipality ?? a.county ?? quartier ?? "";
  return {
    latitude: Number(r.lat),
    longitude: Number(r.lon),
    ligne1: rue || quartier || r.display_name.split(",")[0],
    ville,
    codePostal: /^\d{4}$/.test(a.postcode ?? "") ? a.postcode! : "",
    gouvernorat: versGouvernorat(a.state) ?? versGouvernorat(a.county) ?? versGouvernorat(ville),
    libelleComplet: r.display_name,
  };
}

/* -------------------------------- Requêtes -------------------------------- */

/** Coordonnées → adresse (géocodage inverse). */
export async function adresseDepuisPosition(lat: number, lng: number): Promise<AdresseGeocodee | null> {
  const cle = `inv:${lat.toFixed(5)},${lng.toFixed(5)}`;
  return enCache(cle, async () => {
    const r = (await appeler("/reverse", { lat: String(lat), lon: String(lng), zoom: "18" })) as ResultatNominatim & { error?: string };
    return r.error ? null : convertir(r);
  });
}

/** Texte libre → adresses en Tunisie (5 au plus). */
export async function rechercherAdresses(q: string): Promise<AdresseGeocodee[]> {
  const cle = `rech:${q.trim().toLowerCase()}`;
  return enCache(cle, async () => {
    const r = (await appeler("/search", { q, countrycodes: "tn", limit: "5" })) as ResultatNominatim[];
    return r.map(convertir);
  });
}
