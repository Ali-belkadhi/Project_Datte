import "server-only";
import { connectMongo } from "@/server/core/mongo";
import type { FavoriRepository } from "./modele3d.repository";
import { FavoriModel, type IFavoriDocument } from "./favori.model";

const FAVORIS_INITIAUX = ["p06", "p20", "p07", "p12", "p23"];
const BOUTIQUES_INITIALES = ["f-ben-amor", "f-rob-gabes"];

async function assurerInitialisation(clientId: string) {
  await connectMongo();
  const count = await FavoriModel.countDocuments({ clientId });
  if (count === 0 && (clientId === "u-acheteur-demo" || clientId === "u-hedi")) {
    for (const pid of FAVORIS_INITIAUX) {
      await FavoriModel.create({ clientId, produitId: pid }).catch(() => {});
    }
    for (const fid of BOUTIQUES_INITIALES) {
      await FavoriModel.create({ clientId, fournisseurId: fid }).catch(() => {});
    }
  }
}

export const favoriRepositoryMongo: FavoriRepository = {
  async produitIds(clientId: string): Promise<string[]> {
    await connectMongo();
    await assurerInitialisation(clientId);
    const docs = await FavoriModel.find({ clientId, produitId: { $exists: true, $ne: null } })
      .select("produitId")
      .lean<IFavoriDocument[]>();
    return docs.map((d) => d.produitId!).filter(Boolean);
  },

  async fournisseurIds(clientId: string): Promise<string[]> {
    await connectMongo();
    await assurerInitialisation(clientId);
    const docs = await FavoriModel.find({ clientId, fournisseurId: { $exists: true, $ne: null } })
      .select("fournisseurId")
      .lean<IFavoriDocument[]>();
    return docs.map((d) => d.fournisseurId!).filter(Boolean);
  },

  async basculer(clientId: string, produitId: string): Promise<boolean> {
    await connectMongo();
    await assurerInitialisation(clientId);

    const existant = await FavoriModel.findOne({ clientId, produitId });
    if (existant) {
      await FavoriModel.deleteOne({ _id: existant._id });
      return false; // Retiré
    } else {
      await FavoriModel.create({ clientId, produitId });
      return true; // Ajouté
    }
  },
};
