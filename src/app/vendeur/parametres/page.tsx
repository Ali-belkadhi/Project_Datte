import { AlertTriangle, Landmark } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { NotificationPrefs } from "@/features/comptes/admin/settings-panel";
import { ProfileForm } from "@/features/comptes/profil";
import { pageMetadata } from "@/lib/seo";
import { getUtilisateurCourant } from "@/server/modules/comptes/services/utilisateurs";

export const metadata = pageMetadata("Paramètres");

/** Paramètres vendeur (module A) : compte, notifications, RIB masqué, langue, thème, zone de danger. */
export default async function VendeurParametresPage() {
  const u = await getUtilisateurCourant();
  return (
    <div className="space-y-6">
      <PageHeader surtitre="Boutique" titre="Paramètres" />
      <ProfileForm utilisateur={u} />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <NotificationPrefs />
          </CardContent>
        </Card>
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Landmark className="size-4" aria-hidden /> Coordonnées bancaires
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between gap-3">
              <span className="font-mono tracking-widest">•••• •••• •••• 4821</span>
              <Button variant="outline" size="sm">Modifier</Button>
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
              <p>Mettre la boutique en pause masque vos produits sans les supprimer. La fermeture est définitive.</p>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm">Mettre en pause</Button>
                <Button variant="destructive" size="sm">Fermer la boutique</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
