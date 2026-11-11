import "server-only";
import { deleteMedia, saveMediaNamed } from "@/server/integrations/stockage/media-local";

export interface StorageProvider {
  save(file: Buffer, filename: string, mime: string): Promise<string>;
  delete(url: string): Promise<void>;
}

/**
 * Fichiers envoyés par les utilisateurs (avatars, documents fournisseur, images) :
 * enregistrés dans MongoDB (GridFS), compatibles Vercel. URL renvoyée : `/api/media/uploads/<nom>`.
 */
class GridFsStorage implements StorageProvider {
  async save(file: Buffer, filename: string, mime: string): Promise<string> {
    return saveMediaNamed("uploads", file, filename, mime);
  }

  async delete(url: string): Promise<void> {
    try {
      await deleteMedia(url);
    } catch {
      // ignore
    }
  }
}

export const storage: StorageProvider = new GridFsStorage();
