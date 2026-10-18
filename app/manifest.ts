import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "DEGLA — Dattes de Kébili",
    short_name: "DEGLA",
    description:
      "DEGLA, marque tunisienne de dattes naturelles et coffrets cadeaux de luxe, récoltés au cœur de Kébili.",
    start_url: "/",
    display: "standalone",
    background_color: "#f6f0e4",
    theme_color: "#123B2A",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
