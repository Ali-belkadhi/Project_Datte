import { SellerShell } from "@/components/layout/seller-shell";
import { monSoldeCredits } from "@/server/modules/catalogue/services/credits";
import { getMaBoutique } from "@/server/modules/comptes/services/fournisseurs";
import { compterNonLues } from "@/server/modules/comptes/services/notifications";
import { getUtilisateurCourant } from "@/server/modules/comptes/services/utilisateurs";

/** Vue vendeur — layout SellerShell (session factice : Hédi Ben Amor, Palmeraie Ben Amor). */
export default async function VendeurLayout({ children }: { children: React.ReactNode }) {
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
