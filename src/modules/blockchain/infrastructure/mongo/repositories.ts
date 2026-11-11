import "server-only";
import { connectDB } from "@/server/core/mongo";
import type { ProductBlockchainLink, TraceabilityActor, TraceabilityLotRecord } from "../../domain/traceability";
import { ProductBlockchainLinkModel } from "./product-blockchain-link.model";
import { TraceabilityLotModel } from "./traceability-lot.model";
import { TraceabilityActorModel } from "./traceability-actor.model";

type Doc = Record<string, unknown>;

const iso = (value: unknown) => (value instanceof Date ? value.toISOString() : new Date(String(value)).toISOString());

const toLotRecord = (doc: Doc): TraceabilityLotRecord => ({
  id: String(doc._id),
  lotId: String(doc.lotId),
  supplierId: String(doc.supplierId),
  producerWallet: String(doc.producerWallet),
  region: String(doc.region),
  variety: String(doc.variety),
  harvestDate: iso(doc.harvestDate),
  transactionHash: String(doc.transactionHash),
  chainId: Number(doc.chainId),
  contractAddress: String(doc.contractAddress),
  createdAt: iso(doc.createdAt),
});

const toProductLink = (doc: Doc): ProductBlockchainLink => ({
  id: String(doc._id),
  productId: String(doc.productId),
  supplierId: String(doc.supplierId),
  lotId: String(doc.lotId),
  chainId: Number(doc.chainId),
  traceabilityContract: String(doc.traceabilityContract),
  createdAt: iso(doc.createdAt),
  updatedAt: iso(doc.updatedAt),
});

const toActor = (doc: Doc): TraceabilityActor => ({
  id: String(doc._id),
  supplierId: String(doc.supplierId),
  wallet: String(doc.wallet),
  shopName: String(doc.shopName),
  shopType: String(doc.shopType),
  chainId: Number(doc.chainId),
  contractAddress: String(doc.contractAddress),
  updatedAt: iso(doc.updatedAt),
});

export const traceabilityLotRecordRepository = {
  async byLot(lotId: string, chainId: number, contractAddress: string) {
    await connectDB();
    const doc = await TraceabilityLotModel.findOne({ lotId, chainId, contractAddress }).lean();
    return doc ? toLotRecord(doc as Doc) : null;
  },
  async bySupplier(supplierId: string) {
    await connectDB();
    const docs = await TraceabilityLotModel.find({ supplierId }).sort({ createdAt: -1 }).lean();
    return docs.map((doc: unknown) => toLotRecord(doc as Doc));
  },
  async saveConfirmed(record: Omit<TraceabilityLotRecord, "id" | "createdAt">) {
    await connectDB();
    const doc = await TraceabilityLotModel.findOneAndUpdate(
      { lotId: record.lotId, chainId: record.chainId, contractAddress: record.contractAddress },
      { $setOnInsert: { ...record, harvestDate: new Date(record.harvestDate) } },
      { upsert: true, returnDocument: "after", runValidators: true },
    ).lean();
    return toLotRecord(doc as Doc);
  },
};

export const productBlockchainLinkRepository = {
  async all() {
    await connectDB();
    const docs = await ProductBlockchainLinkModel.find({}).sort({ updatedAt: -1 }).lean();
    return docs.map((doc: unknown) => toProductLink(doc as Doc));
  },
  async byProduct(productId: string) {
    await connectDB();
    const doc = await ProductBlockchainLinkModel.findOne({ productId }).lean();
    return doc ? toProductLink(doc as Doc) : null;
  },
  async bySupplier(supplierId: string) {
    await connectDB();
    const docs = await ProductBlockchainLinkModel.find({ supplierId }).sort({ updatedAt: -1 }).lean();
    return docs.map((doc: unknown) => toProductLink(doc as Doc));
  },
  async save(link: Omit<ProductBlockchainLink, "id" | "createdAt" | "updatedAt">) {
    await connectDB();
    const doc = await ProductBlockchainLinkModel.findOneAndUpdate(
      { productId: link.productId },
      { $set: link },
      { upsert: true, returnDocument: "after", runValidators: true },
    ).lean();
    return toProductLink(doc as Doc);
  },
};

export const traceabilityActorRepository = {
  async save(actor: Omit<TraceabilityActor, "id" | "updatedAt">) {
    await connectDB();
    const existing = await TraceabilityActorModel.findOne({
      chainId: actor.chainId,
      contractAddress: actor.contractAddress,
      wallet: actor.wallet,
    }).lean();
    if (existing && String((existing as Doc).supplierId) !== actor.supplierId) {
      throw new Error("Ce wallet Blockchain est déjà rattaché à une autre boutique.");
    }
    const doc = await TraceabilityActorModel.findOneAndUpdate(
      { chainId: actor.chainId, contractAddress: actor.contractAddress, wallet: actor.wallet },
      { $set: actor },
      { upsert: true, returnDocument: "after", runValidators: true },
    ).lean();
    return toActor(doc as Doc);
  },
  async byWallets(wallets: string[], chainId: number, contractAddress: string) {
    await connectDB();
    if (!wallets.length) return [];
    const docs = await TraceabilityActorModel.find({ chainId, contractAddress, wallet: { $in: wallets } }).lean();
    return docs.map((doc: unknown) => toActor(doc as Doc));
  },
};
