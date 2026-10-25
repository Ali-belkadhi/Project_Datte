// MODULE C — webhook de la passerelle de paiement.
// Corps attendu (à adapter à l'API choisie) : { reference, statut: "REUSSI" | "ECHOUE" }.
// TODO(module C) : vérifier la signature de la passerelle avant de confirmer.
import { confirmationPaiementSchema } from "@/lib/validation/commandes";
import { confirmerPaiement } from "@/server/modules/commandes/services/paiements";

export async function POST(request: Request) {
  const parsed = confirmationPaiementSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "VALIDATION" }, { status: 400 });
  const p = await confirmerPaiement(parsed.data.reference, parsed.data.statut);
  if (!p) return Response.json({ error: "NOT_FOUND" }, { status: 404 });
  return Response.json({ ok: true, reference: p.reference, statut: p.statut });
}
