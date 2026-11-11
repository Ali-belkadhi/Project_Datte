import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  outputFileTracingRoot: process.cwd(),
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
      {
        source: "/manifest.webmanifest",
        headers: [{ key: "Cache-Control", value: "no-cache" }],
      },
    ];
  },
  ...(process.env.DEGLA_DESKTOP_BUILD === "1"
    ? {
        output: "standalone" as const,
        distDir: ".next-desktop",
        outputFileTracingIncludes: {
          "/*": ["./node_modules/mongoose/**/*", "./node_modules/mongodb/**/*", "./node_modules/bson/**/*"],
        },
        outputFileTracingExcludes: { "/*": ["./.env*"] },
      }
    : {}),
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
