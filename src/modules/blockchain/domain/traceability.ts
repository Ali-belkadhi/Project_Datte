export const TRACEABILITY_STEP_LABELS = [
  "Récolte",
  "Conditionnement",
  "Transformation",
  "Transport",
  "Distribution",
] as const;

export type TraceabilityStepType = 0 | 1 | 2 | 3 | 4;

export interface TraceabilityLot {
  lotId: string;
  producer: string;
  region: string;
  variety: string;
  harvestDate: number;
  exists: boolean;
}

export interface TraceabilityStep {
  stepType: TraceabilityStepType;
  date: number;
  location: string;
  responsibleActor: string;
  documentHash: string;
}

export interface TraceabilityLotRecord {
  id: string;
  lotId: string;
  supplierId: string;
  producerWallet: string;
  region: string;
  variety: string;
  harvestDate: string;
  transactionHash: string;
  chainId: number;
  contractAddress: string;
  createdAt: string;
}

export interface ProductBlockchainLink {
  id: string;
  productId: string;
  supplierId: string;
  lotId: string;
  chainId: number;
  traceabilityContract: string;
  createdAt: string;
  updatedAt: string;
}

export interface PublicTraceability {
  configured: boolean;
  link: ProductBlockchainLink | null;
  lot: TraceabilityLot | null;
  history: TraceabilityStep[];
  error?: string;
}

export interface PublicBlockchainConfig {
  chainId: number;
  traceabilityAddress: string;
}
