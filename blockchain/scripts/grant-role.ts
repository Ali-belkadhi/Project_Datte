
import { network } from "hardhat";

async function main() {
  const { ethers } = await network.create();

  const contractAddress = process.env.CONTRACT_ADDRESS;
  const metamaskAddress = process.env.METAMASK_ADDRESS;

  if (!contractAddress || !ethers.isAddress(contractAddress)) {
    throw new Error("Adresse du contrat invalide");
  }

  if (!metamaskAddress || !ethers.isAddress(metamaskAddress)) {
    throw new Error("Adresse MetaMask invalide");
  }

  // Récupérer le contrat déjà déployé
  const contract = await ethers.getContractAt(
    "DateTraceability",
    contractAddress
  );

  // Récupérer le rôle de création des lots
  const role = await contract.LOT_CREATOR_ROLE();

  // Donner le rôle au compte MetaMask
  const tx = await contract.grantRole(
    role,
    metamaskAddress
  );

  await tx.wait();

  // Vérifier l'autorisation
  const authorized = await contract.hasRole(
    role,
    metamaskAddress
  );

  console.log("MetaMask autorisé :", authorized);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
