import { AlertTriangle, Landmark } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { NotificationPrefs } from "@/features/comptes/admin/settings-panel";
import { RibSettings, ShopStateActions } from "@/features/comptes/boutique";
import { ProfileForm } from "@/features/comptes/profil";
import { pageMetadata } from "@/lib/seo";
import { getUtilisateurCourant } from "@/server/modules/comptes/services/utilisateurs";
import { getProfilComplet } from "@/server/services/ProfileService";
import { getRibMasque } from "@/server/services/FournisseurService";

export const metadata = pageMetadata("Paramètres");

/** Paramètres vendeur (module A) : compte, notifications, RIB masqué, langue, thème, zone de danger. */
export default async function VendeurParametresPage() {
  const u = await getUtilisateurCourant();
  const [extra, rib] = await Promise.all([getProfilComplet(), getRibMasque(u.id)]);
  return (
    <div className="space-y-6">
      <PageHeader surtitre="Boutique" titre="Paramètres" />
      <ProfileForm utilisateur={u} avatarUrl={extra.avatarUrl} motDePasseModifieLe={extra.motDePasseModifieLe} />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <NotificationPrefs initiales={extra.notificationsPrefs} />
          </CardContent>
        </Card>
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Landmark className="size-4" aria-hidden /> Coordonnées bancaires
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RibSettings last4={rib.last4} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Thème</CardTitle>
            </CardHeader>
            <CardContent>
              <ThemeToggle showLabels />
            </CardContent>
          </Card>
          <Card className="border-danger/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-danger">
                <AlertTriangle className="size-4" aria-hidden /> Zone de danger
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>Mettre la boutique en pause masque vos produits sans les supprimer. La fermeture suspend la vente immédiatement.</p>
              <ShopStateActions statut={rib.statutVerification} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
