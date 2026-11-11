import "server-only";

/**
 * Futur client Prisma — NON BRANCHÉ dans le template.
 *
 * Étapes (voir prisma/README.md) :
 *   1. npm i @prisma/client @prisma/adapter-pg
 *   2. définir DATABASE_URL puis `npx prisma migrate dev`
 *   3. décommenter ce fichier et créer les repositories `*.repository.prisma.ts`
 *
 * import { PrismaClient } from "@/generated/prisma/client";
 * import { PrismaPg } from "@prisma/adapter-pg";
 *
 * const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
 *
 * export const db =
 *   globalForPrisma.prisma ??
 *   new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });
 *
 * if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
 */

export {};
