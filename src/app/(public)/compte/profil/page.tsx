import { PageHeader } from "@/components/layout/page-header";
import { ProfileForm } from "@/features/comptes/profil";
import { pageMetadata } from "@/lib/seo";
import { getUtilisateurCourant } from "@/server/modules/comptes/services/utilisateurs";
import { getProfilComplet } from "@/server/services/ProfileService";

export const metadata = pageMetadata("Profil et sécurité");

/** Profil (module A) : données réelles de l'utilisateur connecté. */
export default async function ProfilPage() {
  const [u, extra] = await Promise.all([getUtilisateurCourant(), getProfilComplet()]);
  return (
    <>
      <PageHeader surtitre="Mon compte" titre="Profil et sécurité" />
      <ProfileForm utilisateur={u} avatarUrl={extra.avatarUrl} motDePasseModifieLe={extra.motDePasseModifieLe} />
    </>
  );
}
