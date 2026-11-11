"use client";

import { BrowserProvider, Contract, type ContractTransactionResponse, type Eip1193Provider, getAddress } from "ethers";
import type { PublicCertificationConfig } from "../../domain/certification";
import { PRODUCT_CERTIFICATION_ABI } from "./product-certification.abi";

declare global {
  interface Window {
    ethereum?: Eip1193Provider;
  }
}

async function certificationConnection(config: PublicCertificationConfig) {
  if (!window.ethereum) throw new Error("MetaMask n'est pas installé dans ce navigateur.");
  const provider = new BrowserProvider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  const network = await provider.getNetwork();
  if (Number(network.chainId) !== config.chainId) {
    throw new Error(`Réseau incorrect dans MetaMask. Réseau attendu : chain ID ${config.chainId}.`);
  }
  const signer = await provider.getSigner();
  const account = getAddress(await signer.getAddress());
  const contract = new Contract(config.certificationAddress, PRODUCT_CERTIFICATION_ABI, signer);
  const certifierRole = await contract.CERTIFIER_ROLE();
  if (!(await contract.hasRole(certifierRole, account))) {
    throw new Error("Ce wallet ne possède pas le rôle CERTIFIER_ROLE.");
  }
  return { contract, account };
}

export async function issueCertificateWithWallet(
  config: PublicCertificationConfig,
  input: {
    certificateId: string;
    productId: string;
    lotId: string;
    certifierName: string;
    certificationType: string;
    documentHash: string;
    expiresAt: number;
  },
) {
  const { contract, account } = await certificationConnection(config);
  if (await contract.certificateExists(input.certificateId)) {
    throw new Error("Cet identifiant de certificat existe déjà.");
  }
  const transaction = (await contract.issueCertificate(
    input.certificateId,
    input.productId,
    input.lotId,
    input.certifierName,
    input.certificationType,
    input.documentHash,
    input.expiresAt,
  )) as ContractTransactionResponse;
  await transaction.wait();
  return { transactionHash: transaction.hash, account };
}

export async function revokeCertificateWithWallet(
  config: PublicCertificationConfig,
  certificateId: string,
  reason: string,
) {
  const { contract, account } = await certificationConnection(config);
  const transaction = (await contract.revokeCertificate(certificateId, reason)) as ContractTransactionResponse;
  await transaction.wait();
  return { transactionHash: transaction.hash, account };
}
