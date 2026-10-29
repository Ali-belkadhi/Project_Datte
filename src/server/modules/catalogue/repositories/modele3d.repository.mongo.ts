import "server-only";
import { connectMongo } from "@/server/core/mongo";
import { MODELES_3D } from "@/mocks/credits";
import type { Modele3DVendeur, ModelSource, Statut3D, VisuelProduit } from "@/types/domain";
import type { Modele3DRepository } from "./modele3d.repository";
import { Modele3DModel, type IModele3DDocument } from "./modele3d.model";

function toModele(doc: IModele3DDocument): Modele3DVendeur {
  const source: ModelSource | null = doc.glbUrl
    ? { kind: "glb", url: doc.glbUrl }
    : (doc.source as ModelSource | null);

  return {
    id: doc.modelId,
    produitId: doc.produitId,
    produitNom: doc.produitNom,
    source,
    visuel: (doc.visuel as VisuelProduit) || "vrac",
    variete: doc.variete as Modele3DVendeur["variete"],
    statut: doc.statut as Statut3D,
    progression: doc.progression,
    creeLe: doc.creeLe.toISOString(),
    creditsConsommes: doc.creditsConsommes,
    polycount: doc.polycount,
  };
}

async function assurerInitialisation(fournisseurId: string) {
  await connectMongo();
  const fid = fournisseurId || "fournisseur-001";
  const count = await Modele3DModel.countDocuments();
  if (count === 0) {
    for (const m of MODELES_3D) {
      await Modele3DModel.create({
        modelId: m.id,
        fournisseurId: fid,
        produitId: m.produitId,
        produitNom: m.produitNom,
        source: m.source,
        visuel: m.visuel,
        variete: m.variete,
        statut: m.statut,
        progression: m.progression,
        creditsConsommes: m.creditsConsommes,
        polycount: m.polycount,
        creeLe: new Date(m.creeLe),
      });
    }
  }
}

export const modele3DRepositoryMongo: Modele3DRepository = {
  async parFournisseur(fournisseurId: string): Promise<Modele3DVendeur[]> {
    await connectMongo();
    const fid = fournisseurId || "fournisseur-001";
    await assurerInitialisation(fid);

    const docs = await Modele3DModel.find({
      fournisseurId: { $in: [fid, fid === "fournisseur-001" ? "f-ben-amor" : "fournisseur-001"] },
    })
      .sort({ creeLe: -1 })
      .lean<IModele3DDocument[]>();

    return docs.map(toModele);
  },

  async parId(id: string): Promise<Modele3DVendeur | null> {
    await connectMongo();
    await assurerInitialisation("fournisseur-001");
    const doc = await Modele3DModel.findOne({ modelId: id }).lean<IModele3DDocument | null>();
    return doc ? toModele(doc) : null;
  },

  async parTaskId(taskId: string): Promise<Modele3DVendeur | null> {
    await connectMongo();
    const doc = await Modele3DModel.findOne({ taskId }).lean<IModele3DDocument | null>();
    return doc ? toModele(doc) : null;
  },

  async parProduitId(produitId: string): Promise<Modele3DVendeur | null> {
    await connectMongo();
    const doc = await Modele3DModel.findOne({ produitId }).lean<IModele3DDocument | null>();
    return doc ? toModele(doc) : null;
  },

  async creer(data: Partial<Modele3DVendeur> & { produitId: string; produitNom: string; fournisseurId?: string }): Promise<Modele3DVendeur> {
    await connectMongo();
    const fid = data.fournisseurId || "fournisseur-001";
    const modelId = data.id || `m3d-${Date.now()}`;

    const doc = await Modele3DModel.create({
      modelId,
      fournisseurId: fid,
      produitId: data.produitId,
      produitNom: data.produitNom,
      source: data.source || null,
      visuel: data.visuel || "vrac",
      variete: data.variete,
      statut: data.statut || "EN_ATTENTE",
      progression: data.progression ?? 0,
      creditsConsommes: data.creditsConsommes ?? 1,
      polycount: data.polycount,
      glbUrl: (data as { glbUrl?: string }).glbUrl,
      usdzUrl: (data as { usdzUrl?: string }).usdzUrl,
      taskId: (data as { taskId?: string }).taskId,
    });

    return toModele(doc);
  },

  async maj(id: string, data: Partial<Modele3DVendeur> & { glbUrl?: string; usdzUrl?: string; taskId?: string }): Promise<Modele3DVendeur | null> {
    await connectMongo();
    const doc = await Modele3DModel.findOneAndUpdate(
      { modelId: id },
      { $set: data },
      { new: true }
    ).lean<IModele3DDocument | null>();

    return doc ? toModele(doc) : null;
  },
};
