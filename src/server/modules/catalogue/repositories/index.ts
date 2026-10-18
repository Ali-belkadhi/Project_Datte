// MODULE B — Catalogue (Ali Belkathi)
export { produitRepositoryMock as produitRepository } from "./produit.repository.mock";
export { varieteRepositoryMock as varieteRepository } from "./variete.repository.mock";
export {
  modele3DRepositoryMock as modele3DRepository,
  creditsRepositoryMock as creditsRepository,
  favoriRepositoryMock as favoriRepository,
} from "./modele3d.repository.mock";
// TODO(module B) : remplacer par produitRepositoryPrisma, varieteRepositoryPrisma…

export type { ProduitRepository } from "./produit.repository";
export type { VarieteRepository } from "./variete.repository";
export type { Modele3DRepository, CreditsRepository, FavoriRepository } from "./modele3d.repository";
export { prixReference } from "./filtres";
