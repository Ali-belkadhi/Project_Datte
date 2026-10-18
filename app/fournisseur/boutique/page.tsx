import { redirect } from "next/navigation";
import Link from "next/link";
import { ExternalLink, FileText } from "lucide-react";
import { auth } from "@/lib/auth";
import { getUtilisateurCourant } from "@/server/middleware/rbac";
import { FournisseurService } from "@/server/services/FournisseurService";
import { DocumentFournisseurService } from "@/server/services/DocumentFournisseurService";
import { BoutiqueForm } from "@/components/fournisseur/boutique-form";
import { Alerte } from "@/components/ui/feedback";
import { Badge } from "@/components/ui/badge";
import { StatutVerification } from "@/domain/enums";

export const metadata = { title: "Ma boutique" };

export default async function BoutiquePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion?callbackUrl=/fournisseur/boutique");

  const utilisateur = await getUtilisateurCourant();
  const fournisseur = await FournisseurService.getFournisseurByUtilisateur(
    utilisateur._id.toString()
  );

  if (!fournisseur) redirect("/fournisseur/onboarding");

  const documents = await DocumentFournisseurService.lister(fournisseur._id.toString());
  const estVerifie = fournisseur.statutVerification === StatutVerification.VERIFIE;

  return (
    <div className="space-y-6">
      {!estVerifie && (
        <Alerte type="info">
          Votre boutique n&apos;est pas encore vérifiée : vous ne pouvez pas publier de produits
          tant que votre dossier n&apos;a pas été validé.
        </Alerte>
      )}

      <section className="rounded-3xl border border-forest/10 bg-cream-50/80 p-6 sm:p-8">
        <h2 className="mb-6 font-serif text-2xl font-medium text-forest">Informations boutique</h2>
        <BoutiqueForm
          fournisseur={{
            id: fournisseur._id.toString(),
            nomBoutique: fournisseur.nomBoutique,
            description: fournisseur.description,
            logoUrl: fournisseur.logoUrl,
            banniereUrl: fournisseur.banniereUrl,
            adresseExploitation: fournisseur.adresseExploitation,
          }}
        />
      </section>

      <section className="rounded-3xl border border-forest/10 bg-cream-50/80 p-6 sm:p-8">
        <h2 className="mb-4 font-serif text-2xl font-medium text-forest">
          Pièces justificatives
        </h2>
        {documents.length === 0 ? (
          <p className="text-sm text-muted">
            Aucun document enregistré. Ajoutez-les depuis la page{" "}
            <Link href="/fournisseur/onboarding" className="underline">
              de votre dossier
            </Link>
            .
          </p>
        ) : (
          <ul className="space-y-3">
            {documents.map((doc) => (
              <li
                key={doc._id.toString()}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-forest/10 bg-cream-50/70 p-4"
              >
                <span className="flex items-center gap-2 text-sm font-medium text-forest">
                  <FileText className="size-4 text-gold" /> {doc.type}
                </span>
                <span className="flex items-center gap-3">
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
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
