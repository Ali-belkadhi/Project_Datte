/* eslint-disable @typescript-eslint/no-explicit-any */
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { AiBadge } from "@/components/shared/ai-badge";
import { TYPE_DOCUMENT } from "@/lib/constants";
import { pageMetadata } from "@/lib/seo";
import { connectMongoose } from "@/server/db/mongoose";
import { Fournisseur, DocumentFournisseur, User } from "@/server/models";
import { actionAnalyserDocuments } from "@/server/actions/analyse";
import { SupplierDecision } from "@/features/comptes/admin";

export const metadata = pageMetadata("Dossier fournisseur");

export default async function DossierPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await connectMongoose();
  const f = await (Fournisseur as any).findById(id);
  if (!f) notFound();
  const u = await (User as any).findById(f.userId);
  const docs = await (DocumentFournisseur as any).find({ fournisseurId: f._id });
  return (
    <div className="space-y-6">
      <PageHeader
        fil={[{ label: "Fournisseurs", href: "/admin/fournisseurs" }, { label: f.nomBoutique ?? id }]}
        titre={f.nomBoutique ?? id}
        description={<span className="flex flex-wrap items-center gap-2">Statut: {f.statutVerification}</span>}
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <h2 className="font-display text-xl font-semibold">Documents ({docs.length})</h2>
          {docs.length === 0 && <p className="text-sm text-muted-foreground">Aucun document.</p>}
          {docs.map((d: any) => (
            <div key={String(d._id)} className="rounded-2xl border bg-card p-4 space-y-2">
              <p className="font-semibold">{(TYPE_DOCUMENT as any)[d.type] ?? d.type}</p>
              <p className="text-[13px] text-muted-foreground">{d.nomFichier}</p>
              {d.analyseIA && (
                <div className="rounded-xl bg-sand p-3 text-sm">
                  <p><span className="font-semibold">Type extrait:</span> {d.analyseIA.typeDocument}</p>
                  <p><span className="font-semibold">Nom:</span> {d.analyseIA.nomTitulaire ?? "—"}</p>
                  <p><span className="font-semibold">Numéro:</span> {d.analyseIA.numero ?? "—"}</p>
                  <p><span className="font-semibold">Expiration:</span> {d.analyseIA.dateExpiration ?? "—"}</p>
                  <p><span className="font-semibold">Lisible:</span> {String(d.analyseIA.lisible)}</p>
                  <p><span className="font-semibold">Confiance:</span> {Math.round((d.analyseIA.confiance ?? 0) * 100)}%</p>
                  {Array.isArray(d.analyseIA.incoherences) && d.analyseIA.incoherences.length > 0 && (
                    <ul className="mt-1 list-disc pl-5 text-danger">
                      {d.analyseIA.incoherences.map((x: string, i: number) => <li key={i}>{x}</li>)}
                    </ul>
                  )}
                </div>
              )}
              <p className="text-[12px] text-muted-foreground">Valide: {d.valide === null ? "non revu" : d.valide ? "oui" : "non"}</p>
            </div>
          ))}
        </div>
        <div className="space-y-4">
          <div className="rounded-2xl border bg-card p-4 space-y-3">
            <h2 className="flex items-center gap-2 font-display text-xl font-semibold">Analyse IA <AiBadge /></h2>
            <p className="text-[13px] text-muted-foreground">Lance l&apos;analyse des documents via OpenRouter. La decision reste a l&apos;administrateur.</p>
            <form action={async () => { "use server"; const { revalidatePath } = await import("next/cache"); await actionAnalyserDocuments(id); revalidatePath(`/admin/fournisseurs/${id}`); }}>
              <Button type="submit" variant="brand" size="sm">Relancer l&apos;analyse</Button>
            </form>
            {docs.some((d: any) => d.analyseIA) && (
              <p className="text-[12px] text-success">Analyse disponible (voir documents).</p>
            )}
          </div>
          <dl className="grid gap-2 rounded-2xl border bg-card p-4 text-sm sm:grid-cols-2">
            {[
              ["Gérant", u ? `${u.prenom} ${u.nom}` : "—"],
              ["Type", f.type ?? "—"],
              ["Région", f.region ?? "—"],
              ["E-mail", u?.email ?? "—"],
              ["Description", f.description ?? "—"],
              ["RIB", f.ribEncrypted ? `•••• ${f.ribEncrypted.last4}` : "—"],
              ["Statut", f.statutVerification],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="text-[12px] text-muted-foreground">{k}</dt>
                <dd className="font-medium">{v}</dd>
              </div>
            ))}
          </dl>
          {f.statutVerification !== "VERIFIE" && <SupplierDecision fournisseurId={id} />}
        </div>
      </div>
    </div>
  );
}