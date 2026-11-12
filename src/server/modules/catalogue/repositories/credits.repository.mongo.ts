import "server-only";
import { connectMongo } from "@/server/core/mongo";
import { getParametres } from "@/server/services/ParametresService";
import { PACKS_CREDITS, MOUVEMENTS_CREDITS, SOLDE_CREDITS } from "@/mocks/credits";
import type { MouvementCredit3D, PackCredits3D, SoldeCredits3D } from "@/types/domain";
import type { CreditsRepository } from "./modele3d.repository";
import {
  CreditMouvementModel,
  CreditSoldeModel,
  PackCreditsModel,
  type ICreditMouvementDocument,
  type ICreditSoldeDocument,
  type IPackCreditsDocument,
} from "./credits.model";

function toPack(doc: IPackCreditsDocument): PackCredits3D {
  return {
    id: doc.packId,
    nom: doc.nom,
    nombreCredits: doc.nombreCredits,
    prix: doc.prix,
    description: doc.description || "",
    misEnAvant: doc.misEnAvant || false,
  };
}

function toMouvement(doc: ICreditMouvementDocument): MouvementCredit3D {
  return {
    id: (doc._id as object).toString(),
    type: doc.type,
    quantite: doc.quantite,
    soldeApres: doc.soldeApres,
    motif: doc.motif,
    creeLe: doc.creeLe.toISOString(),
  };
}

/** Compte de démonstration du template (données fictives partagées avec « f-ben-amor »). */
const estDemo = (fid: string) => fid === "fournisseur-001" || fid === "f-ben-amor";
/** Chaque fournisseur a son propre solde ; seul le compte de démonstration regroupe ses deux identifiants. */
const filtreFournisseur = (fid: string) => (estDemo(fid) ? { $in: ["fournisseur-001", "f-ben-amor"] } : fid);

async function assurerInitialisation(fournisseurId: string) {
  await connectMongo();

  // 1. Packs de crédits
  const countPacks = await PackCreditsModel.countDocuments();
  if (countPacks === 0) {
    for (const p of PACKS_CREDITS) {
      await PackCreditsModel.create({
        packId: p.id,
        nom: p.nom,
        nombreCredits: p.nombreCredits,
        prix: p.prix,
        description: p.description,
        misEnAvant: p.misEnAvant,
        actif: true,
      });
    }
  }

  // 2. Solde fournisseur
  const fid = fournisseurId || "fournisseur-001";
  let soldeDoc = await CreditSoldeModel.findOne({
    fournisseurId: filtreFournisseur(fid),
  });

  if (!soldeDoc && !estDemo(fid)) {
    // vrai fournisseur : solde propre, crédits offerts à l'inscription (EF-66, paramétrés par l'admin)
    const p = (await getParametres().catch(() => null)) as { creditsOffertsInscription?: number; seuilCreditsBas?: number; coutCreditsImage?: number; coutCreditsMultiImage?: number } | null;
    const offerts = typeof p?.creditsOffertsInscription === "number" ? p.creditsOffertsInscription : 5;
    try {
      await CreditSoldeModel.create({
        fournisseurId: fid,
        solde: offerts,
        seuilBas: p?.seuilCreditsBas ?? SOLDE_CREDITS.seuilBas,
        coutImage: p?.coutCreditsImage ?? SOLDE_CREDITS.coutImage,
        coutMultiImage: p?.coutCreditsMultiImage ?? SOLDE_CREDITS.coutMultiImage,
      });
      if (offerts > 0) {
        await CreditMouvementModel.create({ fournisseurId: fid, type: "BONUS", quantite: offerts, soldeApres: offerts, motif: "Crédits offerts à l'inscription" });
      }
    } catch {
      // création simultanée par une autre requête : le solde existe déjà
    }
    return;
  }

  if (!soldeDoc) {
    soldeDoc = await CreditSoldeModel.create({
      fournisseurId: fid,
      solde: SOLDE_CREDITS.solde,
      seuilBas: SOLDE_CREDITS.seuilBas,
      coutImage: SOLDE_CREDITS.coutImage,
      coutMultiImage: SOLDE_CREDITS.coutMultiImage,
    });

    // Seed mouvements initiaux (compte de démonstration uniquement)
    const countMvts = await CreditMouvementModel.countDocuments({ fournisseurId: fid });
    if (countMvts === 0) {
      for (const m of MOUVEMENTS_CREDITS) {
        await CreditMouvementModel.create({
          fournisseurId: fid,
          type: m.type,
          quantite: m.quantite,
          soldeApres: m.soldeApres,
          motif: m.motif,
          creeLe: new Date(m.creeLe),
        });
      }
    }
  }
}

