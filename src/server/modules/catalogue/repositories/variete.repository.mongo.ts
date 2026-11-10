import "server-only";
import { connectMongo } from "@/server/core/mongo";
import { VARIETES } from "@/mocks/varietes";
import type { Variete } from "@/types/domain";
import type { VarieteRepository } from "./variete.repository";
import { VarieteModel, type IVarieteDocument } from "./variete.model";

function toVariete(doc: IVarieteDocument): Variete {
  return {
    slug: doc.slug as Variete["slug"],
    nom: doc.nom,
    nomArabe: doc.nomArabe || "",
    origine: doc.origine,
    couleur: doc.couleur || "",
    texture: doc.texture || "",
    saveur: doc.saveur || "",
    saison: doc.saison || "Octobre – Décembre",
    calibre: doc.calibre || "4 à 5 cm",
    resume: doc.resume || doc.nom,
    description: doc.description || "",
    usages: doc.usages || [],
  };
}

async function assurerInitialisation() {
  await connectMongo();
  const count = await VarieteModel.countDocuments();
  if (count === 0) {
    for (const v of VARIETES) {
      await VarieteModel.create({
        slug: v.slug,
        nom: v.nom,
        nomArabe: v.nomArabe,
        origine: v.origine,
        couleur: v.couleur,
        texture: v.texture,
        saveur: v.saveur,
        saison: v.saison,
        calibre: v.calibre,
        resume: v.resume,
        description: v.description,
        usages: v.usages,
        active: true,
      });
    }
  }
}

export const varieteRepositoryMongo: VarieteRepository = {
  async lister(): Promise<Variete[]> {
    await assurerInitialisation();
    const docs = await VarieteModel.find({ active: { $ne: false } }).sort({ nom: 1 }).lean<IVarieteDocument[]>();
    return docs.map(toVariete);
  },

  async parSlug(slug: string): Promise<Variete | null> {
    await assurerInitialisation();
    const doc = await VarieteModel.findOne({ slug }).lean<IVarieteDocument | null>();
    return doc ? toVariete(doc) : null;
  },

  async creer(data: Omit<Partial<Variete>, "slug"> & { slug: string; nom: string }): Promise<Variete> {
    await connectMongo();
    const slug = data.slug.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");
    const doc = await VarieteModel.create({
      slug,
      nom: data.nom,
      nomArabe: data.nomArabe || "",
      origine: data.origine || "Djérid",
      couleur: data.couleur || "",
      texture: data.texture || "",
      saveur: data.saveur || "",
      saison: data.saison || "Octobre – Décembre",
      calibre: data.calibre || "4 à 5 cm",
      resume: data.resume || data.nom,
      description: data.description || "",
      usages: data.usages || [],
      active: true,
    });
    return toVariete(doc);
  },

  async maj(slug: string, data: Partial<Variete>): Promise<Variete | null> {
    await connectMongo();
    const doc = await VarieteModel.findOneAndUpdate(
      { slug },
      { $set: data },
      { new: true }
    ).lean<IVarieteDocument | null>();
    return doc ? toVariete(doc) : null;
  },

  async supprimer(slug: string): Promise<boolean> {
    await connectMongo();
    const res = await VarieteModel.deleteOne({ slug });
    return res.deletedCount > 0;
  },
};
