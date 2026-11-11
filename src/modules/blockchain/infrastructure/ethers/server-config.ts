import "server-only";
import { getAddress, isAddress } from "ethers";
import { env } from "@/server/core/env";
import type { PublicBlockchainConfig } from "../../domain/traceability";
import type { PublicCertificationConfig } from "../../domain/certification";

export type BlockchainServerConfig = PublicBlockchainConfig & { rpcUrl: string };
export type CertificationServerConfig = PublicCertificationConfig & { rpcUrl: string };

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

export function getCertificationConfig(): CertificationServerConfig {
  const traceability = getBlockchainConfig();
  const certificationAddress = env.PRODUCT_CERTIFICATION_ADDRESS ?? "";
  if (!isAddress(certificationAddress)) throw new Error("NEXT_PUBLIC_PRODUCT_CERTIFICATION_ADDRESS est invalide.");
  return {
    rpcUrl: traceability.rpcUrl,
    chainId: traceability.chainId,
    certificationAddress: getAddress(certificationAddress),
  };
}

export function getOptionalCertificationConfig(): CertificationServerConfig | null {
  try {
    return getCertificationConfig();
  } catch {
    return null;
  }
}

export function getOptionalPublicCertificationConfig(): PublicCertificationConfig | null {
  const config = getOptionalCertificationConfig();
  return config ? { chainId: config.chainId, certificationAddress: config.certificationAddress } : null;
}
