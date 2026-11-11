import { AssistantChat } from "@/features/commandes/assistant";
import { pageMetadata } from "@/lib/seo";
import { getScenariosAssistant } from "@/server/modules/commandes/services/assistant";
import { getUtilisateurCourant } from "@/server/modules/comptes/services/utilisateurs";

export const metadata = pageMetadata("Assistant", "L'assistant d'achat DEGLA : conseils, recherche et suivi de commande.");

/** Assistant d'achat IA-C (module C) — scénarios scriptés, aucun appel à un modèle. */
export default async function AssistantPage() {
  const [data, u] = await Promise.all([getScenariosAssistant(), getUtilisateurCourant()]);
  return (
    <div className="mx-auto flex h-[calc(100dvh-4rem-4rem-env(safe-area-inset-bottom))] max-w-3xl flex-col md:px-6 lg:h-[calc(100dvh-72px)] lg:py-6">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background md:rounded-3xl md:border md:bg-card">
        <AssistantChat data={data} prenom={u.prenom} />
      </div>
    </div>
  );
}
