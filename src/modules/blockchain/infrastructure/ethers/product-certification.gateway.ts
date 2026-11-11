import "server-only";
import { Contract, JsonRpcProvider, getAddress } from "ethers";
import type { BlockchainCertificate, CertificateStatus, VerifiedCertificate } from "../../domain/certification";
import { PRODUCT_CERTIFICATION_ABI } from "./product-certification.abi";
import { getCertificationConfig } from "./server-config";

type RawCertificate = {
  certificateId: string;
  productId: string;
  lotId: string;
  certifier: string;
  certifierName: string;
  certificationType: string;
  documentHash: string;
  issuedAt: bigint;
  expiresAt: bigint;
  revoked: boolean;
  revocationReason: string;
  revokedAt: bigint;
  revokedBy: string;
  exists: boolean;
};

const toCertificate = (raw: RawCertificate): BlockchainCertificate => ({
  certificateId: String(raw.certificateId),
  productId: String(raw.productId),
  lotId: String(raw.lotId),
  certifier: getAddress(String(raw.certifier)),
  certifierName: String(raw.certifierName),
  certificationType: String(raw.certificationType),
  documentHash: String(raw.documentHash),
  issuedAt: Number(raw.issuedAt),
  expiresAt: Number(raw.expiresAt),
  revoked: Boolean(raw.revoked),
  revocationReason: String(raw.revocationReason),
  revokedAt: Number(raw.revokedAt),
  revokedBy: Number(raw.revokedAt) > 0 ? getAddress(String(raw.revokedBy)) : String(raw.revokedBy),
  exists: Boolean(raw.exists),
});

function connection() {
  const config = getCertificationConfig();
  const provider = new JsonRpcProvider(config.rpcUrl, config.chainId, { staticNetwork: true });
  const contract = new Contract(config.certificationAddress, PRODUCT_CERTIFICATION_ABI, provider);
  return { config, contract };
}

async function verified(contract: Contract, certificateId: string): Promise<VerifiedCertificate> {
  const certificate = toCertificate((await contract.getCertificate(certificateId)) as RawCertificate);
  const status = Number(
    await contract.verifyCertificate(certificate.certificateId, certificate.productId, certificate.lotId),
  ) as CertificateStatus;
  return { ...certificate, status };
}

export const productCertificationGateway = {
  async byProduct(productId: string): Promise<VerifiedCertificate[]> {
    const { contract } = connection();
    const ids = (await contract.getProductCertificateIds(productId)) as string[];
    return Promise.all(ids.map((id) => verified(contract, id)));
  },
  async all(): Promise<VerifiedCertificate[]> {
    const { contract } = connection();
    const total = Number(await contract.totalCertificates());
    const ids = await Promise.all(Array.from({ length: total }, (_, index) => contract.certificateIdAt(index) as Promise<string>));
    return Promise.all(ids.map((id) => verified(contract, id)));
  },
};
