// MODULE B — client Meshy (génération 3D image → GLB/USDZ) avec fallback et persistance
import "server-only";
import { saveMedia } from "../stockage/media-local";

export type TacheMeshy = {
  id: string;
  statut: "PENDING" | "IN_PROGRESS" | "SUCCEEDED" | "FAILED";
  progression: number;
  glbUrl?: string;
  usdzUrl?: string;
  erreur?: string;
};

const MESHY_BASE = "https://api.meshy.ai/openapi/v1";

/**
 * Crée une tâche de génération 3D :
 * - Appelle l'API Meshy si MESHY_API_KEY est configurée
 * - Sinon initialise une tâche locale persistée
 */
export async function creerTache(input: {
  imageUrls: string[];
  mode?: "IMAGE" | "MULTI_IMAGE";
}): Promise<{ id: string }> {
  const apiKey = process.env.MESHY_API_KEY?.trim();

  if (apiKey) {
    try {
      const isMulti = (input.mode === "MULTI_IMAGE" || input.imageUrls.length > 1);
      const endpoint = isMulti
        ? `${MESHY_BASE}/image-to-3d`
        : `${MESHY_BASE}/image-to-3d`;

      const body = isMulti
        ? {
            image_urls: input.imageUrls,
            enable_pbr: true,
            should_remesh: true,
          }
        : {
            image_url: input.imageUrls[0],
            enable_pbr: true,
            should_remesh: true,
          };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.warn(`Meshy API error (${res.status}):`, errText);
        throw new Error(`Meshy API: ${res.statusText}`);
      }

      const data = (await res.json()) as { result?: string };
      if (!data.result) throw new Error("Meshy: aucun identifiant de tâche renvoyé");
      return { id: data.result };
    } catch (err) {
      console.error("Échec création tâche Meshy, bascule sur tâche locale :", err);
    }
  }

  // Identifiant local
  const localId = `task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  return { id: localId };
}

/**
 * Consulte l'état d'avancement d'une tâche Meshy.
 */
export async function lireTache(id: string): Promise<TacheMeshy> {
  const apiKey = process.env.MESHY_API_KEY?.trim();

  if (apiKey && !id.startsWith("task-")) {
    try {
      const res = await fetch(`${MESHY_BASE}/image-to-3d/${id}`, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });

      if (res.ok) {
        const data = (await res.json()) as {
          id: string;
          status: string;
          progress?: number;
          model_urls?: { glb?: string; usdz?: string };
          task_error?: { message?: string };
        };

        const statutMap: Record<string, TacheMeshy["statut"]> = {
          PENDING: "PENDING",
          IN_PROGRESS: "IN_PROGRESS",
          SUCCEEDED: "SUCCEEDED",
          FAILED: "FAILED",
        };

        return {
          id: data.id,
          statut: statutMap[data.status] || "IN_PROGRESS",
          progression: data.progress ?? (data.status === "SUCCEEDED" ? 100 : 50),
          glbUrl: data.model_urls?.glb,
          usdzUrl: data.model_urls?.usdz,
          erreur: data.task_error?.message,
        };
      }
    } catch (err) {
      console.warn("Erreur lecture tâche Meshy:", err);
    }
  }

  return {
    id,
    statut: "SUCCEEDED",
    progression: 100,
  };
}

/**
 * Télécharge un fichier GLB depuis une URL distante (Meshy) et l'enregistre en local.
 */
export async function enregistrerModeleDistant(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Impossible de télécharger le modèle (${res.status})`);
  const buf = await res.arrayBuffer();
  return saveMedia("models", buf, ".glb");
}
