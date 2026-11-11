// COMMUN — sonde de santé. SEUL Route Handler fonctionnel du template.
import { siteConfig } from "@/config/site";

export const dynamic = "force-dynamic";

export function GET() {
  return Response.json({ ok: true, app: siteConfig.name, version: siteConfig.version, mode: "template-demo" });
}
