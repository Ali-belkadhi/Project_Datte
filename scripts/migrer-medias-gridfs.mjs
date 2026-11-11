// Migration : copie dans MongoDB (GridFS, bucket « media ») les fichiers encore stockés sur disque
// (public/uploads, storage/media) et met à jour leurs URL en base. À lancer une fois avant le déploiement :
//   npm run media:migrer
// Idempotent : un fichier déjà migré est ignoré.
import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
import { GridFSBucket, MongoClient } from "mongodb";

dotenv.config({ path: ".env.local" });
dotenv.config();
const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI manquant (.env.local)");

const MIME = { ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".glb": "model/gltf-binary", ".pdf": "application/pdf", ".mp4": "video/mp4" };

/** URL ancienne → [fichier local, nom GridFS] */
function source(url) {
  if (typeof url !== "string") return null;
  if (url.startsWith("/uploads/")) return [path.join("public", "uploads", url.slice(9)), `uploads/${url.slice(9)}`];
  if (/^\/api\/media\/(images|models)\//.test(url)) {
    const rel = url.slice("/api/media/".length);
    return [path.join(process.env.DEGLA_MEDIA_ROOT ?? path.join("storage", "media"), rel), rel];
  }
  return null;
}

const client = await MongoClient.connect(uri);
const db = client.db();
const bucket = new GridFSBucket(db, { bucketName: "media" });
let copies = 0, manquants = 0, maj = 0;

async function migrer(url) {
  const s = source(url);
  if (!s) return url;
  const [fichier, filename] = s;
  if (!(await bucket.find({ filename }).limit(1).toArray()).length) {
    if (!fs.existsSync(fichier)) {
      manquants++;
      return url;
    }
    await new Promise((resolve, reject) => {
      const flux = bucket.openUploadStream(filename, { metadata: { contentType: MIME[path.extname(fichier).toLowerCase()] ?? "application/octet-stream" } });
      flux.once("finish", resolve);
      flux.once("error", reject);
      flux.end(fs.readFileSync(fichier));
    });
    copies++;
  }
  return `/api/media/${filename}`;
}

// collection → champs contenant des URL de fichiers
const CIBLES = {
  documentfournisseurs: ["fichierUrl"],
  users: ["avatarUrl"],
  fournisseurs: ["logoUrl", "banniereUrl"],
  products: ["imageUrl", "modelUrl", "images"],
  modele3ds: ["glbUrl", "usdzUrl", "miniatureUrl"],
};

for (const [nom, champs] of Object.entries(CIBLES)) {
  const col = db.collection(nom);
  for (const doc of await col.find({ $or: champs.map((c) => ({ [c]: { $exists: true } })) }).toArray()) {
    const set = {};
    for (const c of champs) {
      const v = doc[c];
      if (Array.isArray(v)) {
        const n = [];
        for (const u of v) n.push(await migrer(u));
        if (n.some((u, i) => u !== v[i])) set[c] = n;
      } else {
        const n = await migrer(v);
        if (n !== v) set[c] = n;
      }
    }
    if (Object.keys(set).length) {
      await col.updateOne({ _id: doc._id }, { $set: set });
      maj++;
    }
  }
}

console.log(`Fichiers copiés dans GridFS : ${copies} · documents mis à jour : ${maj} · fichiers locaux introuvables : ${manquants}`);
await client.close();
