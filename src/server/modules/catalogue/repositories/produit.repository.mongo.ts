import "server-only";
import mongoose from "mongoose";
import { connectDB } from "@/server/core/mongo";
import { VARIETE_SLUGS, type ProduitInput } from "@/lib/validation/catalogue";
import type { FiltresCatalogue, Produit, VarieteSlug, VisuelProduit } from "@/types/domain";
import type { CategorieQualite, Gouvernorat, Maturite, Presentation, StatutProduit, TypeDerive } from "@/types/enums";
import { VARIETY_PRESETS } from "@/components/three/presets";
import { applyFiltres } from "./filtres";
import { ProductModel } from "./produit.model";
import type { ProduitRepository } from "./produit.repository";

/**
 * Repository MongoDB du catalogue : persiste les `Produit` du domaine DEGLA dans la collection `products`
 * de degla-module-b. Conversions : prix TND <-> millimes, stock kg <-> grammes (dattes) ou unités (dérivés).
 */

/** Fournisseur de test : les produits créés avant l'intégration (supplierId « fournisseur-001 ») appartiennent à la boutique de démo. */
const LEGACY_SUPPLIER = "fournisseur-001";
const DEMO_FOURNISSEUR = "f-ben-amor";
const versFournisseur = (supplierId: string) => (supplierId === LEGACY_SUPPLIER ? DEMO_FOURNISSEUR : supplierId);
const supplierIds = (fournisseurId: string) => (fournisseurId === DEMO_FOURNISSEUR ? [DEMO_FOURNISSEUR, LEGACY_SUPPLIER] : [fournisseurId]);

type Doc = Record<string, unknown>;

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const OBJECT_ID = /[a-f0-9]{24}$/;

function varieteDe(doc: Doc): VarieteSlug | undefined {
  const brut = String(doc.varietySlug ?? slugify(String(doc.category ?? "")));
  return (VARIETE_SLUGS as readonly string[]).includes(brut) ? (brut as VarieteSlug) : undefined;
}

export function documentVersProduit(doc: Doc): Produit {
  const id = String(doc._id);
  const nom = String(doc.name);
  const photos = [String(doc.imageUrl ?? ""), ...((doc.images as string[] | undefined) ?? [])].filter(Boolean);
  const statut = (doc.status as StatutProduit | undefined) ?? (doc.published ? "PUBLIE" : "BROUILLON");
  const creeLe = doc.createdAt instanceof Date ? doc.createdAt.toISOString() : String(doc.createdAt ?? new Date(0).toISOString());
  const modelUrl = String(doc.modelUrl ?? "");
  const base = {
    id,
    slug: `${slugify(nom) || "produit"}-${id}`,
    nom,
    description: String(doc.description ?? ""),
    fournisseurId: versFournisseur(String(doc.supplierId)),
    regionOrigine: (doc.region as Gouvernorat | undefined) ?? "TOZEUR",
    bio: Boolean(doc.organic),
    noteMoyenne: 0,
    nombreAvis: 0,
    nombreVentes: 0,
    photos,
    // Le badge / l'onglet 3D n'existent que si un vrai fichier GLB est enregistré.
    modele3D: modelUrl ? ({ kind: "glb", url: modelUrl } as const) : null,
    statut,
    creeLe,
  };
  const prixMillimes = Math.round(Number(doc.price) * 1000);

  if (doc.productType === "DERIVE") {
    const typeDerive = ((doc.derivedType as TypeDerive | undefined) ?? "AUTRE") as TypeDerive;
    const unite = (doc.contentUnit as "ML" | "G" | undefined) ?? "G";
    return {
      ...base,
      typeProduit: "DERIVE",
      typeDerive,
      variete: varieteDe(doc),
      contenance: Number(doc.contentAmount ?? 0),
      uniteContenance: unite,
      prixUnitaire: prixMillimes,
      stockUnites: Math.round(Number(doc.stock)),
      ingredients: String(doc.ingredients ?? ""),
      visuel: { type: (unite === "ML" ? "bouteille" : "bocal") as VisuelProduit },
    };
  }
  const presentation = ((doc.presentation as Presentation | undefined) ?? "VRAC") as Presentation;
  return {
    ...base,
    typeProduit: "DATTE",
    variete: varieteDe(doc) ?? "deglet-nour",
    categorieQualite: ((doc.quality as CategorieQualite | undefined) ?? "EXTRA") as CategorieQualite,
    presentation,
    maturite: ((doc.maturity as Maturite | undefined) ?? "TAMR") as Maturite,
    anneeRecolte: Number(doc.harvestYear ?? 2026),
    prixParKg: prixMillimes,
    stockGrammes: Math.round(Number(doc.stock) * 1000),
    optionsPoids: (doc.weightOptions as number[] | undefined)?.length ? (doc.weightOptions as number[]) : [500, 1000, 2000],
    visuel: { type: (presentation === "BRANCHEE" ? "branchee" : presentation === "CONDITIONNEE" ? "barquette" : "vrac") as VisuelProduit },
  };
}

