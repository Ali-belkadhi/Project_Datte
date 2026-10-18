import { redirect } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { auth } from "@/lib/auth";
import { getUtilisateurCourant } from "@/server/middleware/rbac";
import { NotificationService } from "@/server/services/NotificationService";
import {
  CentreNotifications,
  type NotificationVue,
} from "@/components/notifications/centre-notifications";
import { PushToggle } from "@/components/notifications/push-toggle";

export const metadata = { title: "Notifications" };

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion?callbackUrl=/notifications");

  const utilisateur = await getUtilisateurCourant();
  const { notifications } = await NotificationService.getNotifications(
    utilisateur._id.toString(),
    1,
    50
  );

  const vues: NotificationVue[] = notifications.map((n) => ({
    id: n._id.toString(),
    type: n.type,
    titre: n.titre,
    contenu: n.contenu,
    lien: n.lien,
    lue: n.lue,
    date: new Date(n.creeLe).toISOString(),
  }));

  return (
    <div className="min-h-screen pb-24">
      <PageHeader
        eyebrow="CENTRE DE NOTIFICATIONS"
        title="Notifications"
        description="Retrouvez ici toutes vos alertes DEGLA."
        crumbs={[{ label: "Notifications" }]}
      />

      <div className="container-lux mt-10 space-y-8">
        <section className="rounded-3xl border border-forest/10 bg-cream-50/80 p-6 sm:p-8">
          <h2 className="mb-4 font-serif text-xl font-medium text-forest">Notifications push</h2>
          <PushToggle vapidPublicKey={process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY} />
        </section>

        <section className="rounded-3xl border border-forest/10 bg-cream-50/80 p-6 sm:p-8">
          <CentreNotifications notifications={vues} />
        </section>
      </div>
    </div>
  );
}
