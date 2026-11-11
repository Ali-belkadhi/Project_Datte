import "server-only";
import { Contract, JsonRpcProvider, getAddress } from "ethers";
import { PRODUCT_CERTIFICATION_ABI } from "./product-certification.abi";
import { env } from "@/server/core/env";

function connection() {
  const rpcUrl = env.BLOCKCHAIN_RPC_URL ?? "";
  const chainId = Number(env.BLOCKCHAIN_CHAIN_ID ?? 0);
  const address = env.PRODUCT_CERTIFICATION_ADDRESS ?? "";
  if (!rpcUrl || !chainId || !address) return null;
  const provider = new JsonRpcProvider(rpcUrl, chainId, { staticNetwork: true });
  const contract = new Contract(address, PRODUCT_CERTIFICATION_ABI, provider);
  return { provider, contract };
}

export type CertificateStatus = "none" | "valid" | "expired" | "revoked";

export async function getCertificateStatus(productId: string): Promise<{ status: CertificateStatus; certifierOrg?: string; certType?: string; expiresAt?: number } | null> {
  const conn = connection();
  if (!conn) return null;
  try {
    const [valid, status] = await conn.contract.verifyCertificate(productId);
    const cert = await conn.contract.getCertificate(productId);
    const map: Record<number, CertificateStatus> = { 0: "valid", 1: "expired", 2: "revoked" };
    return { status: valid ? "valid" : map[Number(status)] ?? "none", certifierOrg: String(cert[4]), certType: String(cert[5]), expiresAt: Number(cert[8]) };
  } catch {
    return { status: "none" };
  }
}
