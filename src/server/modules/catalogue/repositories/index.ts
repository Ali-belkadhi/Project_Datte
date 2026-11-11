// MODULE B — Catalogue (Ali Belkathi) — Persistance MongoDB
export { produitRepositoryMongo as produitRepository } from "./produit.repository.mongo";
export { varieteRepositoryMongo as varieteRepository } from "./variete.repository.mongo";
export { categorieDeriveRepositoryMongo as categorieDeriveRepository } from "./categorie-derive.repository.mongo";
export { modele3DRepositoryMongo as modele3DRepository } from "./modele3d.repository.mongo";
export { creditsRepositoryMongo as creditsRepository } from "./credits.repository.mongo";
export { favoriRepositoryMongo as favoriRepository } from "./favori.repository.mongo";

export type { ProduitRepository } from "./produit.repository";
export type { VarieteRepository } from "./variete.repository";
export type { Modele3DRepository, CreditsRepository, FavoriRepository } from "./modele3d.repository";
export { prixReference } from "./filtres";
