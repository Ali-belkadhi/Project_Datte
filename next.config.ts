import type { NextConfig } from "next";

/**
 * DEGLA — configuration Next.js.
 *
 * `cacheComponents` est volontairement désactivé dans le template : les pages
 * lisent la session de démo (en-têtes / cookies) et des données simulées avec
 * latence. Le rendu dynamique classique est plus simple pour l'équipe.
 * Voir docs/architecture.md (« Cache et rendu ») avant de l'activer.
 */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Machines peu dotées en mémoire : NEXT_BUILD_CPUS=1 npm run build
  experimental: process.env.NEXT_BUILD_CPUS ? { cpus: Number(process.env.NEXT_BUILD_CPUS), workerThreads: false } : undefined,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
