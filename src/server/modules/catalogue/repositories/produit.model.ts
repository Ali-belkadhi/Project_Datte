import "server-only";
import mongoose, { Schema } from "mongoose";

/**
 * Modèle Mongoose du catalogue — collection `products` de degla-module-b (données existantes conservées).
 * Champs historiques : name, description, price (TND), stock, category, imageUrl, modelUrl, supplierId, published.
 * Champs ajoutés (tous optionnels, aucune migration destructive) : ils portent le détail exigé par le domaine DEGLA
 * (type, variété, qualité, présentation, maturité, dérivés, bio, région, photos…). Les anciens documents
 * restent lisibles : le repository applique des valeurs par défaut à la lecture.
 */
const schema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 }, // TND (au kg pour une datte, à l'unité pour un dérivé)
    stock: { type: Number, required: true, min: 0 }, // kg (datte) ou unités (dérivé)
    category: { type: String, required: true }, // libellé lisible (variété / type de dérivé)
    imageUrl: { type: String, default: "" },
    images: { type: [String], default: undefined },
    modelUrl: { type: String, default: "" },
    supplierId: { type: String, required: true, index: true },
    published: { type: Boolean, default: true },

    productType: { type: String, enum: ["DATTE", "DERIVE"] },
    status: { type: String, enum: ["BROUILLON", "PUBLIE", "MASQUE", "RUPTURE", "ARCHIVE"] },
    varietySlug: String,
    quality: String,
    presentation: String,
    maturity: String,
    harvestYear: Number,
    weightOptions: { type: [Number], default: undefined },
    derivedType: String,
    contentAmount: Number,
    contentUnit: String,
    ingredients: String,
    organic: Boolean,
    region: String,
  },
  { timestamps: true },
);

export const ProductModel = mongoose.models.CatalogProduct || mongoose.model("CatalogProduct", schema, "products");
