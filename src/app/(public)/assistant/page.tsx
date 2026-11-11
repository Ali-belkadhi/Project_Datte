import { AssistantChat } from "@/features/commandes/assistant";
import { pageMetadata } from "@/lib/seo";
import { getUtilisateurCourant } from "@/server/contracts/comptes";

export const metadata = pageMetadata("Assistant", "L'assistant d'achat DEGLA : conseils, recherche et suivi de commande.");

/** Assistant d'achat IA-C (module C) — streamText + outils, useChat côté client. */
export default async function AssistantPage() {
  const u = await getUtilisateurCourant().catch(() => null);
  return (
    <div className="mx-auto flex h-[calc(100dvh-4rem-4rem-env(safe-area-inset-bottom))] max-w-3xl flex-col md:px-6 lg:h-[calc(100dvh-72px)] lg:py-6">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background md:rounded-3xl md:border md:bg-card">
        <AssistantChat prenom={u?.prenom} />
      </div>
    </div>
  );
}
