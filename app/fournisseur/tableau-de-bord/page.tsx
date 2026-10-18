import Link from "next/link";
import { redirect } from "next/navigation";
import { Store, Clock, ShieldCheck, ShieldX, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { auth } from "@/lib/auth";
import { getUtilisateurCourant } from "@/server/middleware/rbac";
import { FournisseurService } from "@/server/services/FournisseurService";
import { StatutVerification } from "@/domain/enums";

export const metadata = { title: "Tableau de bord fournisseur" };

const STATUTS: Record<
  StatutVerification,
  { libelle: string; tone: "gold" | "outline" | "default"; icon: typeof Clock; aide: string }
> = {
  [StatutVerification.EN_ATTENTE]: {
    libelle: "En attente de vérification",
    tone: "outline",
    icon: Clock,
    aide: "Votre dossier est en cours d'examen par notre équipe. Vous serez notifié dès qu'il sera traité.",
  },
  [StatutVerification.VERIFIE]: {
    libelle: "Vérifié",
    tone: "gold",
    icon: ShieldCheck,
    aide: "Votre boutique est vérifiée. Vous pouvez publier vos produits.",
  },
  [StatutVerification.REFUSE]: {
    libelle: "Refusé",
    tone: "default",
    icon: ShieldX,
    aide: "Votre demande a été refusée. Corrigez votre dossier puis soumettez-le à nouveau.",
  },
  [StatutVerification.SUSPENDU]: {
    libelle: "Suspendu",
    tone: "default",
    icon: AlertTriangle,
    aide: "Votre boutique est suspendue. Contactez le support pour plus d'informations.",
  },
};

export default async function TableauDeBordFournisseurPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion?callbackUrl=/fournisseur/tableau-de-bord");

  const utilisateur = await getUtilisateurCourant();
  const fournisseur = await FournisseurService.getFournisseurByUtilisateur(
    utilisateur._id.toString()
  );

  if (!fournisseur) {
    return (
      <div className="rounded-3xl border border-forest/10 bg-cream-50/80 p-8 text-center">
        <Store className="mx-auto size-10 text-gold" />
        <h2 className="mt-4 font-serif text-2xl font-medium text-forest">
          Complétez votre inscription
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted">
          Créez votre profil fournisseur en 3 étapes pour pouvoir vendre sur DEGLA.
        </p>
        <Button asChild className="mt-6 rounded-full">
          <Link href="/fournisseur/onboarding">Démarrer mon inscription</Link>
        </Button>
      </div>
    );
  }

  const statut = STATUTS[fournisseur.statutVerification];
  const Icone = statut.icon;

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-forest/10 bg-cream-50/80 p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="font-serif text-2xl font-medium text-forest">
              {fournisseur.nomBoutique}
            </h2>
            <p className="text-sm text-muted">
              {fournisseur.type} · {fournisseur.region.replace("_", " ")}
            </p>
          </div>
          <Badge variant={statut.tone === "default" ? "default" : statut.tone}>
            <Icone className="size-3.5" /> {statut.libelle}
          </Badge>
        </div>

        <p className="mt-4 text-sm text-ink/75">{statut.aide}</p>

        {fournisseur.motifRefus && (
          <div className="mt-4 rounded-2xl border border-destructive/30 bg-destructive/8 px-4 py-3 text-sm text-destructive">
            <strong>Motif :</strong> {fournisseur.motifRefus}
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-forest/10 bg-cream-50/70 p-5">
          <p className="text-xs uppercase tracking-wider text-muted">Crédits 3D</p>
          <p className="mt-1 font-serif text-2xl font-semibold text-forest">
            {fournisseur.soldeCredits3D}
          </p>
        </div>
        <div className="rounded-2xl border border-forest/10 bg-cream-50/70 p-5">
          <p className="text-xs uppercase tracking-wider text-muted">Note moyenne</p>
          <p className="mt-1 font-serif text-2xl font-semibold text-forest">
            {fournisseur.noteMoyenne.toFixed(1)} / 5
          </p>
        </div>
        <div className="rounded-2xl border border-forest/10 bg-cream-50/70 p-5">
          <p className="text-xs uppercase tracking-wider text-muted">Ventes</p>
          <p className="mt-1 font-serif text-2xl font-semibold text-forest">
            {fournisseur.nombreVentes}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button asChild variant="outline" className="rounded-full">
          <Link href="/fournisseur/boutique">Modifier ma boutique</Link>
        </Button>
        {fournisseur.statutVerification === StatutVerification.VERIFIE && (
          <Button asChild variant="ghost" className="rounded-full">
            <Link href={`/boutique/${fournisseur.slug}`}>Voir ma boutique publique</Link>
          </Button>
        )}
      </div>
    </div>
  );
}
