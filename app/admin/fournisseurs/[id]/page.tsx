import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, FileText, User, MapPin, CreditCard, ArrowLeft } from "lucide-react";
import { FournisseurService } from "@/server/services/FournisseurService";
import { DocumentFournisseurService } from "@/server/services/DocumentFournisseurService";
import { ValidationFournisseur } from "@/components/admin/validation-fournisseur";
import { Badge } from "@/components/ui/badge";
import connectDB from "@/lib/mongoose";
import Utilisateur from "@/domain/models/Utilisateur";
import type { AnalyseDocument } from "@/lib/zod/ia.schemas";

export const metadata = { title: "Administration — Dossier fournisseur" };

/** Convertit l'analyse IA stockée (JSON) en résumé lisible */
function resumeIa(brut: string): string {
  try {
    const a = JSON.parse(brut) as AnalyseDocument;
    const anomalies = a.anomalies?.length ? ` · anomalies : ${a.anomalies.join(", ")}` : "";
    return `${a.resume} (conforme : ${a.conforme ? "oui" : "non"} · confiance : ${Math.round(
      (a.confiance ?? 0) * 100
    )}%${anomalies})`;
  } catch {
    return brut;
  }
}

export default async function AdminFournisseurDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let fournisseur = null;
  try {
    fournisseur = await FournisseurService.getFournisseur(id);
  } catch {
    fournisseur = null;
  }
  if (!fournisseur) notFound();

  await connectDB();
  const [documents, utilisateur] = await Promise.all([
    DocumentFournisseurService.lister(fournisseur._id.toString()),
    Utilisateur.findById(fournisseur.utilisateurId)
      .select("email nom prenom telephone emailVerifie telephoneVerifie")
      .lean(),
  ]);

  return (
    <div className="space-y-6">
      <Link
        href="/admin/fournisseurs"
        className="inline-flex items-center gap-2 text-sm text-forest hover:underline"
      >
        <ArrowLeft className="size-4" /> Retour à la liste
      </Link>

      <div className="rounded-3xl border border-forest/10 bg-cream-50/90 p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="font-serif text-2xl font-medium text-forest">
              {fournisseur.nomBoutique}
            </h2>
            <p className="text-sm text-muted">
              {fournisseur.type} · {fournisseur.region.replace("_", " ")} · slug : {fournisseur.slug}
            </p>
          </div>
          <Badge variant={fournisseur.statutVerification === "VERIFIE" ? "gold" : "outline"}>
            {fournisseur.statutVerification.replace("_", " ")}
          </Badge>
        </div>

        {fournisseur.description && (
          <p className="mt-4 text-sm text-ink/75">{fournisseur.description}</p>
        )}

        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="flex items-start gap-3">
            <User className="mt-0.5 size-4 text-gold" />
            <div>
              <dt className="text-xs uppercase tracking-wider text-muted">Responsable</dt>
              <dd className="text-sm text-forest">
                {utilisateur ? `${utilisateur.prenom} ${utilisateur.nom}` : "—"}
                <br />
                <span className="text-muted">{utilisateur?.email}</span>
                {utilisateur?.telephone && (
                  <>
                    <br />
                    <span className="text-muted">{utilisateur.telephone}</span>
                  </>
                )}
              </dd>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MapPin className="mt-0.5 size-4 text-gold" />
            <div>
              <dt className="text-xs uppercase tracking-wider text-muted">Adresse d&apos;exploitation</dt>
              <dd className="text-sm text-forest">{fournisseur.adresseExploitation}</dd>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CreditCard className="mt-0.5 size-4 text-gold" />
            <div>
              <dt className="text-xs uppercase tracking-wider text-muted">RIB</dt>
              <dd className="font-mono text-sm text-forest">{fournisseur.rib}</dd>
            </div>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-muted">Matricule fiscal / RNE</dt>
            <dd className="text-sm text-forest">
              {fournisseur.matriculeFiscal || "—"} / {fournisseur.numeroRNE || "—"}
            </dd>
          </div>
        </dl>
      </div>

      {/* Documents */}
      <div className="rounded-3xl border border-forest/10 bg-cream-50/90 p-6 sm:p-8">
        <h3 className="mb-4 flex items-center gap-2 font-serif text-xl font-medium text-forest">
          <FileText className="size-5 text-gold" /> Pièces justificatives
        </h3>
        {documents.length === 0 ? (
          <p className="text-sm text-muted">Aucun document fourni.</p>
        ) : (
          <ul className="space-y-3">
            {documents.map((doc) => (
              <li
                key={doc._id.toString()}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-forest/10 bg-cream-50/70 p-4"
              >
                <div>
                  <p className="text-sm font-medium text-forest">{doc.type}</p>
                  {doc.analyseIa && (
                    <p className="mt-1 max-w-xl text-xs text-muted">
                      <span className="font-semibold text-gold-dark">Analyse IA :</span>{" "}
                      {resumeIa(doc.analyseIa)}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {doc.valide === true && <Badge variant="gold">Validé</Badge>}
                  {doc.valide === false && <Badge variant="default">Non conforme</Badge>}
                  {doc.valide == null && <Badge variant="outline">En attente</Badge>}
                  <a
                    href={doc.fichierUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-forest underline"
                  >
                    Ouvrir <ExternalLink className="size-3" />
                  </a>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Décision */}
      <div className="rounded-3xl border border-forest/10 bg-cream-50/90 p-6 sm:p-8">
        <h3 className="mb-4 font-serif text-xl font-medium text-forest">Décision</h3>
        <ValidationFournisseur
          fournisseurId={fournisseur._id.toString()}
          statut={fournisseur.statutVerification}
        />
        {fournisseur.motifRefus && (
          <p className="mt-4 text-sm text-muted">
            <strong>Dernier motif :</strong> {fournisseur.motifRefus}
          </p>
        )}
      </div>
    </div>
  );
}
