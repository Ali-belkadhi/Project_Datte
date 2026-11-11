import { requireRole } from "@/lib/auth/rbac";
import { updateAvatar } from "@/server/services/ProfileService";
import { uploadDocument } from "@/server/services/DocumentService";
import { storage } from "@/server/storage";

const IMAGE_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);
const DOC_MIME = new Set(["image/jpeg", "image/png", "image/webp", "application/pdf"]);
const MAX_IMAGE = 5 * 1024 * 1024;

/**
 * Envoi de fichiers (avatar, document fournisseur, image générique).
 * multipart/form-data : `file`, `purpose` = avatar | document | image, `type` (document).
 */
export async function POST(request: Request) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return Response.json({ error: "INVALID_FORM" }, { status: 400 });
  }
  const file = form.get("file");
  const purpose = String(form.get("purpose") ?? "image");
  const type = String(form.get("type") ?? "");
  if (!(file instanceof File)) return Response.json({ error: "FILE_REQUIRED" }, { status: 400 });
  if (file.size > MAX_IMAGE) return Response.json({ error: "TOO_LARGE" }, { status: 413 });

  try {
    const u = await requireRole("CLIENT", "FOURNISSEUR", "ADMIN");
    const buffer = Buffer.from(await file.arrayBuffer());

    if (purpose === "avatar") {
      if (!IMAGE_MIME.has(file.type)) return Response.json({ error: "INVALID_MIME" }, { status: 415 });
      const url = await updateAvatar(buffer, file.type);
      return Response.json({ url });
    }

    if (purpose === "document") {
      if (!u.role || (u.role !== "FOURNISSEUR" && u.role !== "ADMIN")) {
        return Response.json({ error: "FORBIDDEN" }, { status: 403 });
      }
      if (!DOC_MIME.has(file.type)) return Response.json({ error: "INVALID_MIME" }, { status: 415 });
      if (!["CIN", "RNE", "PATENTE", "ATTESTATION_BIO"].includes(type)) {
        return Response.json({ error: "INVALID_TYPE" }, { status: 400 });
      }
      const doc = await uploadDocument(u.id, type, buffer, file.type, file.name || `${type}.pdf`);
      return Response.json({ url: (doc as { fichierUrl: string }).fichierUrl, id: String((doc as { _id: unknown })._id) });
    }

    if (!IMAGE_MIME.has(file.type)) return Response.json({ error: "INVALID_MIME" }, { status: 415 });
    const url = await storage.save(buffer, `img-${Date.now()}-${file.name.replace(/[^a-z0-9._-]/gi, "")}`, file.type);
    return Response.json({ url });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "UPLOAD_FAILED";
    return Response.json({ error: msg }, { status: 400 });
  }
}
