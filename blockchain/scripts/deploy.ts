import { network } from "hardhat";

async function main() {
  const { ethers } = await network.create();
  const [deployer] = await ethers.getSigners();

  console.log("Compte de déploiement :", deployer.address);

  const traceability = await (await ethers.getContractFactory("DateTraceability")).deploy();
  await traceability.waitForDeployment();
  const traceabilityAddress = await traceability.getAddress();

  const certification = await (
    await ethers.getContractFactory("ProductCertification")
  ).deploy(traceabilityAddress);
  await certification.waitForDeployment();
  const certificationAddress = await certification.getAddress();

  console.log("DateTraceability :", traceabilityAddress);
  console.log("ProductCertification :", certificationAddress);
  console.log("Chain ID :", (await ethers.provider.getNetwork()).chainId.toString());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
