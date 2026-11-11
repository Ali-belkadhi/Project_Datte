import { network } from "hardhat";

async function main() {
  const { ethers } = await network.create();
  const [owner, certifier] = await ethers.getSigners();
  const traceFactory = await ethers.getContractFactory("DateTraceability");
  const trace = traceFactory.attach("0x0F9508245C2824814174937b2472D55348379676");
  await (await trace.createLot("LOT-TEST", owner.address, "Tozeur", "Deglet Nour", 1700000000)).wait();
  const certFactory = await ethers.getContractFactory("ProductCertification");
  const cert = certFactory.attach("0x2ab43793BF89Fe7B6e43Cd54664Fb2ecaFd1588A");
  await (await cert.grantRole(await cert.CERTIFIER_ROLE(), certifier.address)).wait();
  await (await cert.connect(certifier).issueCertificate("6af498963ed9ba2c0869b7af", "LOT-TEST", "CertOrg TN", "Bio", "hashdoc", Math.floor(Date.now()/1000)+1000000)).wait();
  console.log("done");
}
main().catch(e=>{console.error(e);process.exit(1);});
