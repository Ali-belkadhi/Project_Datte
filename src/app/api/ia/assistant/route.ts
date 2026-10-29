// MODULE C — IA-C : assistant d'achat. POST { messages: [{ role, content }] } → réponse + produits / suivi.
import { z } from "zod";
import { repondreAssistant } from "@/server/modules/commandes/services/assistant-ia";

const corps = z.object({
  messages: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().trim().min(1).max(1000) }))
    .min(1)
    .max(30),
});

// limite simple : 20 questions par minute et par adresse IP
const fenetre = new Map<string, { debut: number; n: number }>();
function autorise(ip: string) {
  const now = Date.now();
  const f = fenetre.get(ip);
  if (!f || now - f.debut > 60_000) {
    fenetre.set(ip, { debut: now, n: 1 });
    return true;
  }
  f.n += 1;
  return f.n <= 20;
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (!autorise(ip)) return Response.json({ error: "TROP_DE_REQUETES" }, { status: 429 });
  const p = corps.safeParse(await request.json().catch(() => null));
  if (!p.success) return Response.json({ error: "VALIDATION" }, { status: 400 });
  try {
    return Response.json(await repondreAssistant(p.data.messages));
  } catch (e) {
    console.error("[assistant]", e);
    return Response.json({ error: "INTERNE" }, { status: 500 });
  }
}
