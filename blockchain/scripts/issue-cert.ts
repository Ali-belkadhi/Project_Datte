import { network } from "hardhat";

const required = (name: string) => {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} est obligatoire`);
  return value;
};

async function main() {
  const { ethers } = await network.create();
  const [signer] = await ethers.getSigners();
  const contractAddress = required("CONTRACT_ADDRESS");
  if (!ethers.isAddress(contractAddress)) throw new Error("CONTRACT_ADDRESS est invalide");

  const certificate = await ethers.getContractAt("ProductCertification", contractAddress, signer);
  const certificateId = required("CERTIFICATE_ID");
  const productId = required("PRODUCT_ID");
  const lotId = required("LOT_ID");
  const certifierName = required("CERTIFIER_NAME");
  const certificationType = required("CERTIFICATION_TYPE");
  const documentHash = required("DOCUMENT_HASH");
  const expiresAt = BigInt(required("EXPIRES_AT"));

  if (expiresAt <= BigInt(Math.floor(Date.now() / 1000))) {
    throw new Error("EXPIRES_AT doit être un timestamp Unix futur");
  }
  if (await certificate.certificateExists(certificateId)) {
    throw new Error(`Le certificat ${certificateId} existe déjà`);
  }

  const certifierRole = await certificate.CERTIFIER_ROLE();
  if (!(await certificate.hasRole(certifierRole, signer.address))) {
    const adminRole = await certificate.DEFAULT_ADMIN_ROLE();
    if (!(await certificate.hasRole(adminRole, signer.address))) {
      throw new Error("Le compte actif ne possède ni CERTIFIER_ROLE ni DEFAULT_ADMIN_ROLE");
    }
    await (await certificate.grantRole(certifierRole, signer.address)).wait();
  }

  const transaction = await certificate.issueCertificate(
    certificateId,
    productId,
    lotId,
    certifierName,
    certificationType,
    documentHash,
    expiresAt,
  );
  await transaction.wait();
  console.log("Certificat émis :", certificateId);
  console.log("Transaction :", transaction.hash);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
