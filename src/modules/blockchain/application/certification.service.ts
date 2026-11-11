import "server-only";
import type { PublicCertification } from "../domain/certification";
import { productCertificationGateway } from "../infrastructure/ethers/product-certification.gateway";
import { getOptionalCertificationConfig } from "../infrastructure/ethers/server-config";

export async function getPublicCertification(productId: string, lotId?: string | null): Promise<PublicCertification> {
  const config = getOptionalCertificationConfig();
  if (!config) return { configured: false, certificates: [] };
  try {
    const certificates = await productCertificationGateway.byProduct(productId);
    return {
      configured: true,
      certificates: lotId ? certificates.filter((certificate) => certificate.lotId === lotId) : certificates,
    };
  } catch {
    return {
      configured: true,
      certificates: [],
      error: "La lecture des certificats Blockchain est momentanément indisponible.",
    };
  }
}

export async function listBlockchainCertificates() {
  if (!getOptionalCertificationConfig()) return [];
  try {
    return await productCertificationGateway.all();
  } catch {
    return [];
  }
}
