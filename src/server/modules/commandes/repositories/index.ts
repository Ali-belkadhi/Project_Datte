// MODULE C — Commandes (Karim Ouertatani)
// Données du module : MongoDB (repositories/mongo.ts). Seul l'assistant scripté (IA-C) reste sur un mock.
export { db, SANS_ID, prochainNumero } from "./mongo";
export type * from "./mongo";
export { assistantRepositoryMock as assistantRepository } from "./ventes.repository.mock";
export type { AssistantRepository } from "./ventes.repository";
