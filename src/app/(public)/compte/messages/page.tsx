import { PageHeader } from "@/components/layout/page-header";
import { Messenger } from "@/features/comptes/messagerie";
import { pageMetadata } from "@/lib/seo";
import { listConversations } from "@/server/modules/comptes/services/messagerie";

export const metadata = pageMetadata("Messages");

/** Messages (module A). */
export default async function MessagesPage() {
  const conversations = await listConversations();
  return (
    <>
      <PageHeader surtitre="Mon compte" titre="Messages" description="Échangez avec les vendeurs à propos d'un produit ou d'une commande." />
      <Messenger conversations={conversations} />
    </>
  );
}
