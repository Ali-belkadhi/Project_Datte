import "server-only";
import mongoose, { Schema } from "mongoose";

const schema = new Schema(
  {
    lotId: { type: String, required: true, trim: true },
    supplierId: { type: String, required: true, index: true },
    producerWallet: { type: String, required: true },
    region: { type: String, required: true },
    variety: { type: String, required: true },
    harvestDate: { type: Date, required: true },
    transactionHash: { type: String, required: true, unique: true },
    chainId: { type: Number, required: true },
    contractAddress: { type: String, required: true },
  },
  { timestamps: true },
);

schema.index({ chainId: 1, contractAddress: 1, lotId: 1 }, { unique: true });

export const TraceabilityLotModel =
  mongoose.models.TraceabilityLot || mongoose.model("TraceabilityLot", schema, "traceability_lots");