export const creditsRepositoryMongo: CreditsRepository & {
  reserver(fournisseurId: string, quantite: number, motif: string): Promise<boolean>;
  restituer(fournisseurId: string, quantite: number, motif: string): Promise<void>;
  consommer(fournisseurId: string, quantite: number, motif: string): Promise<void>;
  crediter(fournisseurId: string, quantite: number, motif: string): Promise<number>;
  creerPack(data: Omit<PackCredits3D, "id"> & { id?: string }): Promise<PackCredits3D>;
  majPack(id: string, data: Partial<PackCredits3D & { actif: boolean }>): Promise<PackCredits3D | null>;
  supprimerPack(id: string): Promise<boolean>;
  tousLesPacks(): Promise<(PackCredits3D & { actif: boolean })[]>;
} = {
  async packs(): Promise<PackCredits3D[]> {
    await connectMongo();
    await assurerInitialisation("fournisseur-001");
    const docs = await PackCreditsModel.find({ actif: true }).sort({ prix: 1 }).lean<IPackCreditsDocument[]>();
    return docs.map(toPack);
  },

  async tousLesPacks(): Promise<(PackCredits3D & { actif: boolean })[]> {
    await connectMongo();
    await assurerInitialisation("fournisseur-001");
    const docs = await PackCreditsModel.find().sort({ prix: 1 }).lean<IPackCreditsDocument[]>();
    return docs.map((d) => ({
      ...toPack(d),
      actif: d.actif !== false,
    }));
  },

  async solde(fournisseurId: string): Promise<SoldeCredits3D> {
    await connectMongo();
    const fid = fournisseurId || "fournisseur-001";
    await assurerInitialisation(fid);

    const doc = await CreditSoldeModel.findOne({
      fournisseurId: filtreFournisseur(fid),
    }).lean<ICreditSoldeDocument | null>();

    if (!doc) {
      return SOLDE_CREDITS;
    }

    return {
      solde: doc.solde,
      seuilBas: doc.seuilBas,
      coutImage: doc.coutImage,
      coutMultiImage: doc.coutMultiImage,
    };
  },

  async mouvements(fournisseurId: string): Promise<MouvementCredit3D[]> {
    await connectMongo();
    const fid = fournisseurId || "fournisseur-001";
    await assurerInitialisation(fid);

    const docs = await CreditMouvementModel.find({
      fournisseurId: filtreFournisseur(fid),
    })
      .sort({ creeLe: -1 })
      .limit(50)
      .lean<ICreditMouvementDocument[]>();

    return docs.map(toMouvement);
  },

  async reserver(fournisseurId: string, quantite: number, motif: string): Promise<boolean> {
    await connectMongo();
    const fid = fournisseurId || "fournisseur-001";
    await assurerInitialisation(fid);

    // Atomic decrement if solde >= quantite
    const doc = await CreditSoldeModel.findOneAndUpdate(
      {
        fournisseurId: filtreFournisseur(fid),
        solde: { $gte: quantite },
      },
      { $inc: { solde: -quantite } },
      { returnDocument: "after" }
    );

    if (!doc) return false;

    await CreditMouvementModel.create({
      fournisseurId: fid,
      type: "RESERVATION",
      quantite: -quantite,
      soldeApres: doc.solde,
      motif,
    });

    return true;
  },

  async restituer(fournisseurId: string, quantite: number, motif: string): Promise<void> {
    await connectMongo();
    const fid = fournisseurId || "fournisseur-001";
    await assurerInitialisation(fid);

    const doc = await CreditSoldeModel.findOneAndUpdate(
      { fournisseurId: filtreFournisseur(fid) },
      { $inc: { solde: quantite } },
      { returnDocument: "after" }
    );

    if (doc) {
      await CreditMouvementModel.create({
        fournisseurId: fid,
        type: "RESTITUTION",
        quantite,
        soldeApres: doc.solde,
        motif,
      });
    }
  },

  async consommer(fournisseurId: string, quantite: number, motif: string): Promise<void> {
    await connectMongo();
    const fid = fournisseurId || "fournisseur-001";
    await assurerInitialisation(fid);

    const doc = await CreditSoldeModel.findOne({
      fournisseurId: filtreFournisseur(fid),
    });

    await CreditMouvementModel.create({
      fournisseurId: fid,
      type: "CONSOMMATION",
      quantite: -quantite,
      soldeApres: doc ? doc.solde : 0,
      motif,
    });
  },

  async crediter(fournisseurId: string, quantite: number, motif: string): Promise<number> {
    await connectMongo();
    const fid = fournisseurId || "fournisseur-001";
    await assurerInitialisation(fid);

    const doc = await CreditSoldeModel.findOneAndUpdate(
      { fournisseurId: filtreFournisseur(fid) },
      { $inc: { solde: quantite } },
      { returnDocument: "after", upsert: true }
    );

    await CreditMouvementModel.create({
      fournisseurId: fid,
      type: "ACHAT",
      quantite,
      soldeApres: doc.solde,
      motif,
    });

    return doc.solde;
  },

  async creerPack(data: Omit<PackCredits3D, "id"> & { id?: string }): Promise<PackCredits3D> {
    await connectMongo();
    const packId = data.id || `pack-${Date.now()}`;
    const doc = await PackCreditsModel.create({
      packId,
      nom: data.nom,
      nombreCredits: data.nombreCredits,
      prix: data.prix,
      description: data.description || "",
      misEnAvant: data.misEnAvant || false,
      actif: true,
    });
    return toPack(doc);
  },

  async majPack(id: string, data: Partial<PackCredits3D & { actif: boolean }>): Promise<PackCredits3D | null> {
    await connectMongo();
    const doc = await PackCreditsModel.findOneAndUpdate(
      { packId: id },
      { $set: data },
      { returnDocument: "after" }
    ).lean<IPackCreditsDocument | null>();
    return doc ? toPack(doc) : null;
  },

  async supprimerPack(id: string): Promise<boolean> {
    await connectMongo();
    const res = await PackCreditsModel.deleteOne({ packId: id });
    return res.deletedCount > 0;
  },
};
