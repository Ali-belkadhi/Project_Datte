import { expect } from "chai";
import { describe, it } from "mocha";
import hre from "hardhat";

describe("ProductCertification", function () {
  it("issues certificate for existing lot", async function () {
    const { ethers } = await hre.network.create();
    const [owner, certifier, other] = await ethers.getSigners();
    const TraceFactory = await ethers.getContractFactory("DateTraceability");
    const traceability = await TraceFactory.deploy();
    await traceability.waitForDeployment();
    const CertFactory = await ethers.getContractFactory("ProductCertification");
    const certification = await CertFactory.deploy(await traceability.getAddress());
    await certification.waitForDeployment();
    await certification.grantRole(await certification.CERTIFIER_ROLE(), certifier.address);
    await traceability.createLot("LOT1", owner.address, "Tozeur", "Deglet Nour", 1700000000);

    const tx = await certification.connect(certifier).issueCertificate("PROD1", "LOT1", "OrgX", "Bio", "hash1", Math.floor(Date.now()/1000)+100000);
    await tx.wait();
    const c = await certification.getCertificate("PROD1");
    expect(c.productId).to.equal("PROD1");
    expect(c.lotId).to.equal("LOT1");
  });

  it("rejects certificate for non-existent lot", async function () {
    const { ethers } = await hre.network.create();
    const [owner, certifier] = await ethers.getSigners();
    const TraceFactory = await ethers.getContractFactory("DateTraceability");
    const traceability = await TraceFactory.deploy();
    await traceability.waitForDeployment();
    const CertFactory = await ethers.getContractFactory("ProductCertification");
    const certification = await CertFactory.deploy(await traceability.getAddress());
    await certification.waitForDeployment();
    await certification.grantRole(await certification.CERTIFIER_ROLE(), certifier.address);
    await expect(certification.connect(certifier).issueCertificate("PROD2", "NOLOT", "OrgX", "Bio", "hash", Math.floor(Date.now()/1000)+100000))
      .to.be.revertedWith("Lot does not exist");
  });

  it("rejects duplicate certificate", async function () {
    const { ethers } = await hre.network.create();
    const [owner, certifier] = await ethers.getSigners();
    const TraceFactory = await ethers.getContractFactory("DateTraceability");
    const traceability = await TraceFactory.deploy();
    await traceability.waitForDeployment();
    const CertFactory = await ethers.getContractFactory("ProductCertification");
    const certification = await CertFactory.deploy(await traceability.getAddress());
    await certification.waitForDeployment();
    await certification.grantRole(await certification.CERTIFIER_ROLE(), certifier.address);
    await traceability.createLot("LOT1", owner.address, "Tozeur", "Deglet Nour", 1700000000);
    await certification.connect(certifier).issueCertificate("PROD3", "LOT1", "OrgX", "Bio", "hash", Math.floor(Date.now()/1000)+100000);
    await expect(certification.connect(certifier).issueCertificate("PROD3", "LOT1", "OrgX", "Bio", "hash", Math.floor(Date.now()/1000)+100000))
      .to.be.revertedWith("Certificate already exists");
  });

  it("verifies valid certificate", async function () {
    const { ethers } = await hre.network.create();
    const [owner, certifier] = await ethers.getSigners();
    const TraceFactory = await ethers.getContractFactory("DateTraceability");
    const traceability = await TraceFactory.deploy();
    await traceability.waitForDeployment();
    const CertFactory = await ethers.getContractFactory("ProductCertification");
    const certification = await CertFactory.deploy(await traceability.getAddress());
    await certification.waitForDeployment();
    await certification.grantRole(await certification.CERTIFIER_ROLE(), certifier.address);
    await traceability.createLot("LOT1", owner.address, "Tozeur", "Deglet Nour", 1700000000);
    await certification.connect(certifier).issueCertificate("PROD4", "LOT1", "OrgX", "Bio", "hash", Math.floor(Date.now()/1000)+100000);
    const [valid] = await certification.verifyCertificate("PROD4");
    expect(valid).to.be.true;
  });

  it("detects expired certificate", async function () {
    const { ethers } = await hre.network.create();
    const [owner, certifier] = await ethers.getSigners();
    const TraceFactory = await ethers.getContractFactory("DateTraceability");
    const traceability = await TraceFactory.deploy();
    await traceability.waitForDeployment();
    const CertFactory = await ethers.getContractFactory("ProductCertification");
    const certification = await CertFactory.deploy(await traceability.getAddress());
    await certification.waitForDeployment();
    await certification.grantRole(await certification.CERTIFIER_ROLE(), certifier.address);
    await traceability.createLot("LOT1", owner.address, "Tozeur", "Deglet Nour", 1700000000);
    await certification.connect(certifier).issueCertificate("PROD5", "LOT1", "OrgX", "Bio", "hash", Math.floor(Date.now()/1000)+5);
    await ethers.provider.send("evm_increaseTime", [100]);
    await ethers.provider.send("evm_mine", []);
    const [valid] = await certification.verifyCertificate("PROD5");
    expect(valid).to.be.false;
  });

  it("revokes certificate", async function () {
    const { ethers } = await hre.network.create();
    const [owner, certifier] = await ethers.getSigners();
    const TraceFactory = await ethers.getContractFactory("DateTraceability");
    const traceability = await TraceFactory.deploy();
    await traceability.waitForDeployment();
    const CertFactory = await ethers.getContractFactory("ProductCertification");
    const certification = await CertFactory.deploy(await traceability.getAddress());
    await certification.waitForDeployment();
    await certification.grantRole(await certification.CERTIFIER_ROLE(), certifier.address);
    await traceability.createLot("LOT1", owner.address, "Tozeur", "Deglet Nour", 1700000000);
    await certification.connect(certifier).issueCertificate("PROD6", "LOT1", "OrgX", "Bio", "hash", Math.floor(Date.now()/1000)+100000);
    await certification.connect(certifier).revokeCertificate("PROD6", "fraud");
    const [valid] = await certification.verifyCertificate("PROD6");
    expect(valid).to.be.false;
  });

  it("rejects unauthorized issue", async function () {
    const { ethers } = await hre.network.create();
    const [owner, certifier, other] = await ethers.getSigners();
    const TraceFactory = await ethers.getContractFactory("DateTraceability");
    const traceability = await TraceFactory.deploy();
    await traceability.waitForDeployment();
    const CertFactory = await ethers.getContractFactory("ProductCertification");
    const certification = await CertFactory.deploy(await traceability.getAddress());
    await certification.waitForDeployment();
    await traceability.createLot("LOT1", owner.address, "Tozeur", "Deglet Nour", 1700000000);
    await expect(certification.connect(other).issueCertificate("PROD7", "LOT1", "OrgX", "Bio", "hash", Math.floor(Date.now()/1000)+100000))
      .to.be.revertedWithCustomError(certification, "AccessControlUnauthorizedAccount");
  });
});
