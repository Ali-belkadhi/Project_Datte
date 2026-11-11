"use client";
import { useEffect, useState } from "react";
import { ArrowLeft, Paperclip, SendHorizontal } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { NoMessages } from "@/components/illustrations/empty-illustrations";
import { SHOP_TINTS } from "@/lib/constants";
import { formatDateCourte, formatHeure } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useAction } from "@/hooks/use-action";
import type { Conversation, Message } from "@/types/domain";
import { envoyerMessage } from "@/server/modules/comptes/actions";
import { actionMarquerLus } from "@/server/actions/messagerie";

function Pastille({ c }: { c: Conversation }) {
  const t = SHOP_TINTS[c.couleur];
  return <span className={cn("grid size-11 shrink-0 place-items-center rounded-full text-[13px] font-bold", t.bg, t.text)}>{c.interlocuteurInitiales}</span>;
}

/** Liste des conversations. */
export function ConversationList({ conversations, activeId, onSelect }: { conversations: Conversation[]; activeId?: string; onSelect: (id: string) => void }) {
  return (
    <ul className="divide-y">
      {conversations.map((c) => (
        <li key={c.id}>
          <button
            type="button"
            onClick={() => onSelect(c.id)}
            aria-current={c.id === activeId ? "true" : undefined}
            className={cn("flex w-full gap-3 px-4 py-3.5 text-start transition-colors hover:bg-accent/50", c.id === activeId && "bg-accent/60")}
          >
            <Pastille c={c} />
            <span className="min-w-0 flex-1">
              <span className="flex items-baseline justify-between gap-2">
                <span className="truncate font-semibold">{c.interlocuteur}</span>
                <span className="shrink-0 text-[12px] text-muted-foreground">{formatDateCourte(c.dernierMessageLe)}</span>
              </span>
              <span className="block truncate text-[13px] text-muted-foreground">{c.sujet}</span>
              <span className="mt-0.5 flex items-center gap-2">
                <span className="truncate text-[13px]">{c.dernierMessage}</span>
                {c.nonLus > 0 && <span className="grid h-5 min-w-5 shrink-0 place-items-center rounded-full bg-brand px-1.5 text-[11px] font-bold text-brand-foreground">{c.nonLus}</span>}
              </span>
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

export function MessageBubble({ m }: { m: Message }) {
  const moi = m.auteur === "moi";
  return (
    <li className={cn("flex flex-col", moi ? "items-end" : "items-start")}>
      <p className={cn("max-w-[82%] rounded-2xl px-4 py-2.5 text-[15px] leading-relaxed", moi ? "rounded-ee-md bg-primary text-primary-foreground" : "rounded-es-md border bg-card")}>{m.contenu}</p>
      <span className="mt-1 text-[11px] text-muted-foreground">{formatHeure(m.envoyeLe)}</span>
    </li>
  );
}

/** Fil de discussion + zone de saisie (Server Action envoyerMessage). */
export function ChatThread({ conversation, onRetour }: { conversation: Conversation; onRetour?: () => void }) {
  const [messages, setMessages] = useState(conversation.messages);
  const [texte, setTexte] = useState("");
  const { run } = useAction(envoyerMessage, { silencieux: true });
  useEffect(() => {
    if (conversation.nonLus > 0) void actionMarquerLus(conversation.id);
  }, [conversation.id, conversation.nonLus]);
  const envoyer = () => {
    const contenu = texte.trim();
    if (!contenu) return;
    setMessages((m) => [...m, { id: `local-${m.length}`, conversationId: conversation.id, auteur: "moi", contenu, envoyeLe: new Date().toISOString(), lu: true }]);
    setTexte("");
    void run({ conversationId: conversation.id, contenu });
  };
  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex items-center gap-3 border-b px-4 py-3">
        {onRetour && (
          <button type="button" onClick={onRetour} className="grid size-10 place-items-center rounded-full hover:bg-accent md:hidden" aria-label="Retour aux conversations">
            <ArrowLeft className="size-5 rtl:rotate-180" />
          </button>
        )}
        <Pastille c={conversation} />
        <div className="min-w-0">
          <p className="truncate font-semibold">{conversation.interlocuteur}</p>
          <p className="truncate text-[13px] text-muted-foreground">{conversation.produitNom ? `À propos de : ${conversation.produitNom}` : conversation.sujet}</p>
        </div>
      </header>
      <ul className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-sand/40 px-4 py-5">
        {messages.map((m) => (
          <MessageBubble key={m.id} m={m} />
        ))}
      </ul>
      <form
        className="flex items-center gap-2 border-t p-3"
        onSubmit={(e) => {
          e.preventDefault();
          envoyer();
        }}
      >
        <button type="button" className="grid size-11 place-items-center rounded-full text-muted-foreground hover:bg-accent" aria-label="Joindre une photo (bientôt)">
          <Paperclip className="size-5" />
        </button>
        <label htmlFor={`msg-${conversation.id}`} className="sr-only">
          Votre message
        </label>
        <input id={`msg-${conversation.id}`} value={texte} onChange={(e) => setTexte(e.target.value)} placeholder="Écrire un message…" className="h-11 min-w-0 flex-1 rounded-full border bg-card px-4 text-[15px] outline-none focus:border-ring" />
        <button type="submit" disabled={!texte.trim()} className="grid size-11 place-items-center rounded-full bg-brand text-brand-foreground disabled:opacity-40" aria-label="Envoyer">
          <SendHorizontal className="size-5 rtl:rotate-180" />
        </button>
      </form>
    </div>
  );
}

/** Messagerie : deux colonnes sur desktop ; sur mobile, navigation entre la liste et le fil. */
export function Messenger({ conversations, hauteur = "h-[calc(100dvh-14rem)]" }: { conversations: Conversation[]; hauteur?: string }) {
  const [activeId, setActiveId] = useState<string | undefined>(conversations[0]?.id);
  const [filOuvert, setFilOuvert] = useState(false);
  if (!conversations.length) {
    return <EmptyState illustration={<NoMessages />} titre="Aucun message" texte="Vos échanges avec les vendeurs apparaîtront ici." />;
  }
  const active = conversations.find((c) => c.id === activeId) ?? conversations[0];
  return (
    <div className={cn("grid min-h-[480px] overflow-hidden rounded-2xl border bg-card md:grid-cols-[320px_1fr]", hauteur)}>
      <div className={cn("min-h-0 overflow-y-auto border-e", filOuvert && "hidden md:block")}>
        <ConversationList
          conversations={conversations}
          activeId={active.id}
          onSelect={(id) => {
            setActiveId(id);
            setFilOuvert(true);
          }}
        />
      </div>
      <div className={cn("min-h-0", !filOuvert && "hidden md:block")}>
        <ChatThread key={active.id} conversation={active} onRetour={() => setFilOuvert(false)} />
      </div>
    </div>
  );
}
