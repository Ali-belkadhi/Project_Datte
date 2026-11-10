"use client";

import { BrowserProvider, Contract, type ContractTransactionResponse, type Eip1193Provider, getAddress } from "ethers";
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
  const transaction = (await contract.createLot(input.lotId, account, input.region, input.variety, input.harvestDate)) as ContractTransactionResponse;
  await transaction.wait();
  const walletSignature = await signer.signMessage(buildLotOwnershipMessage({ supplierId, lotId: input.lotId, transactionHash: transaction.hash }));
  return { transactionHash: transaction.hash, account, walletSignature };
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

export async function readLotWithWallet(config: PublicBlockchainConfig, lotId: string) {
  const { contract } = await walletConnection(config);
  if (!(await contract.lotExists(lotId))) return null;
  const lotRaw = await contract.getLot(lotId);
  const historyRaw = await contract.getTraceabilityHistory(lotId);
  const lot: TraceabilityLot = {
    lotId: String(lotRaw.lotId),
    producer: getAddress(String(lotRaw.producer)),
    region: String(lotRaw.region),
    variety: String(lotRaw.variety),
    harvestDate: Number(lotRaw.harvestDate),
    exists: Boolean(lotRaw.exists),
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
