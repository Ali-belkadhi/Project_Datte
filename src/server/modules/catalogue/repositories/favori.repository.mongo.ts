import "server-only";
import { connectMongo } from "@/server/core/mongo";
import type { FavoriRepository } from "./modele3d.repository";
import { FavoriModel, type IFavoriDocument } from "./favori.model";

export const favoriRepositoryMongo: FavoriRepository = {
  async produitIds(clientId: string): Promise<string[]> {
    await connectMongo();
    const docs = await FavoriModel.find({ clientId, produitId: { $exists: true, $ne: null } })
      .select("produitId")
      .lean<IFavoriDocument[]>();
    return docs.map((d) => d.produitId!).filter(Boolean);
  },

  async fournisseurIds(clientId: string): Promise<string[]> {
    await connectMongo();
    const docs = await FavoriModel.find({ clientId, fournisseurId: { $exists: true, $ne: null } })
      .select("fournisseurId")
      .lean<IFavoriDocument[]>();
    return docs.map((d) => d.fournisseurId!).filter(Boolean);
  },

  async basculer(clientId: string, produitId: string): Promise<boolean> {
    await connectMongo();

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
