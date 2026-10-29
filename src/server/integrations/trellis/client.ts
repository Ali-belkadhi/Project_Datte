import "server-only";
import { Client, handle_file } from "@gradio/client";

/**
 * Conversion image -> modèle 3D (.glb) via le Space Hugging Face TRELLIS (repris tel quel de degla-module-b).
 * Le modèle tourne sur les GPU de Hugging Face (ZeroGPU) : aucun GPU local n'est requis.
 * Un HF_TOKEN dans .env.local augmente fortement le quota GPU gratuit (jamais exposé au navigateur).
 */
type FileData = { url?: string; path?: string };

export type TrellisOptions = {
  seed?: number;
  textureSize?: 512 | 1024 | 2048;
  meshSimplify?: number;
};

export async function imageToGlb(image: Blob, opts: TrellisOptions = {}): Promise<ArrayBuffer> {
  const space = process.env.TRELLIS_SPACE || "trellis-community/TRELLIS";
  const token = process.env.HF_TOKEN?.trim();
  const client = await Client.connect(space, token ? { token: token as `hf_${string}` } : {});

  // Crée le dossier de session côté Space (équivalent de demo.load(start_session)).
  await client.predict("/start_session", {}).catch(() => undefined);

  // 1) Suppression de l'arrière-plan (rembg) + recadrage.
  const pre = await client.predict("/preprocess_image", { image: handle_file(image) });
  const processed = (pre.data as FileData[])[0];
  if (!processed) throw new Error("TRELLIS: prétraitement de l'image échoué");

  // 2) Génération 3D + extraction GLB.
  const gen = await client.predict("/generate_and_extract_glb", {
    image: processed,
    multiimages: [],
    seed: opts.seed ?? Math.floor(Math.random() * 2_147_483_647),
    ss_guidance_strength: 7.5,
    ss_sampling_steps: 12,
    slat_guidance_strength: 3,
    slat_sampling_steps: 12,
    multiimage_algo: "stochastic",
    mesh_simplify: opts.meshSimplify ?? 0.95,
    texture_size: opts.textureSize ?? 1024,
  });

  // Sorties: [vidéo, GLB (viewer), GLB (téléchargement)]
  const [, glb, glbDownload] = gen.data as FileData[];
  const url = glb?.url ?? glbDownload?.url;
  if (!url) throw new Error("TRELLIS: aucun fichier GLB renvoyé");

  const res = await fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
  if (!res.ok) throw new Error(`TRELLIS: téléchargement du GLB impossible (${res.status})`);
  return res.arrayBuffer();
}
