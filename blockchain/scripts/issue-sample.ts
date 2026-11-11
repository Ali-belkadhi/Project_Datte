import { network } from "hardhat";
import type { ContractTransactionResponse } from "ethers";

type RoleContract = {
  hasRole(role: string, account: string): Promise<boolean>;
  DEFAULT_ADMIN_ROLE(): Promise<string>;
  grantRole(role: string, account: string): Promise<ContractTransactionResponse>;
};

const requiredAddress = (ethers: { isAddress(value: string): boolean }, name: string) => {
  const value = process.env[name]?.trim() ?? "";
  if (!ethers.isAddress(value)) throw new Error(`${name} doit contenir une adresse valide`);
  return value;
};

async function ensureRole(contract: RoleContract, role: string, account: string) {
  if (await contract.hasRole(role, account)) return;
  const adminRole = await contract.DEFAULT_ADMIN_ROLE();
  if (!(await contract.hasRole(adminRole, account)))
    throw new Error(`Le compte actif ne peut pas attribuer le rôle ${role}`);
  await (await contract.grantRole(role, account)).wait();
}

async function main() {
  const { ethers } = await network.create();
  const [signer] = await ethers.getSigners();
  const traceabilityAddress = requiredAddress(ethers, "TRACEABILITY_ADDRESS");
  const certificationAddress = requiredAddress(ethers, "CERTIFICATION_ADDRESS");
  const lotId = process.env.LOT_ID?.trim() || "LOT-DEMO-001";
  const productId = process.env.PRODUCT_ID?.trim() || "PRODUCT-DEMO-001";
  const certificateId = process.env.CERTIFICATE_ID?.trim() || "CERT-DEMO-001";

  const traceability = await ethers.getContractAt("DateTraceability", traceabilityAddress, signer);
  await ensureRole(traceability, await traceability.LOT_CREATOR_ROLE(), signer.address);
  if (!(await traceability.lotExists(lotId))) {
    await (
      await traceability.createLot(
        lotId,
        signer.address,
        process.env.REGION?.trim() || "Tozeur",
        process.env.VARIETY?.trim() || "Deglet Nour",
        BigInt(process.env.HARVEST_DATE || "1700000000"),
      )
    ).wait();
  }

  const certification = await ethers.getContractAt(
    "ProductCertification",
    certificationAddress,
    signer,
  );
  await ensureRole(certification, await certification.CERTIFIER_ROLE(), signer.address);
  if (!(await certification.certificateExists(certificateId))) {
    await (
      await certification.issueCertificate(
        certificateId,
        productId,
        lotId,
        process.env.CERTIFIER_NAME?.trim() || "DEGLA Certification",
        process.env.CERTIFICATION_TYPE?.trim() || "BIO",
        process.env.DOCUMENT_HASH?.trim() || "sha256:demo",
        BigInt(Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60),
      )
    ).wait();
  }

  console.log(
    JSON.stringify(
      { traceabilityAddress, certificationAddress, lotId, productId, certificateId },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
