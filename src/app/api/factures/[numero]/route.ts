// MODULE C — facture PDF d'une commande (client propriétaire, vendeur concerné ou admin).
import { facturePdf } from "@/server/modules/commandes/services/factures";

export async function GET(_: Request, { params }: { params: Promise<{ numero: string }> }) {
  const { numero } = await params;
  const f = await facturePdf(numero);
  if (!f) return Response.json({ error: "NOT_FOUND" }, { status: 404 });
  return new Response(Buffer.from(f.octets), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${f.nomFichier}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
