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

const toLot = (raw: RawLot, tokenId: bigint, tokenOwner: string, tokenUri: string): TraceabilityLot => ({
  lotId: raw.lotId,
  producer: getAddress(raw.producer),
  region: raw.region,
  variety: raw.variety,
  harvestDate: Number(raw.harvestDate),
  exists: raw.exists,
  tokenId: tokenId.toString(),
  tokenOwner: getAddress(tokenOwner),
  tokenUri,
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
    const [raw, tokenId] = await Promise.all([
      contract.getLot(lotId) as Promise<RawLot>,
      contract.tokenIdForLot(lotId) as Promise<bigint>,
    ]);
    const [tokenOwner, tokenUri] = await Promise.all([
      contract.ownerOf(tokenId) as Promise<string>,
      contract.tokenURI(tokenId) as Promise<string>,
    ]);
    return toLot(raw, tokenId, tokenOwner, tokenUri);
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
