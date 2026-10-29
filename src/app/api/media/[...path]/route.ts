import { readMedia } from "@/server/integrations/stockage/media-local";

export const runtime = "nodejs";

/** Sert les images et modèles 3D stockés localement (module B). Lecture publique. */
export async function GET(_req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const file = await readMedia((await params).path);
  if (!file) return Response.json({ error: "Introuvable" }, { status: 404 });
  return new Response(new Uint8Array(file.data), {
    headers: { "Content-Type": file.type, "Cache-Control": "public, max-age=31536000, immutable" },
  });
}
