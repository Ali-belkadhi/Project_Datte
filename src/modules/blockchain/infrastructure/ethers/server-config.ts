import "server-only";
import { getAddress, isAddress } from "ethers";
import { env } from "@/server/core/env";
import type { PublicBlockchainConfig } from "../../domain/traceability";

export type BlockchainServerConfig = PublicBlockchainConfig & { rpcUrl: string };

export function getBlockchainConfig(): BlockchainServerConfig {
  const rpcUrl = env.BLOCKCHAIN_RPC_URL ?? "";
  const rawChainId = env.BLOCKCHAIN_CHAIN_ID ?? "";
  const traceabilityAddress = env.DATE_TRACEABILITY_ADDRESS ?? "";
  const chainId = Number(rawChainId);

  if (!rpcUrl) throw new Error("BLOCKCHAIN_RPC_URL est absent.");
  if (!Number.isSafeInteger(chainId) || chainId <= 0) throw new Error("NEXT_PUBLIC_BLOCKCHAIN_CHAIN_ID est invalide.");
  if (!isAddress(traceabilityAddress)) throw new Error("NEXT_PUBLIC_DATE_TRACEABILITY_ADDRESS est invalide.");

  return { rpcUrl, chainId, traceabilityAddress: getAddress(traceabilityAddress) };
}

export function getOptionalBlockchainConfig(): BlockchainServerConfig | null {
  try {
    return getBlockchainConfig();
  } catch {
    return null;
  }
}

export function getOptionalPublicBlockchainConfig(): PublicBlockchainConfig | null {
  const config = getOptionalBlockchainConfig();
  return config ? { chainId: config.chainId, traceabilityAddress: config.traceabilityAddress } : null;
}
