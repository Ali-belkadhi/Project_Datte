import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

/**
 * Métadonnées d'une page. Le titre devient « Nom de la page · DEGLA »
 * grâce au template défini dans `app/layout.tsx`.
 */
export function pageMetadata(title: string, description?: string): Metadata {
  return {
    title,
    description: description ?? siteConfig.description,
    openGraph: {
      title: `${title} · ${siteConfig.name}`,
      description: description ?? siteConfig.description,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      type: "website",
    },
  };
}
