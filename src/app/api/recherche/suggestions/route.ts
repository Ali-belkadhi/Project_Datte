import { NextResponse } from "next/server";
import { rechercher } from "@/server/modules/catalogue/services/recherche";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";

  if (!q.trim()) {
    return NextResponse.json({ varietes: [], produits: [], boutiques: [] });
  }

  const resultats = await rechercher(q);

  return NextResponse.json({
    varietes: resultats.varietes.slice(0, 4),
    produits: resultats.produits.slice(0, 6).map((item) => ({
      id: item.produit.id,
      slug: item.produit.slug,
      nom: item.produit.nom,
      prix: "prixParKg" in item.produit ? item.produit.prixParKg : item.produit.prixUnitaire,
      typeProduit: item.produit.typeProduit,
      variete: item.produit.variete,
      photo: item.produit.photos?.[0] ?? null,
      vendeur: item.vendeur.nomBoutique,
    })),
    boutiques: resultats.boutiques.slice(0, 3).map((b) => ({
      id: b.id,
      slug: b.slug,
      nom: b.nomBoutique,
      ville: b.ville,
      verifie: b.verifie,
    })),
  });
}
