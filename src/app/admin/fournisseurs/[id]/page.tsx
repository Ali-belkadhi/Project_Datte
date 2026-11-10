import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/shared/status-badge";
import { DocumentIllustration } from "@/components/illustrations/scenes";
import { SupplierDecision } from "@/features/comptes/admin";
import { AiDocumentAnalysisCard } from "@/features/comptes/ia-verification";
import { GOUVERNORAT_LABEL, STATUT_VERIFICATION, TYPE_DOCUMENT, TYPE_FOURNISSEUR } from "@/lib/constants";
import { formatDateHeure } from "@/lib/format";
import { pageMetadata } from "@/lib/seo";
import { getAnalyseDocuments, getDossierFournisseur } from "@/server/modules/comptes/services/fournisseurs";

export const metadata = pageMetadata("Dossier fournisseur");

/** Dossier fournisseur (module A) : visionneuse de documents, carte Analyse IA (IA-A), informations, décision. */
export default async function DossierPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [dossier, analyse] = await Promise.all([getDossierFournisseur(id), getAnalyseDocuments(id)]);
  if (!dossier) notFound();
  const f = dossier.fournisseur;
  const docs = dossier.documents.length ? dossier.documents : [{ id: "d", type: "CIN" as const, nomFichier: "cin.jpg", deposeLe: dossier.soumisLe, valide: true, fournisseurId: id }];
  return (
    <div className="space-y-6">
      <PageHeader
        fil={[{ label: "Fournisseurs", href: "/admin/fournisseurs" }, { label: f.nomBoutique }]}
        titre={f.nomBoutique}
        description={<span className="flex flex-wrap items-center gap-2">Soumis le {formatDateHeure(dossier.soumisLe)} <StatusBadge status={STATUT_VERIFICATION[f.statutVerification]} /></span>}
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <Tabs defaultValue={docs[0].id} className="gap-3">
          <TabsList>
            {docs.map((d) => (
              <TabsTrigger key={d.id} value={d.id}>{d.type === "ATTESTATION_BIO" ? "Bio" : TYPE_DOCUMENT[d.type].split(" ")[0]}</TabsTrigger>
            ))}
          </TabsList>
          {docs.map((d) => (
            <TabsContent key={d.id} value={d.id} className="space-y-2">
              <div className="aspect-[16/11] overflow-hidden rounded-2xl border">
                <DocumentIllustration type={d.type} nom={f.gerant} />
              </div>
              <p className="text-[13px] text-muted-foreground">{d.nomFichier} · déposé le {formatDateHeure(d.deposeLe)}</p>
            </TabsContent>
          ))}
        </Tabs>
        <div className="space-y-4">
          {analyse && <AiDocumentAnalysisCard analyse={analyse} />}
          <dl className="grid gap-2 rounded-2xl border bg-card p-4 text-sm sm:grid-cols-2">
            {[
              ["Gérant", f.gerant],
              ["Type", TYPE_FOURNISSEUR[f.type]],
              ["Région", `${f.ville}, ${GOUVERNORAT_LABEL[f.region]}`],
              ["E-mail", dossier.email],
              ["Téléphone", dossier.telephone],
              ["Matricule fiscal", dossier.matriculeFiscal],
              ["N° RNE", dossier.numeroRNE],
              ["RIB", dossier.ribMasque],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="text-[12px] text-muted-foreground">{k}</dt>
                <dd className="font-medium">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
      <SupplierDecision fournisseurId={f.id} />
    </div>
  );
}
