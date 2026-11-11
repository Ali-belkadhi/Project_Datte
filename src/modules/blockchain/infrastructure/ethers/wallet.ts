"use client";

import { BrowserProvider, Contract, type ContractTransactionResponse, type Eip1193Provider, getAddress, isAddress } from "ethers";
import type { PublicBlockchainConfig, TraceabilityLot, TraceabilityStep, TraceabilityStepType } from "../../domain/traceability";
import { buildLotOwnershipMessage } from "../../application/wallet-proof";
import { DATE_TRACEABILITY_ABI } from "./date-traceability.abi";

declare global {
  interface Window {
    ethereum?: Eip1193Provider;
  }
}

async function walletConnection(config: PublicBlockchainConfig) {
  if (!window.ethereum) throw new Error("MetaMask n'est pas installé dans ce navigateur.");
  const provider = new BrowserProvider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  const network = await provider.getNetwork();
  if (Number(network.chainId) !== config.chainId) {
    throw new Error(`Réseau incorrect dans MetaMask. Réseau attendu : chain ID ${config.chainId}.`);
  }
  const signer = await provider.getSigner();
  const contract = new Contract(config.traceabilityAddress, DATE_TRACEABILITY_ABI, signer);
  return { provider, signer, contract, account: getAddress(await signer.getAddress()) };
}

export async function createLotWithWallet(
  config: PublicBlockchainConfig,
  input: { lotId: string; region: string; variety: string; harvestDate: number },
  supplierId: string,
) {
  const { contract, account, signer } = await walletConnection(config);
  const role = await contract.LOT_CREATOR_ROLE();
  if (!(await contract.hasRole(role, account))) throw new Error("Ce wallet ne possède pas le rôle de création des lots.");

  let transactionHash: string;
  let recovered = false;

  if (await contract.lotExists(input.lotId)) {
    const existingLot = await contract.getLot(input.lotId);
    if (getAddress(String(existingLot.producer)) !== account) {
      throw new Error("Cet identifiant de lot est déjà utilisé par un autre wallet.");
    }

    const events = await contract.queryFilter(contract.filters.LotCreated(input.lotId, account), 0, "latest");
    const creationEvent = events.at(-1);
    if (!creationEvent) {
      throw new Error("Ce lot existe déjà, mais sa transaction de création est introuvable.");
    }
    transactionHash = creationEvent.transactionHash;
    recovered = true;
  } else {
    const transaction = (await contract.createLot(
      input.lotId,
      account,
      input.region,
      input.variety,
      input.harvestDate,
    )) as ContractTransactionResponse;
    await transaction.wait();
    transactionHash = transaction.hash;
  }

  const walletSignature = await signer.signMessage(buildLotOwnershipMessage({ supplierId, lotId: input.lotId, transactionHash }));
  return { transactionHash, account, walletSignature, recovered };
}

export async function addStepWithWallet(
  config: PublicBlockchainConfig,
  input: { lotId: string; stepType: TraceabilityStepType; date: number; location: string; documentHash: string },
) {
  const { contract, account } = await walletConnection(config);
  const role = await contract.STEP_ADDER_ROLE();
  if (!(await contract.hasRole(role, account))) throw new Error("Ce wallet ne possède pas le rôle d'ajout d'étapes.");
  const transaction = (await contract.addTraceabilityStep(
    input.lotId,
    input.stepType,
    input.date,
    input.location,
    account,
    input.documentHash,
  )) as ContractTransactionResponse;
  await transaction.wait();
  return { transactionHash: transaction.hash, account };
}

export async function transferLotTokenWithWallet(config: PublicBlockchainConfig, tokenId: string, recipient: string) {
  if (!/^\d+$/.test(tokenId)) throw new Error("Identifiant de token invalide.");
  if (!isAddress(recipient)) throw new Error("Adresse du destinataire invalide.");

  const { contract, account } = await walletConnection(config);
  const owner = getAddress(String(await contract.ownerOf(tokenId)));
  if (owner !== account) throw new Error("Le wallet connecté n'est pas propriétaire de ce NFT.");

  const normalizedRecipient = getAddress(recipient);
  if (normalizedRecipient === account) throw new Error("Le destinataire possède déjà ce NFT.");

  const transaction = (await contract.safeTransferFrom(account, normalizedRecipient, tokenId)) as ContractTransactionResponse;
  await transaction.wait();
  return { transactionHash: transaction.hash, from: account, to: normalizedRecipient };
}

export async function readLotWithWallet(config: PublicBlockchainConfig, lotId: string) {
  const { contract } = await walletConnection(config);
  if (!(await contract.lotExists(lotId))) return null;
  const lotRaw = await contract.getLot(lotId);
  const tokenId = (await contract.tokenIdForLot(lotId)) as bigint;
  const [tokenOwner, tokenUri, historyRaw] = await Promise.all([
    contract.ownerOf(tokenId) as Promise<string>,
    contract.tokenURI(tokenId) as Promise<string>,
    contract.getTraceabilityHistory(lotId),
  ]);
  const lot: TraceabilityLot = {
    lotId: String(lotRaw.lotId),
    producer: getAddress(String(lotRaw.producer)),
    region: String(lotRaw.region),
    variety: String(lotRaw.variety),
    harvestDate: Number(lotRaw.harvestDate),
    exists: Boolean(lotRaw.exists),
    tokenId: tokenId.toString(),
    tokenOwner: getAddress(tokenOwner),
    tokenUri: String(tokenUri),
  };
  const history: TraceabilityStep[] = historyRaw.map((step: { stepType: bigint; date: bigint; location: string; responsibleActor: string; documentHash: string }) => ({
    stepType: Number(step.stepType) as TraceabilityStepType,
    date: Number(step.date),
    location: String(step.location),
    responsibleActor: getAddress(String(step.responsibleActor)),
    documentHash: String(step.documentHash),
  }));
  return { lot, history };
}
