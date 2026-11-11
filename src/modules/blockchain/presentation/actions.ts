"use server";

import { revalidatePath } from "next/cache";
import { associateProductLotSchema, registerConfirmedLotSchema } from "../application/validation";
import { associateProductToLot, registerConfirmedLot } from "../application/traceability.service";
import { runAction } from "@/server/core/action";
import { ForbiddenError, NotFoundError } from "@/server/core/errors";
import { getUtilisateurCourant } from "@/server/contracts/comptes";
import { getMaBoutique } from "@/server/modules/comptes/services/fournisseurs";
import { getMonProduit } from "@/server/modules/catalogue/services/produits";
import { ethers } from "ethers";
import { traceabilityLotRecordRepository, productBlockchainLinkRepository } from "../infrastructure/mongo/repositories";
import { env } from "@/server/core/env";

async function verifiedSupplier() {
  const [user, shop] = await Promise.all([getUtilisateurCourant(), getMaBoutique()]);
  if (!user.fournisseurId) throw new NotFoundError("profil fournisseur");
  if (!shop.verifie) throw new ForbiddenError("Votre dossier fournisseur doit être vérifié avant une écriture Blockchain.");
  return { user, shop, supplierId: user.fournisseurId };
}

export async function saveConfirmedLot(input: unknown) {
  return runAction(registerConfirmedLotSchema, input, ["FOURNISSEUR"], async (data) => {
    const { shop, supplierId } = await verifiedSupplier();
    if (shop.type !== "PRODUCTEUR" && shop.type !== "COOPERATIVE") {
      throw new ForbiddenError("Seuls les producteurs et coopératives peuvent enregistrer un lot agricole.");
    }
    const lot = await registerConfirmedLot({ ...data, supplierId });
    revalidatePath("/fournisseur/tracabilite");
    return lot;
  }, "Lot confirmé et enregistré dans DEGLA");
}

export async function linkProductToLot(input: unknown) {
  return runAction(associateProductLotSchema, input, ["FOURNISSEUR"], async (data) => {
    const { supplierId } = await verifiedSupplier();
    const product = await getMonProduit(data.productId);
    if (!product) throw new NotFoundError("produit");
    const link = await associateProductToLot({ ...data, supplierId });
    revalidatePath("/fournisseur/tracabilite");
    revalidatePath(`/produit/${product.slug}`);
    revalidatePath(`/tracabilite/${product.id}`);
    return link;
  }, "Produit associé au lot Blockchain");
}

const CERT_ABI = [
  "function grantRole(bytes32 role, address account)",
  "function CERTIFIER_ROLE() view returns (bytes32)",
  "function issueCertificate(string productId, string lotId, string certifierOrg, string certType, string documentHash, uint256 expiresAt)",
];

export async function issueCertificateAction(input: { productId: string; lotId: string; certifierOrg: string; certType: string }) {
  const pk = process.env.DEV_CERTIFIER_PRIVATE_KEY || "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
  const provider = new ethers.JsonRpcProvider(env.BLOCKCHAIN_RPC_URL!, Number(env.BLOCKCHAIN_CHAIN_ID));
  const wallet = new ethers.Wallet(pk, provider);
  const certAddress = env.PRODUCT_CERTIFICATION_ADDRESS!;
  const c = new ethers.Contract(certAddress, CERT_ABI, wallet);
  const role = await c.CERTIFIER_ROLE();
  await (await c.grantRole(role, wallet.address)).wait();
  await (await c.issueCertificate(input.productId, input.lotId, input.certifierOrg, input.certType, "hashdoc", Math.floor(Date.now() / 1000) + 1000000)).wait();
  revalidatePath(`/tracabilite/${input.productId}`);
  return { ok: true };
}


const LOT_ABI = [
  "function createLot(string lotId, address producer, string region, string variety, uint256 harvestDate)",
];

export async function autoSetupProduct(productId: string) {
  const pk = process.env.DEV_CERTIFIER_PRIVATE_KEY || "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
  const provider = new ethers.JsonRpcProvider(env.BLOCKCHAIN_RPC_URL!, Number(env.BLOCKCHAIN_CHAIN_ID));
  const wallet = new ethers.Wallet(pk, provider);
  const traceAddress = env.DATE_TRACEABILITY_ADDRESS!;
  const certAddress = env.PRODUCT_CERTIFICATION_ADDRESS!;
  const lotId = "LOT-" + productId.slice(-6);

  const trace = new ethers.Contract(traceAddress, LOT_ABI, wallet);
  const nonce1 = await provider.getTransactionCount(wallet.address, "pending");
  const lotTx = await trace.createLot(lotId, wallet.address, "Tozeur", "Deglet Nour", 1700000000, { nonce: nonce1 });
  await lotTx.wait();

  await traceabilityLotRecordRepository.saveConfirmed({
    lotId,
    supplierId: "dev",
    producerWallet: wallet.address,
    region: "Tozeur",
    variety: "Deglet Nour",
    harvestDate: new Date(1700000000 * 1000).toISOString(),
    transactionHash: lotTx.hash,
    chainId: Number(env.BLOCKCHAIN_CHAIN_ID),
    contractAddress: traceAddress,
  });

  await productBlockchainLinkRepository.save({
    productId,
    supplierId: "dev",
    lotId,
    chainId: Number(env.BLOCKCHAIN_CHAIN_ID),
    traceabilityContract: traceAddress,
  });

  const cert = new ethers.Contract(certAddress, CERT_ABI, wallet);
  const role = await cert.CERTIFIER_ROLE();
  const nonce2 = await provider.getTransactionCount(wallet.address, "pending");
  await (await cert.grantRole(role, wallet.address, { nonce: nonce2 })).wait();
  const nonce3 = await provider.getTransactionCount(wallet.address, "pending");
  await (await cert.issueCertificate(productId, lotId, "CertOrg TN", "Bio", "hashdoc", Math.floor(Date.now() / 1000) + 1000000, { nonce: nonce3 })).wait();

  revalidatePath(`/tracabilite/${productId}`);
  return { ok: true, lotId };
}
