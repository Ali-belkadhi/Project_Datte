
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

  if (!["LOT_CREATOR_ROLE", "STEP_ADDER_ROLE", "CERTIFIER_ROLE"].includes(roleName)) {
    throw new Error("ROLE_NAME doit être LOT_CREATOR_ROLE, STEP_ADDER_ROLE ou CERTIFIER_ROLE");
  }

  const contractName = roleName === "CERTIFIER_ROLE" ? "ProductCertification" : "DateTraceability";
  const contract = await ethers.getContractAt(contractName, contractAddress);

  // Le rôle est choisi explicitement afin de garder les responsabilités séparées.
  const role = roleName === "LOT_CREATOR_ROLE"
    ? await contract.LOT_CREATOR_ROLE()
    : roleName === "STEP_ADDER_ROLE"
      ? await contract.STEP_ADDER_ROLE()
      : await contract.CERTIFIER_ROLE();

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
