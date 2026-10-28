import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { SellerShell } from "@/components/layout/seller-shell";
import { monSoldeCredits } from "@/server/modules/catalogue/services/credits";
import { getMaBoutique } from "@/server/modules/comptes/services/fournisseurs";
import { compterNonLues } from "@/server/modules/comptes/services/notifications";
import { getUtilisateurCourant } from "@/server/modules/comptes/services/utilisateurs";

/** Vue vendeur — layout SellerShell. */
export default async function VendeurLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion");
  const [u, boutique, solde, nonLues] = await Promise.all([getUtilisateurCourant(), getMaBoutique(), monSoldeCredits(), compterNonLues()]);
  return (
    <SellerShell
      credits={solde.solde}
      notificationsNonLues={nonLues}
      vendeur={{ nom: `${u.prenom} ${u.nom}`, boutique: boutique.nomBoutique, initiales: u.initiales, slug: boutique.slug }}
    >
      {children}
    </SellerShell>
  );
}
