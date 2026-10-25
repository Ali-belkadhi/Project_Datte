// MODULE C — tâche planifiée : planifie les versements aux fournisseurs (colis livrés depuis plus de 7 jours).
// Vercel Cron appelle cette route avec « Authorization: Bearer <CRON_SECRET> ».
import { planifierVersements } from "@/server/modules/commandes/services/versements";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const autorise = secret ? request.headers.get("authorization") === `Bearer ${secret}` : process.env.NODE_ENV !== "production";
  if (!autorise) return Response.json({ error: "NON_AUTORISE" }, { status: 401 });
  const r = await planifierVersements();
  return Response.json({ ok: true, ...r });
}
