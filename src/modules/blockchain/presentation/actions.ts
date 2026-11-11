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
  "function hasRole(bytes32 role, address account) view returns (bool)",
  "function DEFAULT_ADMIN_ROLE() view returns (bytes32)",
  "function CERTIFIER_ROLE() view returns (bytes32)",
  "function getCertificate(string productId) view returns (tuple(bytes32 certificateId, string productId, string lotId, address certifier, string certifierOrg, string certType, string documentHash, uint256 issuedAt, uint256 expiresAt, bool revoked, string revocationReason, bool exists))",
  "function issueCertificate(string productId, string lotId, string certifierOrg, string certType, string documentHash, uint256 expiresAt)",
];

async function getServerBlockchainSigner(provider: ethers.JsonRpcProvider) {
  if (process.env.DEV_CERTIFIER_PRIVATE_KEY) {
    return new ethers.Wallet(process.env.DEV_CERTIFIER_PRIVATE_KEY, provider);
  }
  if (env.NODE_ENV === "development") return provider.getSigner(0);
  throw new Error("Aucun signataire Blockchain n'est configuré sur le serveur.");
}

export async function issueCertificateAction(input: { productId: string; lotId: string; certifierOrg: string; certType: string }) {
  const productId = input.productId.trim();
  const lotId = input.lotId.trim();
  const certifierOrg = input.certifierOrg.trim();
  const certType = input.certType.trim();
  if (!productId || !lotId || !certifierOrg || !certType) throw new Error("Tous les champs du certificat sont obligatoires.");

  const rpcUrl = env.BLOCKCHAIN_RPC_URL;
  const chainId = Number(env.BLOCKCHAIN_CHAIN_ID);
  const traceAddress = env.DATE_TRACEABILITY_ADDRESS;
  const certAddress = env.PRODUCT_CERTIFICATION_ADDRESS;
  if (!rpcUrl || !Number.isSafeInteger(chainId) || !ethers.isAddress(traceAddress) || !ethers.isAddress(certAddress)) {
    throw new Error("La configuration des contrats Blockchain est incomplète dans .env.local.");
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl, chainId, { staticNetwork: true });
  const signer = await getServerBlockchainSigner(provider);

  const trace = new ethers.Contract(traceAddress, ["function lotExists(string lotId) view returns (bool)"], provider);
  if (!(await trace.lotExists(lotId))) throw new Error(`Le lot ${lotId} n'existe pas sur le contrat de traçabilité.`);

  const c = new ethers.Contract(certAddress, CERT_ABI, signer);
  try {
    await c.getCertificate(productId);
    throw new Error("Un certificat existe déjà pour ce produit.");
  } catch (error) {
    if (error instanceof Error && error.message === "Un certificat existe déjà pour ce produit.") throw error;
  }

  const signerAddress = await signer.getAddress();
  const role = await c.CERTIFIER_ROLE();
  if (!(await c.hasRole(role, signerAddress))) {
    const adminRole = await c.DEFAULT_ADMIN_ROLE();
    if (!(await c.hasRole(adminRole, signerAddress))) throw new Error("Le compte serveur n'a pas le rôle de certificateur sur ce contrat.");
    await (await c.grantRole(role, signerAddress)).wait();
  }

  await (await c.issueCertificate(productId, lotId, certifierOrg, certType, "hashdoc", Math.floor(Date.now() / 1000) + 1000000)).wait();
  revalidatePath(`/tracabilite/${productId}`);
  return { ok: true };
}


const LOT_ABI = [
  "function createLot(string lotId, address producer, string region, string variety, uint256 harvestDate)",
];

export async function autoSetupProduct(productId: string) {
  const provider = new ethers.JsonRpcProvider(env.BLOCKCHAIN_RPC_URL!, Number(env.BLOCKCHAIN_CHAIN_ID));
  const signer = await getServerBlockchainSigner(provider);
  const signerAddress = await signer.getAddress();
  const traceAddress = env.DATE_TRACEABILITY_ADDRESS!;
  const certAddress = env.PRODUCT_CERTIFICATION_ADDRESS!;
  const lotId = "LOT-" + productId.slice(-6);

  const trace = new ethers.Contract(traceAddress, LOT_ABI, signer);
  const lotTx = await trace.createLot(lotId, signerAddress, "Tozeur", "Deglet Nour", 1700000000);
  await lotTx.wait();

  await traceabilityLotRecordRepository.saveConfirmed({
    lotId,
    supplierId: "dev",
    producerWallet: signerAddress,
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

  const cert = new ethers.Contract(certAddress, CERT_ABI, signer);
  const role = await cert.CERTIFIER_ROLE();
  if (!(await cert.hasRole(role, signerAddress))) {
    const adminRole = await cert.DEFAULT_ADMIN_ROLE();
    if (!(await cert.hasRole(adminRole, signerAddress))) throw new Error("Le compte serveur n'a pas le rôle de certificateur sur ce contrat.");
    await (await cert.grantRole(role, signerAddress)).wait();
  }
  await (await cert.issueCertificate(productId, lotId, "CertOrg TN", "Bio", "hashdoc", Math.floor(Date.now() / 1000) + 1000000)).wait();

  revalidatePath(`/tracabilite/${productId}`);
  return { ok: true, lotId };
}
