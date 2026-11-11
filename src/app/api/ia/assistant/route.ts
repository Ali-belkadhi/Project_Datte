// MODULE C — IA-C : assistant d'achat. POST { messages: UIMessage[] } → flux UI (useChat).
import { z } from "zod";
import { getUtilisateurCourant } from "@/server/contracts/comptes";
import { repondreAssistant, type MessageAssistant } from "@/server/modules/commandes/services/assistant-ia";

export const maxDuration = 30;

// validation minimale du corps : la structure fine des parts est vérifiée par convertToModelMessages
const corps = z.object({
  messages: z
    .array(z.object({ id: z.string(), role: z.enum(["user", "assistant", "system"]), parts: z.array(z.looseObject({ type: z.string() })).max(40) }))
    .min(1)
    .max(40),
});

// limite simple : 20 requêtes par minute et par client (ou par IP pour un visiteur)
const fenetre = new Map<string, { debut: number; n: number }>();
function autorise(cle: string) {
  const now = Date.now();
  const f = fenetre.get(cle);
  if (!f || now - f.debut > 60_000) {
    fenetre.set(cle, { debut: now, n: 1 });
    return true;
  }
  return ++f.n <= 20;
}

export async function POST(request: Request) {
  const u = await getUtilisateurCourant().catch(() => null);
  const clientId = u?.role === "CLIENT" ? u.id : null; // RBAC : seul un client a des commandes à suivre
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (!autorise(clientId ?? ip)) return Response.json({ error: "TROP_DE_REQUETES" }, { status: 429 });

  const p = corps.safeParse(await request.json().catch(() => null));
  if (!p.success) return Response.json({ error: "VALIDATION" }, { status: 400 });
  // seuls les 20 derniers messages sont envoyés au modèle (coût maîtrisé)
  const messages = (p.data.messages as unknown as MessageAssistant[]).filter((m) => m.role !== "system").slice(-20);
  return repondreAssistant(messages, clientId);
}
