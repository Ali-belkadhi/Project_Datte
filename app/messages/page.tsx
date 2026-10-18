import Link from "next/link";
import { redirect } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { auth } from "@/lib/auth";
import { MessagerieService } from "@/server/services/MessagerieService";
import { Role } from "@/domain/enums";

export const metadata = { title: "Messages" };

export default async function MessagesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion?callbackUrl=/messages");

  const role = session.user.role as Role;
  const conversations = await MessagerieService.listerConversations(session.user.id, role);

  return (
    <div className="container-lux pt-28 pb-24">
      <div className="mb-8">
        <p className="eyebrow text-gold-dark">MESSAGERIE</p>
        <h1 className="flex items-center gap-2 font-serif text-3xl font-semibold text-forest">
          <MessageCircle className="size-7 text-gold" /> Mes conversations
        </h1>
      </div>

      <div className="rounded-3xl border border-forest/10 bg-cream-50/90 p-6 sm:p-8">
        {conversations.length === 0 ? (
          <p className="text-sm text-muted">
            Aucune conversation pour l&apos;instant.
            {role === Role.CLIENT &&
              " Contactez un vendeur depuis sa boutique pour démarrer un échange."}
          </p>
        ) : (
          <ul className="divide-y divide-forest/10">
            {conversations.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/messages/${c.id}`}
                  className="flex items-center justify-between gap-4 py-4 transition-colors hover:bg-beige/20"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-forest">{c.interlocuteurNom}</p>
                    <p className="truncate text-xs text-muted">
                      {c.dernierMessage ?? "Nouvelle conversation"}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="text-xs text-muted">
                      {new Date(c.dernierMessageLe).toLocaleDateString("fr-FR")}
                    </span>
                    {c.nonLus > 0 && (
                      <span className="flex size-5 items-center justify-center rounded-full bg-gold text-[0.65rem] font-bold text-white">
                        {c.nonLus}
                      </span>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
