import { PageHeader } from "@/components/layout/page-header";
import { Messenger } from "@/features/comptes/messagerie";
import { pageMetadata } from "@/lib/seo";
import { listConversations } from "@/server/modules/comptes/services/messagerie";

export const metadata = pageMetadata("Messages");

/** Messages vendeur (module A) — même composant que côté acheteur. */
export default async function VendeurMessagesPage() {
  const conversations = await listConversations();
  return (
    <div className="space-y-6">
      <PageHeader surtitre="Boutique" titre="Messages" description="Répondez vite : les acheteurs apprécient une réponse dans l'heure." />
      <Messenger conversations={conversations} />
    </div>
  );
}
