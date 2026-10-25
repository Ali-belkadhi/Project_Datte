// MODULE C — géocodage pour le choix de l'adresse de livraison sur la carte (OpenStreetMap / Nominatim).
//   GET /api/geocodage?lat=36.8&lng=10.18  → adresse la plus proche
//   GET /api/geocodage?q=rue de marseille  → 5 adresses en Tunisie
import { z } from "zod";
import { adresseDepuisPosition, rechercherAdresses } from "@/server/integrations/geocodage/nominatim";

const position = z.object({ lat: z.coerce.number().min(-90).max(90), lng: z.coerce.number().min(-180).max(180) });
const recherche = z.object({ q: z.string().trim().min(3).max(200) });

export async function GET(request: Request) {
  const params = Object.fromEntries(new URL(request.url).searchParams);
  try {
    if ("q" in params) {
      const p = recherche.safeParse(params);
      if (!p.success) return Response.json({ error: "VALIDATION" }, { status: 400 });
      return Response.json({ resultats: await rechercherAdresses(p.data.q) });
    }
    const p = position.safeParse(params);
    if (!p.success) return Response.json({ error: "VALIDATION" }, { status: 400 });
    return Response.json({ adresse: await adresseDepuisPosition(p.data.lat, p.data.lng) });
  } catch (e) {
    console.error("[geocodage]", e);
    return Response.json({ error: "GEOCODAGE_INDISPONIBLE" }, { status: 502 });
  }
}
