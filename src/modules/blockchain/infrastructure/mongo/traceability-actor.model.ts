import "server-only";
import mongoose, { Schema } from "mongoose";

const schema = new Schema(
  {
    supplierId: { type: String, required: true, index: true },
    wallet: { type: String, required: true, index: true },
    shopName: { type: String, required: true },
    shopType: { type: String, required: true },
    chainId: { type: Number, required: true },
    contractAddress: { type: String, required: true },
  },
  { timestamps: true },
);

schema.index({ chainId: 1, contractAddress: 1, wallet: 1 }, { unique: true });

export const TraceabilityActorModel =
  mongoose.models.TraceabilityActor || mongoose.model("TraceabilityActor", schema, "traceability_actors");
