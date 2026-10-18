import Link from "next/link";
import { redirect } from "next/navigation";
import { Package, User, MapPin, Heart, ShieldCheck, MessageCircle, Bell } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongoose";
import Client from "@/domain/models/Client";
import { getUtilisateurCourant } from "@/server/middleware/rbac";
import { AdresseService } from "@/server/services/AdresseService";
import { ProfilForm } from "@/components/compte/profil-form";
import { OtpVerifier } from "@/components/compte/otp-verifier";
import { AdressesManager, type AdresseVue } from "@/components/compte/adresses-manager";
import { BoutonDeconnexion } from "@/components/auth/bouton-deconnexion";

export const metadata = {
  title: "Mon Compte",
  description: "Gérez votre profil DEGLA et vos adresses de livraison.",
};

export default async function ComptePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion?callbackUrl=/compte");

  const utilisateur = await getUtilisateurCourant();

  await connectDB();
  const clientId = await AdresseService.getClientId(utilisateur._id.toString());
  const client = await Client.findById(clientId).select('adresseParDefautId').lean();
  const adressesBrutes = await AdresseService.lister(utilisateur._id.toString());
  const adresseParDefautId = client?.adresseParDefautId?.toString();

  const adresses: AdresseVue[] = adressesBrutes.map((a) => ({
    id: a._id.toString(),
    libelle: a.libelle,
    ligne1: a.ligne1,
    ligne2: a.ligne2,
    ville: a.ville,
    gouvernorat: a.gouvernorat,
    codePostal: a.codePostal,
    telephone: a.telephone,
    parDefaut: a._id.toString() === adresseParDefautId,
  }));

  const initiales = `${utilisateur.prenom?.[0] ?? ""}${utilisateur.nom?.[0] ?? ""}`.toUpperCase();

  return (
    <div className="min-h-screen pb-24">
      <PageHeader
        eyebrow="ESPACE PRIVÉ"
        title="Mon Compte"
        description="Bienvenue dans votre espace personnel DEGLA."
        crumbs={[{ label: "Mon compte" }]}
      />

      <div className="container-lux mt-10">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Sidebar */}
          <aside className="lg:col-span-4">
            <div className="rounded-3xl border border-forest/10 bg-cream-50/80 p-6">
              <div className="flex items-center gap-4 border-b border-forest/10 pb-6">
                <div className="flex size-14 items-center justify-center rounded-full bg-forest font-serif text-xl font-semibold text-cream">
                  {initiales || "?"}
                </div>
                <div className="min-w-0">
                  <h3 className="truncate font-serif text-lg font-semibold text-forest">
                    {utilisateur.prenom} {utilisateur.nom}
                  </h3>
                  <p className="truncate text-xs text-muted">{utilisateur.email}</p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Badge variant="outline">{utilisateur.role}</Badge>
                {utilisateur.emailVerifie ? (
                  <Badge variant="gold">Email vérifié</Badge>
                ) : (
                  <Badge>Email non vérifié</Badge>
                )}
              </div>

              <nav className="mt-6 space-y-2">
                <a
                  href="#profil"
                  className="flex w-full items-center gap-3 rounded-xl bg-forest px-4 py-3 text-sm font-medium text-cream"
                >
                  <User className="size-4 text-gold-light" /> Informations personnelles
                </a>
                <a
                  href="#adresses"
                  className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-forest transition-colors hover:bg-beige/40"
                >
                  <MapPin className="size-4" /> Adresses de livraison
                </a>
                <a
                  href="#securite"
                  className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-forest transition-colors hover:bg-beige/40"
                >
                  <ShieldCheck className="size-4" /> Sécurité & vérification
                </a>
                <Link
                  href="/messages"
                  className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-forest transition-colors hover:bg-beige/40"
                >
                  <MessageCircle className="size-4" /> Messagerie
                </Link>
                <Link
                  href="/notifications"
                  className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-forest transition-colors hover:bg-beige/40"
                >
                  <Bell className="size-4" /> Notifications
                </Link>
                <Link
                  href="/produits"
                  className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-forest transition-colors hover:bg-beige/40"
                >
                  <Heart className="size-4" /> Mes favoris
                </Link>
              </nav>

              <div className="mt-8 border-t border-forest/10 pt-6">
                <BoutonDeconnexion className="w-full text-destructive hover:bg-destructive/10" />
              </div>
            </div>
          </aside>

          {/* Main */}
          <div className="space-y-8 lg:col-span-8">
            {!utilisateur.emailVerifie && (
              <div className="rounded-3xl border border-gold/30 bg-gold/8 p-6">
                <p className="text-sm text-gold-dark">
                  Votre adresse email n&apos;est pas encore vérifiée. Pensez à cliquer sur le lien
                  reçu par email.
                </p>
              </div>
            )}

            <section id="profil" className="scroll-mt-28 rounded-3xl border border-forest/10 bg-cream-50/80 p-6 sm:p-8">
              <h2 className="mb-6 font-serif text-2xl font-medium text-forest">
                Informations personnelles
              </h2>
              <ProfilForm
                utilisateur={{
                  prenom: utilisateur.prenom,
                  nom: utilisateur.nom,
                  email: utilisateur.email,
                  telephone: utilisateur.telephone,
                  langue: utilisateur.langue,
                  avatarUrl: utilisateur.avatarUrl,
                }}
              />
            </section>

            <section id="adresses" className="scroll-mt-28 rounded-3xl border border-forest/10 bg-cream-50/80 p-6 sm:p-8">
              <h2 className="mb-6 font-serif text-2xl font-medium text-forest">
                Adresses de livraison
              </h2>
              <AdressesManager adresses={adresses} />
            </section>

            <section id="securite" className="scroll-mt-28 rounded-3xl border border-forest/10 bg-cream-50/80 p-6 sm:p-8">
              <h2 className="mb-6 font-serif text-2xl font-medium text-forest">
                Sécurité & vérification
              </h2>
              <OtpVerifier
                telephone={utilisateur.telephone}
                telephoneVerifie={utilisateur.telephoneVerifie}
              />
              <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild variant="outline" className="rounded-full">
                  <Link href="/mot-de-passe-oublie">Changer mon mot de passe</Link>
                </Button>
              </div>
            </section>

            <section className="rounded-3xl border border-forest/10 bg-cream-50/80 p-6 sm:p-8">
              <h2 className="mb-4 flex items-center gap-2 font-serif text-2xl font-medium text-forest">
                <Package className="size-5 text-gold" /> Mes commandes
              </h2>
              <p className="text-sm text-muted">
                Le suivi de vos commandes sera disponible ici dès la mise en ligne de la boutique.
              </p>
              <div className="mt-5">
                <Button asChild variant="outline" className="rounded-full">
                  <Link href="/produits">Découvrir nos créations</Link>
                </Button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
