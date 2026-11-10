
import { network } from "hardhat";

async function main() {
  const { ethers } = await network.create();

  // Premier compte Ganache
  const [sender] = await ethers.getSigners();

  // Adresse publique MetaMask
  const recipient = process.env.METAMASK_ADDRESS;

  if (!recipient || !ethers.isAddress(recipient)) {
    throw new Error("Adresse MetaMask invalide");
  }

  console.log("Expéditeur :", sender.address);
  console.log("Destinataire :", recipient);

  // Envoyer 1 ETH fictif
  const tx = await sender.sendTransaction({
    to: recipient,
    value: ethers.parseEther("1.0"),
  });

  await tx.wait();

  console.log("Transaction réussie !");
  console.log("Transaction hash :", tx.hash);

  const balance = await ethers.provider.getBalance(recipient);

  console.log(
    "Solde MetaMask sur Ganache :",
    ethers.formatEther(balance),
    "ETH"
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
