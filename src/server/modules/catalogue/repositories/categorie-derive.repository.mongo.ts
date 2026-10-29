import "server-only";
import { connectMongo } from "@/server/core/mongo";
import { CategorieDeriveModel, type ICategorieDeriveDocument } from "./categorie-derive.model";

export interface CategorieDeriveItem {
  id: string;
  code: string;
  nom: string;
  description: string;
  image?: string;
  active: boolean;
}

const CATEGORIES_INITIALES: Omit<CategorieDeriveItem, "id">[] = [
  { code: "ROB", nom: "Rob & Sirop de dattes", description: "Élixir traditionnel concentré, riche en minéraux.", active: true },
  { code: "CONFITURE", nom: "Confitures & Tartinables", description: "Confitures artisanales aux dattes du Djérid.", active: true },
  { code: "PATE", nom: "Pâte de datte (Ghars)", description: "Pâte pure pour makroudh, pâtisserie et encas énergétiques.", active: true },
  { code: "JUS", nom: "Jus & Boissons de dattes", description: "Boissons naturelles énergisantes et rafraîchissantes.", active: true },
  { code: "MIEL", nom: "Miel & Nectars de dattes", description: "Nectar pur obtenu par extraction douce.", active: true },
  { code: "CAFE_NOYAUX", nom: "Café de noyaux torréfiés", description: "Substitut de café sans caféine, riche en fibres et antioxydants.", active: true },
  { code: "AUTRE", nom: "Autres spécialités", description: "Confiseries, poudres et créations originales.", active: true },
];

function toItem(doc: ICategorieDeriveDocument): CategorieDeriveItem {
  return {
    id: (doc._id as object).toString(),
    code: doc.code,
    nom: doc.nom,
    description: doc.description || "",
    image: doc.image || "",
    active: doc.active !== false,
  };
}

async function assurerInitialisation() {
  await connectMongo();
  const count = await CategorieDeriveModel.countDocuments();
  if (count === 0) {
    for (const c of CATEGORIES_INITIALES) {
      await CategorieDeriveModel.create(c);
    }
  }
}

export const categorieDeriveRepositoryMongo = {
  async lister(toutes = false): Promise<CategorieDeriveItem[]> {
    await assurerInitialisation();
    const filtre = toutes ? {} : { active: true };
    const docs = await CategorieDeriveModel.find(filtre).sort({ nom: 1 }).lean<ICategorieDeriveDocument[]>();
    return docs.map(toItem);
  },

  async parCode(code: string): Promise<CategorieDeriveItem | null> {
    await assurerInitialisation();
    const doc = await CategorieDeriveModel.findOne({ code }).lean<ICategorieDeriveDocument | null>();
    return doc ? toItem(doc) : null;
  },

  async parId(id: string): Promise<CategorieDeriveItem | null> {
    await connectMongo();
    const doc = await CategorieDeriveModel.findById(id).lean<ICategorieDeriveDocument | null>();
    return doc ? toItem(doc) : null;
  },

  async creer(data: { code: string; nom: string; description?: string; image?: string; active?: boolean }): Promise<CategorieDeriveItem> {
    await connectMongo();
    const code = data.code.toUpperCase().trim().replace(/[^A-Z0-9_]+/g, "_");
    const doc = await CategorieDeriveModel.create({
      code,
      nom: data.nom,
      description: data.description || "",
      image: data.image || "",
      active: data.active !== false,
    });
    return toItem(doc);
  },

  async maj(id: string, data: Partial<CategorieDeriveItem>): Promise<CategorieDeriveItem | null> {
    await connectMongo();
    const doc = await CategorieDeriveModel.findByIdAndUpdate(id, { $set: data }, { new: true }).lean<ICategorieDeriveDocument | null>();
    return doc ? toItem(doc) : null;
  },

  async supprimer(id: string): Promise<boolean> {
    await connectMongo();
    const res = await CategorieDeriveModel.findByIdAndDelete(id);
    return !!res;
  },
};
