import { network } from "hardhat";

async function main() {
  const { ethers } = await network.create();
  const [deployer] = await ethers.getSigners();
  const traceabilityAddress = process.env.TRACEABILITY_ADDRESS;

  if (!traceabilityAddress || !ethers.isAddress(traceabilityAddress)) {
    throw new Error("TRACEABILITY_ADDRESS doit contenir l'adresse de DateTraceability");
  }

  console.log("Compte de déploiement :", deployer.address);
  console.log("Contrat de traçabilité :", traceabilityAddress);

  const factory = await ethers.getContractFactory("ProductCertification");
  const contract = await factory.deploy(traceabilityAddress);
  await contract.waitForDeployment();

  console.log("ProductCertification déployé !");
  console.log("Adresse du contrat :", await contract.getAddress());
  console.log("Chain ID :", (await ethers.provider.getNetwork()).chainId.toString());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
