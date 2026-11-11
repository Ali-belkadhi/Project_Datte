import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    // tests/ : modules A et B · src/**/__tests__ : module C (panier, commandes, IA-C)
    include: ["tests/**/*.test.ts", "src/**/*.test.ts"],
    setupFiles: ["./tests/setup.ts", "./tests/setup-db.ts"],
    pool: "forks",
    maxWorkers: 1,
    testTimeout: 30000,
    hookTimeout: 900000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      // « server-only » interdit l'import hors serveur Next ; en test, module vide
      "server-only": path.resolve(__dirname, "src/test/server-only.ts"),
    },
  },
});
