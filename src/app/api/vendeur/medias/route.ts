import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/server/core/rbac";
import { ForbiddenError } from "@/server/core/errors";
import { imageToGlb } from "@/server/integrations/trellis/client";
import { saveMedia } from "@/server/integrations/stockage/media-local";

export const runtime = "nodejs";
/** La génération 3D peut prendre plusieurs minutes (file d'attente GPU). */
export const maxDuration = 600;

const ALLOWED: Record<string, string> = { "image/png": ".png", "image/jpeg": ".jpg", "image/webp": ".webp" };
const MAX_BYTES = 10 * 1024 * 1024;

/**
 * POST multipart/form-data { image: File, skip3d?: "1" }  — réservé au rôle FOURNISSEUR.
 * Enregistre l'image ; sauf `skip3d`, la convertit en 3D via TRELLIS et enregistre le GLB.
 * Réponse : { imageUrl, modelUrl } (modelUrl vide si 3D non demandée). Logique reprise de degla-module-b.
 */
export async function POST(request: NextRequest) {
  try {
    await requireRole("FOURNISSEUR");
  } catch (e) {
    if (e instanceof ForbiddenError) return NextResponse.json({ error: e.message }, { status: 403 });
    throw e;
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Formulaire invalide" }, { status: 400 });
  }

  const file = form.get("image");
  if (!(file instanceof File)) return NextResponse.json({ error: "Image manquante" }, { status: 400 });
  const ext = ALLOWED[file.type];
  if (!ext) return NextResponse.json({ error: "Format accepté : PNG, JPG ou WEBP" }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "Image trop lourde (10 Mo max)" }, { status: 400 });

  const onlyModel = form.get("onlyModel") === "1"; // photo déjà stockée : on ne génère que le modèle
  const imageUrl = onlyModel ? "" : await saveMedia("images", await file.arrayBuffer(), ext);
  if (form.get("skip3d") === "1") return NextResponse.json({ imageUrl, modelUrl: "" });

  try {
    const glb = await imageToGlb(file);
    const modelUrl = await saveMedia("models", glb, ".glb");
    return NextResponse.json({ imageUrl, modelUrl });
  } catch (error) {
    console.error("[TRELLIS]", error);
    const raw =
      error instanceof Error
        ? error.message
        : typeof error === "object" && error && "message" in error
          ? String((error as { message: unknown }).message)
          : String(error);
    const hasToken = Boolean(process.env.HF_TOKEN?.trim());
    let msg: string;
    if (/401|unauthori[sz]ed|invalid.*token|token.*invalid/i.test(raw)) msg = "HF_TOKEN invalide. Vérifiez le token dans .env.local puis redémarrez `npm run dev`.";
    else if (/quota|exceeded/i.test(raw))
      msg = hasToken
        ? "Quota GPU de votre compte Hugging Face épuisé pour aujourd'hui (réinitialisé toutes les 24 h). Réessayez plus tard."
        : "Quota GPU anonyme épuisé. Ajoutez HF_TOKEN=hf_... dans .env.local puis redémarrez `npm run dev`.";
    else msg = "Conversion 3D échouée.";
    // L'image reste enregistrée : le fournisseur peut publier sans 3D.
    return NextResponse.json({ imageUrl, error: `${msg} (Détail : ${raw})` }, { status: 502 });
  }
}
