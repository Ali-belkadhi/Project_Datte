import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPin, Star, ShieldCheck, Package, Clock } from "lucide-react";
import { FournisseurService } from "@/server/services/FournisseurService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BoutonContacter } from "@/components/messagerie/bouton-contacter";
import { BoutonSignaler } from "@/components/signalement/bouton-signaler";
import { StatutVerification, CibleSignalement } from "@/domain/enums";

export default async function BoutiquePubliquePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let fournisseur = null;
  try {
    fournisseur = await FournisseurService.getFournisseurBySlug(slug);
  } catch {
    fournisseur = null;
  }
  if (!fournisseur) notFound();

  const estVerifie = fournisseur.statutVerification === StatutVerification.VERIFIE;

  return (
    <div className="min-h-screen pb-24">
      {/* Bannière */}
      <div className="relative h-56 w-full overflow-hidden bg-forest md:h-72">
        {fournisseur.banniereUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={fournisseur.banniereUrl}
            alt=""
            className="h-full w-full object-cover opacity-70"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-forest via-forest-700 to-ink" />
        )}
      </div>

      <div className="container-lux -mt-16">
        <div className="rounded-3xl border border-forest/10 bg-cream-50/95 p-6 shadow-card sm:p-8">
          <div className="flex flex-wrap items-start gap-5">
            <div className="relative size-20 shrink-0 overflow-hidden rounded-2xl border border-forest/15 bg-beige/40">
              {fournisseur.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={fournisseur.logoUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center font-serif text-2xl font-semibold text-forest">
                  {fournisseur.nomBoutique.charAt(0)}
                </div>
              )}
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="font-serif text-3xl font-semibold text-forest">
                  {fournisseur.nomBoutique}
                </h1>
                {estVerifie ? (
                  <Badge variant="gold">
                    <ShieldCheck className="size-3.5" /> Vérifié
                  </Badge>
                ) : (
                  <Badge variant="outline">
                    <Clock className="size-3.5" /> En vérification
                  </Badge>
                )}
              </div>

              <p className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted">
                <span className="flex items-center gap-1">
                  <MapPin className="size-4" /> {fournisseur.region.replace("_", " ")}
                </span>
                <span className="flex items-center gap-1">
                  <Star className="size-4 text-gold" /> {fournisseur.noteMoyenne.toFixed(1)} / 5
                </span>
                <span>{fournisseur.type}</span>
              </p>

              {fournisseur.description && (
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink/75">
                  {fournisseur.description}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-forest/10 bg-cream-50/80 p-8 text-center">
          <Package className="mx-auto size-9 text-gold" />
          {estVerifie ? (
            <>
              <h2 className="mt-3 font-serif text-xl font-medium text-forest">
                Produits bientôt disponibles
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted">
                Les créations de {fournisseur.nomBoutique} seront affichées ici dès leur
                publication.
              </p>
            </>
          ) : (
            <>
              <h2 className="mt-3 font-serif text-xl font-medium text-forest">
                Boutique en cours de vérification
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted">
                Ce partenaire n&apos;a pas encore été validé par notre équipe.
              </p>
            </>
          )}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {estVerifie ? (
              <BoutonContacter fournisseurId={fournisseur._id.toString()} />
            ) : null}
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/produits">Découvrir DEGLA</Link>
            </Button>
          </div>

          <div className="mt-6 flex justify-center">
            <BoutonSignaler
              cibleType={CibleSignalement.FOURNISSEUR}
              cibleId={fournisseur._id.toString()}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
