import "server-only";
import { getAddress, verifyMessage } from "ethers";
import type { PublicTraceability } from "../domain/traceability";
import { dateTraceabilityGateway, verifyCreateLotTransaction } from "../infrastructure/ethers/date-traceability.gateway";
import { getOptionalBlockchainConfig } from "../infrastructure/ethers/server-config";
import {
  productBlockchainLinkRepository,
  traceabilityLotRecordRepository,
} from "../infrastructure/mongo/repositories";
import { buildLotOwnershipMessage } from "./wallet-proof";

export async function registerConfirmedLot(input: { lotId: string; transactionHash: string; walletSignature: string; supplierId: string }) {
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

  return traceabilityLotRecordRepository.saveConfirmed({
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

export async function listSupplierTraceability(supplierId: string) {
  const [lots, links] = await Promise.all([
    traceabilityLotRecordRepository.bySupplier(supplierId),
    productBlockchainLinkRepository.bySupplier(supplierId),
  ]);
  return { lots, links };
}

export async function getProductBlockchainLink(productId: string) {
  return productBlockchainLinkRepository.byProduct(productId);
}

export async function getPublicTraceability(productId: string): Promise<PublicTraceability> {
  const [config, link] = await Promise.all([
    Promise.resolve(getOptionalBlockchainConfig()),
    productBlockchainLinkRepository.byProduct(productId),
  ]);
  if (!link) return { configured: Boolean(config), link: null, lot: null, history: [] };
  if (!config) {
    return { configured: false, link, lot: null, history: [], error: "Le lecteur Blockchain public n'est pas configuré." };
  }
  if (link.chainId !== config.chainId || getAddress(link.traceabilityContract) !== config.traceabilityAddress) {
    return { configured: true, link, lot: null, history: [], error: "Le produit est lié à un autre réseau Blockchain." };
  }

  try {
    const [lot, history] = await Promise.all([
      dateTraceabilityGateway.getLot(link.lotId),
      dateTraceabilityGateway.getHistory(link.lotId),
    ]);
    return { configured: true, link, lot, history };
  } catch {
    return { configured: true, link, lot: null, history: [], error: "La lecture Blockchain est momentanément indisponible." };
  }
}
