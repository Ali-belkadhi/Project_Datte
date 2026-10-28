import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";

export interface StorageProvider {
  save(file: Buffer, filename: string, mime: string): Promise<string>;
  delete(url: string): Promise<void>;
}

class LocalDiskStorage implements StorageProvider {
  private base = path.join(process.cwd(), "public", "uploads");

  async save(file: Buffer, filename: string): Promise<string> {
    await fs.mkdir(this.base, { recursive: true });
    const target = path.join(this.base, filename);
    await fs.writeFile(target, file);
    return `/uploads/${filename}`;
  }

  async delete(url: string): Promise<void> {
    const name = url.replace(/^\/uploads\//, "");
    try {
      await fs.unlink(path.join(this.base, name));
    } catch {
      // ignore
    }
  }
}

export const storage: StorageProvider = new LocalDiskStorage();