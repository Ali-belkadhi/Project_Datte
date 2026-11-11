import type {
  ProductBlockchainLink,
  TraceabilityLot,
  TraceabilityLotRecord,
  TraceabilityStep,
} from "../domain/traceability";

export interface TraceabilityReader {
  lotExists(lotId: string): Promise<boolean>;
  getLot(lotId: string): Promise<TraceabilityLot>;
  getHistory(lotId: string): Promise<TraceabilityStep[]>;
}

export interface TraceabilityLotRecordRepository {
  saveConfirmed(record: Omit<TraceabilityLotRecord, "id" | "createdAt">): Promise<TraceabilityLotRecord>;
  bySupplier(supplierId: string): Promise<TraceabilityLotRecord[]>;
}

export interface ProductBlockchainLinkRepository {
  byProduct(productId: string): Promise<ProductBlockchainLink | null>;
  bySupplier(supplierId: string): Promise<ProductBlockchainLink[]>;
  save(link: Omit<ProductBlockchainLink, "id" | "createdAt" | "updatedAt">): Promise<ProductBlockchainLink>;
}