/** Domaine -> document Mongo (champs historiques conservés pour rester compatibles avec degla-module-b). */
function entreeVersDocument(d: ProduitInput) {
  const commun = {
    name: d.nom,
    description: d.description,
    organic: d.bio,
    region: d.regionOrigine,
    status: d.statut,
    published: d.statut === "PUBLIE",
    imageUrl: d.photos[0] ?? "",
    images: d.photos.slice(1),
    modelUrl: d.modele3DUrl,
  };
  if (d.typeProduit === "DATTE")
    return {
      ...commun,
      productType: "DATTE",
      price: d.prixParKg / 1000,
      stock: d.stockGrammes / 1000,
      category: VARIETY_PRESETS[d.variete].nom,
      varietySlug: d.variete,
      quality: d.categorieQualite,
      presentation: d.presentation,
      maturity: d.maturite,
      harvestYear: d.anneeRecolte,
      weightOptions: d.optionsPoids,
    };
  return {
    ...commun,
    productType: "DERIVE",
    price: d.prixUnitaire / 1000,
    stock: d.stockUnites,
    category: d.typeDerive,
    derivedType: d.typeDerive,
    varietySlug: d.variete ?? "",
    contentAmount: d.contenance,
    contentUnit: d.uniteContenance,
    ingredients: d.ingredients,
  };
}

const lire = (docs: unknown[]) => docs.map((d) => documentVersProduit(d as Doc));

export const produitRepositoryMongo: ProduitRepository = {
  async lister(f: FiltresCatalogue) {
    await connectDB();
    const requete: Record<string, unknown> = f.fournisseurId ? { supplierId: { $in: supplierIds(f.fournisseurId) } } : { published: true };
    return applyFiltres(lire(await ProductModel.find(requete).sort({ createdAt: -1 }).lean()), f);
  },
  async parSlug(slug) {
    const id = OBJECT_ID.exec(slug)?.[0];
    if (!id) return null;
    const p = await this.parId(id);
    return p && p.statut === "PUBLIE" ? p : null;
  },
  async parId(id) {
    if (!mongoose.isValidObjectId(id)) return null;
    await connectDB();
    const doc = await ProductModel.findById(id).lean();
    return doc ? documentVersProduit(doc as Doc) : null;
  },
  async parIds(ids) {
    const valides = ids.filter((i) => mongoose.isValidObjectId(i));
    if (!valides.length) return [];
    await connectDB();
    return lire(await ProductModel.find({ _id: { $in: valides }, published: true }).lean());
  },
  async parFournisseur(fournisseurId) {
    await connectDB();
    return lire(await ProductModel.find({ supplierId: { $in: supplierIds(fournisseurId) } }).sort({ createdAt: -1 }).lean());
  },
  async creer(data, fournisseurId) {
    await connectDB();
    const doc = await ProductModel.create({ ...entreeVersDocument(data), supplierId: fournisseurId });
    return documentVersProduit(doc.toObject() as Doc);
  },
  async maj(id, data, fournisseurId) {
    if (!mongoose.isValidObjectId(id)) return null;
    await connectDB();
    // Le filtre supplierId empêche de modifier le produit d'un autre fournisseur.
    const doc = await ProductModel.findOneAndUpdate(
      { _id: id, supplierId: { $in: supplierIds(fournisseurId) } },
      { $set: entreeVersDocument(data) },
      { new: true, runValidators: true },
    ).lean();
    return doc ? documentVersProduit(doc as Doc) : null;
  },
  async supprimer(id, fournisseurId) {
    if (!mongoose.isValidObjectId(id)) return false;
    await connectDB();
    const r = await ProductModel.deleteOne({ _id: id, supplierId: { $in: supplierIds(fournisseurId) } });
    return r.deletedCount === 1;
  },
};
