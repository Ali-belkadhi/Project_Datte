import "server-only";
import { Contract, Interface, JsonRpcProvider, getAddress } from "ethers";
import type { TraceabilityReader } from "../../application/ports";
import type { TraceabilityLot, TraceabilityStep, TraceabilityStepType } from "../../domain/traceability";
import { DATE_TRACEABILITY_ABI } from "./date-traceability.abi";
import { getBlockchainConfig } from "./server-config";

type RawLot = {
  lotId: string;
  producer: string;
  region: string;
  variety: string;
  harvestDate: bigint;
  exists: boolean;
};

type RawStep = {
  stepType: bigint;
  date: bigint;
  location: string;
  responsibleActor: string;
  documentHash: string;
};

const toLot = (raw: RawLot): TraceabilityLot => ({
  lotId: raw.lotId,
  producer: getAddress(raw.producer),
  region: raw.region,
  variety: raw.variety,
  harvestDate: Number(raw.harvestDate),
  exists: raw.exists,
});

const toStep = (raw: RawStep): TraceabilityStep => ({
  stepType: Number(raw.stepType) as TraceabilityStepType,
  date: Number(raw.date),
  location: raw.location,
  responsibleActor: getAddress(raw.responsibleActor),
  documentHash: raw.documentHash,
});

function connection() {
  const config = getBlockchainConfig();
  const provider = new JsonRpcProvider(config.rpcUrl, config.chainId, { staticNetwork: true });
  const contract = new Contract(config.traceabilityAddress, DATE_TRACEABILITY_ABI, provider);
  return { config, provider, contract };
}

export const dateTraceabilityGateway: TraceabilityReader = {
  async lotExists(lotId) {
    const { contract } = connection();
    return Boolean(await contract.lotExists(lotId));
  },
  async getLot(lotId) {
    const { contract } = connection();
    return toLot((await contract.getLot(lotId)) as RawLot);
  },
  async getHistory(lotId) {
    const { contract } = connection();
    const history = (await contract.getTraceabilityHistory(lotId)) as RawStep[];
    return history.map(toStep);
  },
};

export async function verifyCreateLotTransaction(transactionHash: string, expectedLotId: string) {
  const { config, provider } = connection();
  const [network, receipt, transaction] = await Promise.all([
    provider.getNetwork(),
    provider.getTransactionReceipt(transactionHash),
    provider.getTransaction(transactionHash),
  ]);

  if (Number(network.chainId) !== config.chainId) throw new Error("La transaction appartient à un autre réseau.");
  if (!receipt || receipt.status !== 1) throw new Error("La transaction de création du lot n'est pas confirmée.");
  if (!transaction?.to || getAddress(transaction.to) !== config.traceabilityAddress) {
    throw new Error("La transaction ne cible pas le contrat de traçabilité configuré.");
  }

  const parsed = new Interface(DATE_TRACEABILITY_ABI).parseTransaction({ data: transaction.data, value: transaction.value });
  if (!parsed || parsed.name !== "createLot" || String(parsed.args[0]) !== expectedLotId) {
    throw new Error("La transaction ne crée pas le lot demandé.");
  }

  const lot = await dateTraceabilityGateway.getLot(expectedLotId);
  if (getAddress(transaction.from) !== lot.producer) {
    throw new Error("Le wallet signataire doit être le producteur enregistré pour ce lot.");
  }

  return { config, lot, transactionHash: receipt.hash };
}

export async function verifyAddStepTransaction(transactionHash: string, expectedLotId: string) {
  const { config, provider } = connection();
  const [network, receipt, transaction] = await Promise.all([
    provider.getNetwork(),
    provider.getTransactionReceipt(transactionHash),
    provider.getTransaction(transactionHash),
  ]);

  if (Number(network.chainId) !== config.chainId) throw new Error("La transaction appartient à un autre réseau.");
  if (!receipt || receipt.status !== 1) throw new Error("La transaction d'étape n'est pas confirmée.");
  if (!transaction?.to || getAddress(transaction.to) !== config.traceabilityAddress) {
    throw new Error("La transaction ne cible pas le contrat de traçabilité configuré.");
  }

  const parsed = new Interface(DATE_TRACEABILITY_ABI).parseTransaction({ data: transaction.data, value: transaction.value });
  if (!parsed || parsed.name !== "addTraceabilityStep" || String(parsed.args[0]) !== expectedLotId) {
    throw new Error("La transaction n'ajoute pas une étape au lot demandé.");
  }
  const actor = getAddress(String(parsed.args[4]));
  if (getAddress(transaction.from) !== actor) throw new Error("Le wallet signataire doit être l'acteur responsable de l'étape.");

  return {
    config,
    transactionHash: receipt.hash,
    actor,
    stepType: Number(parsed.args[1]) as TraceabilityStepType,
  };
}
