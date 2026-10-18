// MODULE B — client Meshy (génération 3D image → GLB/USDZ). Stub typé.
import "server-only";
import { NonImplementeError } from "@/server/core/errors";

export type TacheMeshy = {
  id: string;
  statut: "PENDING" | "IN_PROGRESS" | "SUCCEEDED" | "FAILED";
  progression: number;
  glbUrl?: string;
  usdzUrl?: string;
};

/** TODO(module B) : POST /openapi/v1/image-to-3d (ou multi-image-to-3d) avec MESHY_API_KEY. */
export async function creerTache(_: { imageUrls: string[] }): Promise<{ id: string }> {
  throw new NonImplementeError("meshy.creerTache");
}

/** TODO(module B) : GET /openapi/v1/image-to-3d/{id}. */
export async function lireTache(_: string): Promise<TacheMeshy> {
  throw new NonImplementeError("meshy.lireTache");
}
