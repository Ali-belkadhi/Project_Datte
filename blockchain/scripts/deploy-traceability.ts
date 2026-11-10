
import { network } from "hardhat";

async function main() {
  // Connexion au réseau configuré
  const { ethers } = await network.create();

  // Compte utilisé pour déployer le contrat
  const [deployer] = await ethers.getSigners();

  console.log("Compte de déploiement :", deployer.address);

  // Préparer le contrat Solidity
  const factory =
    await ethers.getContractFactory("DateTraceability");

  console.log("Déploiement en cours...");

  // Envoyer la transaction de déploiement
  const contract = await factory.deploy();

  // Attendre la confirmation
  await contract.waitForDeployment();

  const address = await contract.getAddress();

  console.log("DateTraceability déployé !");
  console.log("Adresse du contrat :", address);
  console.log("Chain ID :", (
    await ethers.provider.getNetwork()
  ).chainId.toString());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
