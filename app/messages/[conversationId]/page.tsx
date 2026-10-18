import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/lib/auth";
import { MessagerieService } from "@/server/services/MessagerieService";
import { FilDiscussion } from "@/components/messagerie/fil-discussion";
import type { MessageVue } from "@/server/actions/messagerie.actions";
import { Role } from "@/domain/enums";

export const metadata = { title: "Conversation" };

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect(`/connexion?callbackUrl=/messages/${conversationId}`);

  const role = session.user.role as Role;
  const utilisateurId = session.user.id;

  const conversation = await MessagerieService.getConversationAcces(
    conversationId,
    utilisateurId,
    role
  );
  if (!conversation) notFound();

  const [nom, messages] = await Promise.all([
    MessagerieService.getInterlocuteurNom(conversation, role),
    MessagerieService.getMessages(conversationId, 1, 100),
  ]);

  await MessagerieService.marquerMessagesLus(conversationId, utilisateurId);

  const messagesVue: MessageVue[] = messages
    .map((m) => ({
      id: m._id.toString(),
      contenu: m.contenu,
      expediteurId: m.expediteurId.toString(),
      creeLe: new Date(m.creeLe).toISOString(),
      estMoi: m.expediteurId.toString() === utilisateurId,
    }))
    .reverse();

  return (
    <div className="container-lux pt-28 pb-24">
      <Link
        href="/messages"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-forest"
      >
        <ArrowLeft className="size-4" /> Toutes les conversations
      </Link>

      <div className="mb-4">
        <p className="eyebrow text-gold-dark">CONVERSATION</p>
        <h1 className="font-serif text-2xl font-semibold text-forest">{nom}</h1>
      </div>

      <FilDiscussion conversationId={conversationId} messagesInitiaux={messagesVue} />
    </div>
  );
}
