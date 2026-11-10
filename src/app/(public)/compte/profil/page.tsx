import { PageHeader } from "@/components/layout/page-header";
import { ProfileForm } from "@/features/comptes/profil";
import { pageMetadata } from "@/lib/seo";
import { getUtilisateurCourant } from "@/server/modules/comptes/services/utilisateurs";

export const metadata = pageMetadata("Profil et sécurité");

/** Profil (module A). */
export default async function ProfilPage() {
  const u = await getUtilisateurCourant();
  return (
    <>
      <PageHeader surtitre="Mon compte" titre="Profil et sécurité" />
      <ProfileForm utilisateur={u} />
    </>
  );
}
