// MODULE C — IA-C : outils de l'assistant d'achat (Karim Ouertatani)
import "server-only";
import { z } from "zod";
import { VARIETE_SLUGS } from "@/lib/validation/catalogue";

/**
 * Définitions des outils exposés au modèle (Vercel AI SDK : `tool({ description, inputSchema, execute })`).
 * Les `execute` passeront par les contrats (rechercherProduits, infosVariete…) — jamais d'accès direct.
 * L'ajout au panier exige TOUJOURS une confirmation explicite de l'utilisateur (carte de confirmation).
 */
export const OUTILS_ASSISTANT = {
  rechercherProduits: {
    description: "Recherche des dattes ou produits dérivés selon des critères (variété, prix max au kg, bio…).",
    inputSchema: z.object({
      q: z.string().optional(),
      varietes: z.array(z.enum(VARIETE_SLUGS)).optional(),
      prixMaxParKg: z.number().int().optional().describe("en millimes"),
      bio: z.boolean().optional(),
    }),
  },
  comparerVarietes: {
    description: "Compare deux variétés de dattes (origine, texture, saveur, saison).",
    inputSchema: z.object({ a: z.enum(VARIETE_SLUGS), b: z.enum(VARIETE_SLUGS) }),
  },
  suivreCommande: {
    description: "Donne l'état de suivi d'une commande de l'utilisateur.",
    inputSchema: z.object({ numero: z.string().optional() }),
  },
  proposerAjoutPanier: {
    description: "Propose d'ajouter un produit au panier. N'ajoute rien sans confirmation.",
    inputSchema: z.object({ produitId: z.string(), quantiteGrammes: z.number().int().optional(), quantiteUnites: z.number().int().optional() }),
  },
} as const;

export const PROMPT_SYSTEME_ASSISTANT = `Tu es l'assistant d'achat de DEGLA, marketplace de dattes tunisiennes.
Tu vouvoies l'utilisateur, avec un ton chaleureux et précis. Tu utilises les outils pour chercher,
comparer et suivre ; tu ne confirmes jamais un achat à la place de l'utilisateur.
Prix : dattes au kilo, dérivés à l'unité, en DT avec 3 décimales.`;
