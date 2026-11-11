import "server-only";
import { getAddress, verifyMessage } from "ethers";
import type { PublicTraceability } from "../domain/traceability";
import { dateTraceabilityGateway, verifyAddStepTransaction, verifyCreateLotTransaction } from "../infrastructure/ethers/date-traceability.gateway";
import { getOptionalBlockchainConfig } from "../infrastructure/ethers/server-config";
import {
  productBlockchainLinkRepository,
  traceabilityActorRepository,
  traceabilityLotRecordRepository,
} from "../infrastructure/mongo/repositories";
import { buildLotOwnershipMessage, buildStepOwnershipMessage } from "./wallet-proof";

export async function registerConfirmedLot(input: { lotId: string; transactionHash: string; walletSignature: string; supplierId: string; shopName: string; shopType: string }) {
  const verified = await verifyCreateLotTransaction(input.transactionHash, input.lotId);
  const recoveredWallet = getAddress(verifyMessage(buildLotOwnershipMessage(input), input.walletSignature));
  if (recoveredWallet !== verified.lot.producer) {
    throw new Error("La preuve MetaMask ne correspond pas au producteur du lot.");
  }
  const existing = await traceabilityLotRecordRepository.byLot(
    input.lotId,
    verified.config.chainId,
    verified.config.traceabilityAddress,
  );
  if (existing && existing.supplierId !== input.supplierId) {
    throw new Error("Ce lot Blockchain est déjà rattaché à un autre fournisseur.");
  }

  const record = await traceabilityLotRecordRepository.saveConfirmed({
    lotId: verified.lot.lotId,
    supplierId: input.supplierId,
    producerWallet: getAddress(verified.lot.producer),
    region: verified.lot.region,
    variety: verified.lot.variety,
    harvestDate: new Date(verified.lot.harvestDate * 1000).toISOString(),
    transactionHash: verified.transactionHash,
    chainId: verified.config.chainId,
    contractAddress: verified.config.traceabilityAddress,
  });
  await traceabilityActorRepository.save({
    supplierId: input.supplierId,
    wallet: verified.lot.producer,
    shopName: input.shopName,
    shopType: input.shopType,
    chainId: verified.config.chainId,
    contractAddress: verified.config.traceabilityAddress,
  });
  return record;
}

export async function registerConfirmedStep(input: { lotId: string; transactionHash: string; walletSignature: string; supplierId: string; shopName: string; shopType: string }) {
  const verified = await verifyAddStepTransaction(input.transactionHash, input.lotId);
  const recoveredWallet = getAddress(verifyMessage(buildStepOwnershipMessage(input), input.walletSignature));
  if (recoveredWallet !== verified.actor) throw new Error("La preuve MetaMask ne correspond pas à l'acteur de l'étape.");
  const allowed = input.shopType === "PRODUCTEUR" || input.shopType === "COOPERATIVE"
    ? [0]
    : input.shopType === "TRANSFORMATEUR"
      ? [1, 2]
      : [3, 4];
  if (!allowed.includes(verified.stepType)) throw new Error("Ce type de fournisseur ne peut pas enregistrer cette étape métier.");
  return traceabilityActorRepository.save({
    supplierId: input.supplierId,
    wallet: verified.actor,
    shopName: input.shopName,
    shopType: input.shopType,
    chainId: verified.config.chainId,
    contractAddress: verified.config.traceabilityAddress,
  });
}

export async function associateProductToLot(input: { productId: string; supplierId: string; lotId: string }) {
  const config = getOptionalBlockchainConfig();
  if (!config) throw new Error("La Blockchain de traçabilité n'est pas configurée.");
  if (!(await dateTraceabilityGateway.lotExists(input.lotId))) throw new Error("Ce lot n'existe pas sur la Blockchain.");

  const existing = await productBlockchainLinkRepository.byProduct(input.productId);
  if (existing && existing.supplierId !== input.supplierId) {
    throw new Error("Ce produit est déjà rattaché par un autre fournisseur.");
  }
  if (existing && existing.lotId !== input.lotId) {
    throw new Error("Un produit déjà publié ne peut pas changer de lot de traçabilité.");
  }

  return productBlockchainLinkRepository.save({
    productId: input.productId,
    supplierId: input.supplierId,
    lotId: input.lotId,
    chainId: config.chainId,
    traceabilityContract: config.traceabilityAddress,
  });
}

export async function listSupplierTraceability(supplierId: string, actor?: { shopName: string; shopType: string }) {
  const [lots, links] = await Promise.all([
    traceabilityLotRecordRepository.bySupplier(supplierId),
    productBlockchainLinkRepository.bySupplier(supplierId),
  ]);
  if (actor) {
    await Promise.all(lots.map((lot) => traceabilityActorRepository.save({
      supplierId,
      wallet: lot.producerWallet,
      shopName: actor.shopName,
      shopType: actor.shopType,
      chainId: lot.chainId,
      contractAddress: lot.contractAddress,
    })));
  }
  return { lots, links };
}

export async function getProductBlockchainLink(productId: string) {
  return productBlockchainLinkRepository.byProduct(productId);
}

export async function listAllProductBlockchainLinks() {
  return productBlockchainLinkRepository.all();
}

export async function getPublicTraceability(productId: string): Promise<PublicTraceability> {
  const [config, link] = await Promise.all([
    Promise.resolve(getOptionalBlockchainConfig()),
    productBlockchainLinkRepository.byProduct(productId),
  ]);
  if (!link) return { configured: Boolean(config), link: null, lot: null, history: [], actors: [] };
  if (!config) {
    return { configured: false, link, lot: null, history: [], actors: [], error: "Le lecteur Blockchain public n'est pas configuré." };
  }
  if (link.chainId !== config.chainId || getAddress(link.traceabilityContract) !== config.traceabilityAddress) {
    return { configured: true, link, lot: null, history: [], actors: [], error: "Le produit est lié à un autre réseau Blockchain." };
  }

  try {
    const [lot, history] = await Promise.all([
      dateTraceabilityGateway.getLot(link.lotId),
      dateTraceabilityGateway.getHistory(link.lotId),
    ]);
    const wallets = [...new Set([lot.producer, ...history.map((step) => step.responsibleActor)])];
    const actors = await traceabilityActorRepository.byWallets(wallets, config.chainId, config.traceabilityAddress);
    return { configured: true, link, lot, history, actors };
  } catch {
    return { configured: true, link, lot: null, history: [], actors: [], error: "La lecture Blockchain est momentanément indisponible." };
  }
}
