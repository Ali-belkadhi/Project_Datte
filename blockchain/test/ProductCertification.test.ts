import { expect } from "chai";
import { describe, it } from "mocha";
import hre from "hardhat";

async function fixture() {
  const { ethers } = await hre.network.create();
  const [admin, producer, certifier, outsider] = await ethers.getSigners();
  const traceability = await (await ethers.getContractFactory("DateTraceability")).deploy();
  await traceability.waitForDeployment();
  await traceability.createLot("LOT-CERT-001", producer.address, "Tozeur", "Deglet Nour", 1n);

  const certification = await (
    await ethers.getContractFactory("ProductCertification")
  ).deploy(await traceability.getAddress());
  await certification.waitForDeployment();
  await certification.grantRole(await certification.CERTIFIER_ROLE(), certifier.address);

  const block = await ethers.provider.getBlock("latest");
  const expiresAt = BigInt((block?.timestamp ?? 0) + 3600);
  return { ethers, admin, producer, certifier, outsider, traceability, certification, expiresAt };
}

describe("ProductCertification - B1 à B5", function () {
  it("émet et consulte un certificat lié à un lot existant", async function () {
    const { certification, certifier, expiresAt } = await fixture();
    await expect(
      certification.connect(certifier).issueCertificate(
        "CERT-001", "PRODUCT-001", "LOT-CERT-001", "Institut tunisien de certification", "BIO", "ipfs://preuve-bio", expiresAt,
      ),
    ).to.emit(certification, "CertificateIssued");

    const certificate = await certification.getCertificate("CERT-001");
    expect(certificate.productId).to.equal("PRODUCT-001");
    expect(certificate.lotId).to.equal("LOT-CERT-001");
    expect(certificate.certifier).to.equal(certifier.address);
    expect(await certification.verifyCertificate("CERT-001", "PRODUCT-001", "LOT-CERT-001")).to.equal(1n);
  });

  it("refuse un lot inexistant et une émission non autorisée", async function () {
    const { certification, certifier, outsider, expiresAt } = await fixture();
    await expect(
      certification.connect(certifier).issueCertificate(
        "CERT-ABSENT", "PRODUCT-001", "LOT-ABSENT", "Institut tunisien de certification", "BIO", "ipfs://preuve", expiresAt,
      ),
    ).to.be.revertedWith("Lot not found");
    await expect(
      certification.connect(outsider).issueCertificate(
        "CERT-UNAUTHORIZED", "PRODUCT-001", "LOT-CERT-001", "Institut tunisien de certification", "BIO", "ipfs://preuve", expiresAt,
      ),
    ).to.be.revertedWithCustomError(certification, "AccessControlUnauthorizedAccount");
  });

  it("vérifie la liaison produit/lot et détecte un certificat inexistant", async function () {
    const { certification, certifier, expiresAt } = await fixture();
    await certification.connect(certifier).issueCertificate(
      "CERT-LINK", "PRODUCT-001", "LOT-CERT-001", "Institut tunisien de certification", "BIO", "ipfs://preuve", expiresAt,
    );
    expect(await certification.verifyCertificate("CERT-LINK", "AUTRE", "LOT-CERT-001")).to.equal(0n);
    expect(await certification.verifyCertificate("INEXISTANT", "PRODUCT-001", "LOT-CERT-001")).to.equal(0n);
  });

  it("révoque un certificat et conserve le motif", async function () {
    const { certification, certifier, expiresAt } = await fixture();
    await certification.connect(certifier).issueCertificate(
      "CERT-REVOKE", "PRODUCT-001", "LOT-CERT-001", "Institut tunisien de certification", "BIO", "ipfs://preuve", expiresAt,
    );
    await expect(certification.connect(certifier).revokeCertificate("CERT-REVOKE", "Document remplacé"))
      .to.emit(certification, "CertificateRevoked");
    expect(await certification.verifyCertificate("CERT-REVOKE", "PRODUCT-001", "LOT-CERT-001")).to.equal(3n);
    expect((await certification.getCertificate("CERT-REVOKE")).revocationReason).to.equal("Document remplacé");
  });

  it("refuse la révocation par un autre certificateur", async function () {
    const { certification, certifier, outsider, expiresAt } = await fixture();
    await certification.grantRole(await certification.CERTIFIER_ROLE(), outsider.address);
    await certification.connect(certifier).issueCertificate(
      "CERT-OWNER", "PRODUCT-001", "LOT-CERT-001", "Institut tunisien de certification", "BIO", "ipfs://preuve", expiresAt,
    );
    await expect(certification.connect(outsider).revokeCertificate("CERT-OWNER", "Tentative interdite"))
      .to.be.revertedWith("Only issuer or admin can revoke");
  });

  it("détecte un certificat expiré", async function () {
    const { ethers, certification, certifier, expiresAt } = await fixture();
    await certification.connect(certifier).issueCertificate(
      "CERT-EXPIRED", "PRODUCT-001", "LOT-CERT-001", "Institut tunisien de certification", "BIO", "ipfs://preuve", expiresAt,
    );
    await ethers.provider.send("evm_increaseTime", [3700]);
    await ethers.provider.send("evm_mine", []);
    expect(await certification.verifyCertificate("CERT-EXPIRED", "PRODUCT-001", "LOT-CERT-001")).to.equal(2n);
  });
});
