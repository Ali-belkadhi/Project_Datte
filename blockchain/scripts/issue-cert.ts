import { network } from "hardhat";

const ABI = [
  "function grantRole(bytes32 role, address account)",
  "function CERTIFIER_ROLE() view returns (bytes32)",
  "function issueCertificate(string productId, string lotId, string certifierOrg, string certType, string documentHash, uint256 expiresAt)",
];

async function main() {
  const { ethers } = await network.create();
  const certAddress = "0x1e887CFEe9088b1653782BA92c6baD6B5AB6e413";
  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:7545", 1337);
  const certifier = new ethers.Wallet("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", provider);
  const c = new ethers.Contract(certAddress, ABI, certifier);
  const role = await c.CERTIFIER_ROLE();
  await (await c.grantRole(role, certifier.address)).wait();
  await (await c.issueCertificate("6af498963ed9ba2c0869b7af", "LOT1", "CertOrg TN", "Bio", "hashdoc", Math.floor(Date.now()/1000) + 1000000)).wait();
  console.log("Certificate issued");
}
main().catch((e) => { console.error(e); process.exit(1); });
