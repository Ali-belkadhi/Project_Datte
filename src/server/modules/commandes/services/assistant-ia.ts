// MODULE C — Commandes (Karim Ouertatani) — IA-C : assistant d'achat conversationnel.
//
// Outils (mêmes fonctions dans les deux modes) : recherche de produits et fiche variété (contrat B),
// suivi de commande (uniquement les commandes du client connecté).
//  - Mode IA : Vercel AI SDK (generateText + tool), si AI_GATEWAY_API_KEY est défini.
//  - Mode local (sans clé) : compréhension simple du français + les mêmes outils, données réelles.
// L'ajout au panier n'est JAMAIS fait par l'assistant : il propose, le client confirme (bouton).
import "server-only";
import { generateText, isStepCount, tool } from "ai";
import { z } from "zod";
import type { EtapeSuivi, ProduitAvecVendeur, Variete } from "@/types/domain";
import type { VarieteSlug } from "@/types/model-source";
import { VARIETY_PRESETS, VARIETY_ORDER } from "@/components/three/presets";
import { infosVariete, rechercherProduits } from "@/server/contracts/catalogue";
import { getUtilisateurCourant } from "@/server/contracts/comptes";
import { db } from "../repositories/mongo";
import { suiviPourClient } from "./commandes";

export type MessageAssistant = { role: "user" | "assistant"; content: string };
export type ReponseAssistant = {
  texte: string;
  produits?: ProduitAvecVendeur[];
  suivi?: { numero: string; statut: string; vendeur: string; etapes: EtapeSuivi[] }[];
  varietes?: Pick<Variete, "slug" | "nom" | "description" | "origine">[];
  mode: "ia" | "local";
};

/* --------------------------------- Outils -------------------------------- */

const prix = (p: ProduitAvecVendeur["produit"]) => (p.typeProduit === "DATTE" ? p.prixParKg : p.prixUnitaire);

async function outilRecherche(f: { variete?: string; prixMaxDT?: number; bio?: boolean; type?: "DATTE" | "DERIVE"; texte?: string }) {
  const slug = f.variete ? varieteDepuisTexte(f.variete) : undefined;
  const r = await rechercherProduits({
    varietes: slug ? [slug] : undefined,
    prixMax: f.prixMaxDT ? Math.round(f.prixMaxDT * 1000) : undefined,
    bio: f.bio || undefined,
    type: f.type,
    q: f.texte || undefined,
    tri: "pertinence",
  });
  return r.slice(0, 4);
}

async function outilSuivi(numero?: string) {
  const u = await getUtilisateurCourant();
  let num = numero?.toUpperCase();
  if (!num) num = (await (await db.commandes()).findOne({ clientId: u.id }, { sort: { creeLe: -1 } }))?.numero;
  if (!num) return null;
  const c = await suiviPourClient(u.id, num); // jamais la commande d'un autre client
  if (!c) return null;
  return c.sousCommandes.map((s) => ({ numero: s.numero, statut: s.statut, vendeur: s.fournisseurNom, etapes: s.etapes }));
}

async function outilVariete(texte: string) {
  const slug = varieteDepuisTexte(texte);
  const v = slug ? await infosVariete(slug) : null;
  return v ? { slug: v.slug, nom: v.nom, description: v.description, origine: v.origine } : null;
}

const sansAccents = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

function varieteDepuisTexte(texte: string): VarieteSlug | undefined {
  const t = sansAccents(texte);
  return VARIETY_ORDER.find((slug) => t.includes(sansAccents(VARIETY_PRESETS[slug].nom)) || t.includes(slug.replace("-", " ")));
}

/* -------------------------------- Mode IA -------------------------------- */

async function repondreIA(messages: MessageAssistant[]): Promise<ReponseAssistant> {
  const collecte: Omit<ReponseAssistant, "texte" | "mode"> = {};
  const r = await generateText({
    model: process.env.AI_MODEL ?? "anthropic/claude-sonnet-5-5",
    instructions:
      "Tu es le conseiller de DEGLA, marketplace de dattes tunisiennes. Réponds en français (ou en arabe si le client écrit en arabe), en 2 à 4 phrases, chaleureux et précis. " +
      "Utilise les outils pour chercher des produits, expliquer une variété ou suivre une commande. N'invente jamais un produit ni un prix. " +
      "Tu ne peux pas ajouter au panier toi-même : dis au client d'utiliser le bouton « Ajouter » sous les produits proposés. Prix en dinars (DT).",
    messages,
    stopWhen: isStepCount(4),
    tools: {
      rechercherProduits: tool({
        description: "Cherche des produits du catalogue (dattes au kilo ou produits dérivés).",
        inputSchema: z.object({
          variete: z.string().optional().describe("Variété, ex. Deglet Nour, Medjool, Alig"),
          prixMaxDT: z.number().optional().describe("Prix maximum en dinars (au kg pour les dattes)"),
          bio: z.boolean().optional(),
          type: z.enum(["DATTE", "DERIVE"]).optional(),
          texte: z.string().optional().describe("Mots-clés libres, ex. confiture, sirop rob"),
        }),
        execute: async (f) => {
          const produits = await outilRecherche(f);
          collecte.produits = produits;
          return produits.map((p) => ({ id: p.produit.id, nom: p.produit.nom, prixDT: prix(p.produit) / 1000, vendeur: p.vendeur.nomBoutique }));
        },
      }),
      infosVariete: tool({
        description: "Fiche d'une variété de datte (origine, description).",
        inputSchema: z.object({ variete: z.string() }),
        execute: async ({ variete }) => {
          const v = await outilVariete(variete);
          if (v) collecte.varietes = [...(collecte.varietes ?? []), v];
          return v ?? { erreur: "Variété inconnue" };
        },
      }),
      suivreCommande: tool({
        description: "Suivi d'une commande du client connecté. Sans numéro : sa dernière commande.",
        inputSchema: z.object({ numero: z.string().optional().describe("ex. DGL-2026-001001") }),
        execute: async ({ numero }) => {
          const s = await outilSuivi(numero);
          if (s) collecte.suivi = s;
          return s ?? { erreur: "Aucune commande trouvée pour ce client." };
        },
      }),
    },
  });
  return { texte: r.text || "Voici ce que j'ai trouvé.", ...collecte, mode: "ia" };
}

