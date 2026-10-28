// MODULE B — Catalogue (Ali Belkathi)
import "server-only";
import { listFournisseursVerifies } from "@/server/contracts/comptes";
import { varieteRepository } from "../repositories";
import { listProduits } from "./produits";

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

export const RECHERCHES_POPULAIRES = [
  "Deglet Nour branchée",
  "Medjool",
  "Rob de datte",
  "Coffret cadeau",
  "Dattes bio",
  "Café de noyaux",
];

/** Recherche groupée : variétés, produits, boutiques. TODO(module B) : recherche plein texte PostgreSQL. */
export async function rechercher(q: string) {
  const terme = norm(q.trim());
  const [varietes, produits, boutiques] = await Promise.all([
    varieteRepository.lister(),
    listProduits(terme ? { q } : { tri: "notes" }),
    listFournisseursVerifies(),
  ]);
  if (!terme) return { varietes: varietes.slice(0, 4), produits: produits.slice(0, 8), boutiques: boutiques.slice(0, 3) };
  return {
    varietes: varietes.filter((v) => norm(`${v.nom} ${v.origine} ${v.saveur}`).includes(terme)),
    produits,
    boutiques: boutiques.filter((b) => norm(`${b.nomBoutique} ${b.ville}`).includes(terme)),
  };
}

/** Index léger pour la palette ⌘K (client) : libellé + lien. */
export async function indexRecherche() {
  const [varietes, produits, boutiques] = await Promise.all([
    varieteRepository.lister(),
    listProduits({}),
    listFournisseursVerifies(),
  ]);
  return {
    varietes: varietes.map((v) => ({ label: v.nom, sous: v.origine, href: `/variete/${v.slug}`, variete: v.slug })),
    produits: produits.map(({ produit, vendeur }) => ({ label: produit.nom, sous: vendeur.nomBoutique, href: `/produit/${produit.slug}`, variete: produit.variete })),
    boutiques: boutiques.map((b) => ({ label: b.nomBoutique, sous: b.ville, href: `/boutique/${b.slug}` })),
  };
}

export type IndexRecherche = Awaited<ReturnType<typeof indexRecherche>>;
