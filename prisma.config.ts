// Configuration Prisma 7 — le schéma n'est JAMAIS migré dans le template.
// L'URL ci-dessous n'est qu'une valeur de repli pour `prisma format` / `prisma validate` :
// aucune connexion n'est ouverte. Définissez DATABASE_URL quand vous brancherez PostgreSQL.
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: {
    url: process.env.DATABASE_URL ?? "postgresql://degla:degla@localhost:5432/degla",
  },
});
