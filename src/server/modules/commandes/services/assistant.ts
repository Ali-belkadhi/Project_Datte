// MODULE C — Commandes (Karim Ouertatani) — IA-C : assistant d'achat (scripté)
import "server-only";
import type { ResultatOutil, ScenarioAssistant } from "@/types/domain";
import { getProduitsPourPanier, infosVariete } from "@/server/contracts/catalogue";
import { assistantRepository, commandeRepository } from "../repositories";

/**
 * Résout les scénarios scriptés (références → objets d'interface) via les contrats.
 * Le client (useScriptedAssistant) choisit le scénario selon la question.
 * TODO(module C) : remplacer par app/api/ia/assistant (streamText + tools réels).
 */
export async function getScenariosAssistant(): Promise<{
  scenarios: ScenarioAssistant[];
  suggestions: string[];
  reponseGenerique: string;
}> {
  const [sources, suggestions, reponseGenerique] = await Promise.all([
    assistantRepository.scenarios(),
    assistantRepository.suggestions(),
    assistantRepository.reponseGenerique(),
  ]);

  const scenarios = await Promise.all(
    sources.map(async (s): Promise<ScenarioAssistant> => {
      let resultat: ResultatOutil | undefined;
      const r = s.resultat;
      if (r?.outil === "recherche") {
        resultat = { outil: "recherche", produits: await getProduitsPourPanier(r.produitIds) };
      } else if (r?.outil === "varietes") {
        const [a, b] = await Promise.all(r.varietes.map(infosVariete));
        if (a && b) resultat = { outil: "varietes", comparaison: [a, b] };
      } else if (r?.outil === "suivi") {
        const c = await commandeRepository.parNumero(r.commandeNumero);
        const sc = c?.sousCommandes[0];
        if (sc) resultat = { outil: "suivi", commandeNumero: r.commandeNumero, etapes: sc.etapes, vendeur: sc.fournisseurNom };
      } else if (r?.outil === "ajout-panier") {
        const [item] = await getProduitsPourPanier([r.produitId]);
        if (item && item.produit.typeProduit === "DATTE") {
          resultat = {
            outil: "ajout-panier",
            produit: item,
            quantiteGrammes: r.quantiteGrammes,
            total: Math.round((item.produit.prixParKg * r.quantiteGrammes) / 1000),
          };
        }
      }
      return { ...s, resultat };
    }),
  );
  return { scenarios, suggestions, reponseGenerique };
}
