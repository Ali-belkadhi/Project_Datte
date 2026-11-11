import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { GridFSBucket } from "mongodb";
import { getDb } from "@/server/core/mongo";

/**
 * Stockage des fichiers envoyés (photos produit, modèles 3D, documents fournisseur, avatars).
 *
 * Les fichiers sont enregistrés dans MongoDB (GridFS, bucket « media ») : ils persistent sur
 * MongoDB Atlas et fonctionnent sur Vercel, dont le disque est en lecture seule et éphémère.
 * Ils sont servis par `/api/media/<dossier>/<nom>` (route publique, cache immuable).
 * Lecture de secours sur disque (`storage/media`, `public/uploads`) pour les fichiers créés
 * avant ce changement, en développement local.
 */
export const MEDIA_ROOT = process.env.DEGLA_MEDIA_ROOT
  ? path.resolve(process.env.DEGLA_MEDIA_ROOT)
  : path.join(process.cwd(), "storage", "media");
const UPLOADS_ROOT = path.join(process.cwd(), "public", "uploads");

export type DossierMedia = "images" | "models" | "uploads";

const MIME: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".glb": "model/gltf-binary",
  ".mp4": "video/mp4",
  ".pdf": "application/pdf",
};

export function mimeOf(file: string) {
  return MIME[path.extname(file).toLowerCase()] ?? "application/octet-stream";
}

const bucket = async () => new GridFSBucket(await getDb(), { bucketName: "media" });

const nomSur = (nom: string) => nom.replace(/[^a-zA-Z0-9._-]/g, "");

/** Enregistre un fichier sous un nom donné et renvoie son URL publique `/api/media/<dossier>/<nom>`. */
export async function saveMediaNamed(folder: DossierMedia, data: ArrayBuffer | Buffer, nom: string, contentType = mimeOf(nom)) {
  const name = nomSur(nom);
  const filename = `${folder}/${name}`;
  const b = await bucket();
  // un nom réutilisé (ex. avatar) remplace l'ancien fichier
  for (const f of await b.find({ filename }).toArray()) await b.delete(f._id);
  await new Promise<void>((resolve, reject) => {
    const flux = b.openUploadStream(filename, { metadata: { contentType } });
    flux.once("finish", () => resolve());
    flux.once("error", reject);
    flux.end(Buffer.isBuffer(data) ? data : Buffer.from(data));
  });
  return `/api/media/${filename}`;
}

/** Enregistre un fichier avec un nom aléatoire et renvoie son URL publique. */
export async function saveMedia(folder: "images" | "models", data: ArrayBuffer | Buffer, ext: string) {
  return saveMediaNamed(folder, data, `${randomUUID()}${ext}`);
}

/** Supprime un fichier à partir de son URL (`/api/media/...` ou ancienne URL `/uploads/...`). */
export async function deleteMedia(url: string) {
  const filename = url.replace(/^\/api\/media\//, "").replace(/^\/uploads\//, "uploads/");
  const b = await bucket();
  for (const f of await b.find({ filename }).toArray()) await b.delete(f._id);
}

/** Lit un fichier (GridFS, puis disque en secours) en empêchant toute sortie du dossier. */
export async function readMedia(segments: string[]) {
  if (!segments.length || segments.some((s) => s === ".." || s.includes("/") || s.includes("\\"))) return null;
  const filename = segments.join("/");
  try {
    const b = await bucket();
    const [f] = await b.find({ filename }).sort({ uploadDate: -1 }).limit(1).toArray();
    if (f) {
      const morceaux: Buffer[] = [];
      for await (const m of b.openDownloadStream(f._id)) morceaux.push(m as Buffer);
      return { data: Buffer.concat(morceaux), type: (f.metadata?.contentType as string | undefined) ?? mimeOf(filename) };
    }
  } catch (e) {
    console.error("[media] lecture GridFS", e);
  }
  // secours : fichiers sur disque (développement local)
  const racine = segments[0] === "uploads" ? UPLOADS_ROOT : MEDIA_ROOT;
  const target = path.resolve(racine, ...(segments[0] === "uploads" ? segments.slice(1) : segments));
  if (!target.startsWith(racine + path.sep)) return null;
  try {
    return { data: await readFile(target), type: mimeOf(target) };
  } catch {
    return null;
  }
}
