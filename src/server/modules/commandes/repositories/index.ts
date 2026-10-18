// MODULE C — Commandes (Karim Ouertatani)
export { commandeRepositoryMock as commandeRepository, panierRepositoryMock as panierRepository } from "./commande.repository.mock";
export { avisRepositoryMock as avisRepository, litigeRepositoryMock as litigeRepository } from "./avis.repository.mock";
export { ventesRepositoryMock as ventesRepository, assistantRepositoryMock as assistantRepository } from "./ventes.repository.mock";
// TODO(module C) : remplacer par les repositories Prisma

export type { CommandeRepository, PanierRepository } from "./commande.repository";
export type { AvisRepository, LitigeRepository } from "./avis.repository";
export type { VentesRepository, AssistantRepository } from "./ventes.repository";
