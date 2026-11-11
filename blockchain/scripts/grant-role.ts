
import { network } from "hardhat";

async function main() {
  const { ethers } = await network.create();

  const contractAddress = process.env.CONTRACT_ADDRESS;
  const metamaskAddress = process.env.METAMASK_ADDRESS;
  const roleName = process.env.ROLE_NAME ?? "LOT_CREATOR_ROLE";

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

  if (roleName !== "LOT_CREATOR_ROLE" && roleName !== "STEP_ADDER_ROLE") {
    throw new Error("ROLE_NAME doit être LOT_CREATOR_ROLE ou STEP_ADDER_ROLE");
  }

  // Le rôle est choisi explicitement afin de garder les responsabilités séparées.
  const role = roleName === "LOT_CREATOR_ROLE"
    ? await contract.LOT_CREATOR_ROLE()
    : await contract.STEP_ADDER_ROLE();

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

  console.log("Rôle attribué :", roleName);
  console.log("MetaMask autorisé :", authorized);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
