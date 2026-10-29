import "server-only";
import { mkdir, writeFile, readFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

/**
 * Stockage local des images et modèles 3D (repris de degla-module-b, shared/storage/media-storage.ts).
 * Hors de public/ pour fonctionner aussi avec `next start`. Les URLs `/api/media/<dossier>/<fichier>`
 * déjà enregistrées en base restent valides. Remplaçable plus tard par R2 (voir ./r2.ts).
 */
export const MEDIA_ROOT = path.join(process.cwd(), "storage", "media");

const MIME: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".glb": "model/gltf-binary",
  ".mp4": "video/mp4",
};

export function mimeOf(file: string) {
  return MIME[path.extname(file).toLowerCase()] ?? "application/octet-stream";
}

/** Enregistre un fichier et renvoie son URL publique `/api/media/<dossier>/<nom>`. */
export async function saveMedia(folder: "images" | "models", data: ArrayBuffer | Buffer, ext: string) {
  const dir = path.join(MEDIA_ROOT, folder);
  await mkdir(dir, { recursive: true });
  const name = `${randomUUID()}${ext}`;
  await writeFile(path.join(dir, name), Buffer.isBuffer(data) ? data : Buffer.from(data));
  return `/api/media/${folder}/${name}`;
}

/** Lit un fichier média en empêchant toute sortie du dossier (path traversal). */
export async function readMedia(segments: string[]) {
  const target = path.resolve(MEDIA_ROOT, ...segments);
  if (!target.startsWith(MEDIA_ROOT + path.sep)) return null;
  try {
    return { data: await readFile(target), type: mimeOf(target) };
  } catch {
    return null;
  }
}
