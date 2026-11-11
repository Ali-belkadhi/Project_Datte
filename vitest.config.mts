import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const src = fileURLToPath(new URL("./src", import.meta.url));

export default defineConfig({
  resolve: {
    alias: [
      // « server-only » interdit l'import côté client ; en test, module vide
      { find: "server-only", replacement: fileURLToPath(new URL("./src/test/server-only.ts", import.meta.url)) },
      { find: /^@\//, replacement: `${src}/` },
    ],
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