/* ------------------------------- Mode local ------------------------------ */

async function repondreLocal(question: string): Promise<ReponseAssistant> {
  const t = sansAccents(question);
  const numero = question.match(/DGL-\d{4}-\d{3,6}(-[A-Z])?/i)?.[0]?.replace(/-[A-Z]$/i, "");

  if (numero || /commande|colis|livraison|suivi|ou en est|ou est/.test(t)) {
    const suivi = await outilSuivi(numero);
    if (!suivi) return { texte: numero ? `Je ne trouve pas la commande ${numero} dans votre compte.` : "Vous n'avez pas encore de commande.", mode: "local" };
    const etat = suivi.map((s) => `${s.vendeur} : ${s.etapes.filter((e) => e.etat === "terminee").at(-1)?.libelle ?? "en attente"}`).join(" · ");
    return { texte: `Voici le suivi de votre commande — ${etat}.`, suivi, mode: "local" };
  }

  const varietes = VARIETY_ORDER.filter((slug) => t.includes(sansAccents(VARIETY_PRESETS[slug].nom)));
  if (varietes.length >= 2 && /diff|compar|ou bien|vs|plutot|entre/.test(t)) {
    const fiches = (await Promise.all(varietes.slice(0, 2).map((s) => outilVariete(VARIETY_PRESETS[s].nom)))).filter((v) => v !== null);
    return { texte: `Comparaison : ${fiches.map((v) => `${v.nom} (${v.origine})`).join(" et ")}. Voici leurs fiches.`, varietes: fiches, mode: "local" };
  }

  const prixMax = t.match(/(moins de|max(imum)?|sous|<)\s*(\d+)/)?.[3];
  const derives = ["confiture", "jus", "pate", "miel", "rob", "sirop", "cafe"].find((m) => t.includes(m));
  // aucune intention reconnue : on explique ce que l'assistant sait faire plutôt que de lister au hasard
  if (!varietes.length && !prixMax && !derives && !/\bbio\b/.test(t) && !/datte|produit|achet|cherch|\bkg\b|kilo/.test(t)) return aide();
  const produits = await outilRecherche({
    variete: varietes[0] ? VARIETY_PRESETS[varietes[0]].nom : undefined,
    prixMaxDT: prixMax ? Number(prixMax) : undefined,
    bio: /\bbio\b/.test(t) || undefined,
    type: derives ? "DERIVE" : undefined,
    texte: derives,
  });
  if (varietes.length === 1 && /c.est quoi|qu.est.ce|parle|explique|origine/.test(t)) {
    const v = await outilVariete(VARIETY_PRESETS[varietes[0]].nom);
    if (v) return { texte: `${v.nom} — ${v.description}`, varietes: [v], produits, mode: "local" };
  }
  if (produits.length) {
    const criteres = [varietes[0] && VARIETY_PRESETS[varietes[0]].nom, derives, prixMax && `moins de ${prixMax} DT`, /\bbio\b/.test(t) && "bio"].filter(Boolean).join(", ");
    return { texte: `J'ai trouvé ${produits.length} produit${produits.length > 1 ? "s" : ""}${criteres ? ` (${criteres})` : ""}. Ajoutez celui qui vous plaît au panier :`, produits, mode: "local" };
  }
  return aide();
}

function aide(): ReponseAssistant {
  return {
    texte: "Je peux chercher des dattes (« 2 kg de Deglet Nour bio à moins de 30 DT »), comparer deux variétés (« différence entre Alig et Kenta ») ou suivre votre commande (« où est ma commande ? »).",
    mode: "local",
  };
}

/* -------------------------------- Entrée --------------------------------- */

export const iaDisponible = () => Boolean(process.env.AI_GATEWAY_API_KEY);

export async function repondreAssistant(messages: MessageAssistant[]): Promise<ReponseAssistant> {
  const derniere = messages.findLast((m) => m.role === "user")?.content ?? "";
  if (iaDisponible()) {
    try {
      return await repondreIA(messages.slice(-10));
    } catch (e) {
      console.error("[assistant IA] repli sur le mode local", e);
    }
  }
  return repondreLocal(derniere);
}
