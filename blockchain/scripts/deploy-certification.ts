import { network } from "hardhat";

async function main() {
  const traceabilityAddress = process.env.TRACEABILITY_ADDRESS;
  if (!traceabilityAddress) throw new Error("TRACEABILITY_ADDRESS is required");

  const { ethers } = await network.create();
  if (!ethers.isAddress(traceabilityAddress)) throw new Error("TRACEABILITY_ADDRESS is invalid");

  const factory = await ethers.getContractFactory("ProductCertification");
  const contract = await factory.deploy(traceabilityAddress);
  await contract.waitForDeployment();

  console.log("ProductCertification deployed at:", await contract.getAddress());
  console.log("DateTraceability:", traceabilityAddress);
  console.log("Chain ID:", (await ethers.provider.getNetwork()).chainId.toString());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
