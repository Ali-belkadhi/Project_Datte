import "server-only";
import mongoose, { Schema } from "mongoose";

const schema = new Schema(
  {
    productId: { type: String, required: true, unique: true, index: true },
    supplierId: { type: String, required: true, index: true },
    lotId: { type: String, required: true, index: true },
    chainId: { type: Number, required: true },
    traceabilityContract: { type: String, required: true },
  },
  { timestamps: true },
);

export const ProductBlockchainLinkModel =
  mongoose.models.ProductBlockchainLink ||
  mongoose.model("ProductBlockchainLink", schema, "product_blockchain_links");
