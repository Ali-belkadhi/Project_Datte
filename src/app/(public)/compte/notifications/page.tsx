import { PageHeader } from "@/components/layout/page-header";
import { NotificationList } from "@/features/comptes/notifications";
import { pageMetadata } from "@/lib/seo";
import { listNotificationsGroupees } from "@/server/modules/comptes/services/notifications";

export const metadata = pageMetadata("Notifications");

/** Notifications (module A). */
export default async function NotificationsPage() {
  const groupes = await listNotificationsGroupees();
  return (
    <>
      <PageHeader surtitre="Mon compte" titre="Notifications" />
      <NotificationList groupes={groupes} />
    </>
  );
}
