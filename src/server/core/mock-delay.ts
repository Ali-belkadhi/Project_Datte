import "server-only";
import { env } from "./env";

/**
 * Latence simulée des repositories mock (300 ms par défaut, réglable via MOCK_LATENCY)
 * pour rendre les `loading.tsx` visibles. Supprimé avec les repositories Prisma.
 */
export function mockDelay(ms: number = env.MOCK_LATENCY) {
  if (!ms || ms <= 0) return Promise.resolve();
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}
