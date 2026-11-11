import { network } from "hardhat";

async function main() {
  const { ethers } = await network.create();
  const [deployer] = await ethers.getSigners();

  // Deploy DateTraceability first
  const traceFactory = await ethers.getContractFactory("DateTraceability");
  const traceContract = await traceFactory.deploy();
  await traceContract.waitForDeployment();
  const traceAddress = await traceContract.getAddress();
  console.log("DateTraceability deployed at:", traceAddress);

  // Deploy ProductCertification with traceability address
  const certFactory = await ethers.getContractFactory("ProductCertification");
  const certContract = await certFactory.deploy(traceAddress);
  await certContract.waitForDeployment();
  const certAddress = await certContract.getAddress();
  console.log("ProductCertification deployed at:", certAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
