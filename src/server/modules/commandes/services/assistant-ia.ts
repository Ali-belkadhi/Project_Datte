// MODULE C — Commandes (Karim Ouertatani) — IA-C : assistant d'achat conversationnel (§12.4).
//
// Vercel AI SDK : streamText + tool() côté serveur, useChat + addToolOutput côté client.
// Les outils appellent les services / contrats existants, jamais la base directement :
//  - rechercherProduits, infosVariete → contrat du module B ;
//  - suivreCommande → CommandeService, limité aux commandes du client connecté ;
//  - ajouterAuPanier → outil SANS execute : l'interface demande confirmation au client,
//    l'ajout passe par la Server Action (Zod + RBAC), puis le résultat revient via addToolOutput.
// Sans clé IA (ou en secours), un mode local produit le MÊME flux (mêmes outils, mêmes cartes).
import "server-only";
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  isStepCount,
  streamText,
  tool,
  toUIMessageStream,
  type InferUITools,
  type UIDataTypes,
  type UIMessage,
  type UIMessageStreamWriter,
} from "ai";
import { z } from "zod";
import type { EtapeSuivi, ProduitAvecVendeur } from "@/types/domain";
import type { VarieteSlug } from "@/types/model-source";
import { VARIETY_ORDER, VARIETY_PRESETS } from "@/components/three/presets";
import { iaDisponible, modelesIA, type ModeleConfigure } from "@/lib/ai";
import { infosVariete as contratVariete, rechercherProduits as contratRecherche } from "@/server/contracts/catalogue";
import { journaliser as journaliserAudit } from "@/server/contracts/comptes";
import { db } from "../repositories/mongo";
import { suiviPourClient } from "./commandes";

export { iaDisponible };

/* -------------------------------- Types UI ------------------------------- */

export type ColisSuivi = { numero: string; statut: string; vendeur: string; etapes: EtapeSuivi[] };
export type FicheVariete = { slug: string; nom: string; description: string; origine: string };
type Erreur = { erreur: string };

/* --------------------------- Fonctions des outils ------------------------ */

const sansAccents = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export function varieteDepuisTexte(texte: string): VarieteSlug | undefined {
  const t = sansAccents(texte);
  return VARIETY_ORDER.find((slug) => t.includes(sansAccents(VARIETY_PRESETS[slug].nom)) || t.includes(slug.replace("-", " ")) || t.includes(slug));
}

const prixProduit = (p: ProduitAvecVendeur["produit"]) => (p.typeProduit === "DATTE" ? p.prixParKg : p.prixUnitaire);

type FiltresOutil = { variete?: string; prixMaxDT?: number; bio?: boolean; type?: "DATTE" | "DERIVE"; texte?: string };

async function rechercher(f: FiltresOutil): Promise<ProduitAvecVendeur[]> {
  const slug = f.variete ? varieteDepuisTexte(f.variete) : undefined;
  const r = await contratRecherche({
    varietes: slug ? [slug] : undefined,
    prixMax: f.prixMaxDT ? Math.round(f.prixMaxDT * 1000) : undefined,
    bio: f.bio || undefined,
    type: f.type,
    q: f.texte || undefined,
    tri: "pertinence",
  });
  return r.slice(0, 4);
}

async function ficheVariete(texte: string): Promise<FicheVariete | Erreur> {
  const slug = varieteDepuisTexte(texte);
  const v = slug ? await contratVariete(slug) : null;
  return v ? { slug: v.slug, nom: v.nom, description: v.description, origine: v.origine } : { erreur: `Variété inconnue : ${texte}` };
}

/**
 * Suivi d'une commande du client connecté. Sans numéro : sa dernière commande.
 * `suiviPourClient` filtre sur clientId : la commande d'un autre client est introuvable.
 */
async function suivre(clientId: string | null, numero?: string): Promise<{ numero: string; colis: ColisSuivi[] } | Erreur> {
  if (!clientId) return { erreur: "Connectez-vous pour suivre vos commandes." };
  let num = numero?.trim().toUpperCase().replace(/-[A-Z]$/, "");
  if (!num) num = (await (await db.commandes()).findOne({ clientId }, { sort: { creeLe: -1 } }))?.numero;
  if (!num) return { erreur: "Vous n'avez pas encore de commande." };
  const c = await suiviPourClient(clientId, num);
  if (!c) return { erreur: `Aucune commande ${num} dans votre compte.` };
  return { numero: c.numero, colis: c.sousCommandes.map((s) => ({ numero: s.numero, statut: s.statut, vendeur: s.fournisseurNom, etapes: s.etapes })) };
}

/* --------------------------------- Outils -------------------------------- */

const schemaAjout = z.object({
  produitId: z.string().describe("id exact d'un produit renvoyé par rechercherProduits"),
  nomProduit: z.string().describe("nom du produit, affiché dans la carte de confirmation"),
  quantiteGrammes: z.number().int().optional().describe("pour une datte : poids en grammes, multiple de 500 (2 kg = 2000)"),
  quantiteUnites: z.number().int().optional().describe("pour un produit dérivé : nombre d'unités"),
});

export function creerOutilsAssistant(clientId: string | null) {
  return {
    rechercherProduits: tool({
      description: "Cherche des produits du catalogue DEGLA (dattes au kilo ou produits dérivés à l'unité).",
      inputSchema: z.object({
        variete: z.string().optional().describe("Variété, ex. Deglet Nour, Medjool, Alig, Kenta"),
        prixMaxDT: z.number().optional().describe("Prix maximum en dinars (au kg pour les dattes, à l'unité pour les dérivés)"),
        bio: z.boolean().optional(),
        type: z.enum(["DATTE", "DERIVE"]).optional(),
        texte: z.string().optional().describe("Mots-clés libres, ex. confiture, sirop rob, jus"),
      }),
      execute: rechercher,
      // le modèle reçoit un résumé ; l'interface reçoit les produits complets (cartes)
      toModelOutput: ({ output }) => ({
        type: "json",
        value: output.map(({ produit: p, vendeur }) => ({
          id: p.id,
          nom: p.nom,
          type: p.typeProduit,
          prixDT: prixProduit(p) / 1000,
          unite: p.typeProduit === "DATTE" ? "kg" : "unité",
          bio: p.bio,
          vendeur: vendeur.nomBoutique,
        })),
      }),
    }),
    infosVariete: tool({
      description: "Fiche d'une variété de datte (origine, goût, description). Appeler une fois par variété pour comparer.",
      inputSchema: z.object({ variete: z.string() }),
      execute: ({ variete }) => ficheVariete(variete),
    }),
    suivreCommande: tool({
      description: "Suivi d'une commande du client connecté. Sans numéro : sa dernière commande.",
      inputSchema: z.object({ numero: z.string().optional().describe("ex. DGL-2026-001001") }),
      execute: ({ numero }) => suivre(clientId, numero),
    }),
    // pas d'execute : le client confirme dans l'interface, qui renvoie le résultat (addToolOutput)
    ajouterAuPanier: tool({
      description:
        "Propose d'ajouter un produit au panier. N'ajoute RIEN sans confirmation : l'interface affiche un bouton au client. " +
        "Utiliser seulement un produitId renvoyé par rechercherProduits.",
      inputSchema: schemaAjout,
      outputSchema: z.object({ confirme: z.boolean(), message: z.string() }),
    }),
  };
}

export type OutilsAssistant = InferUITools<ReturnType<typeof creerOutilsAssistant>>;
export type MessageAssistant = UIMessage<never, UIDataTypes, OutilsAssistant>;

const INSTRUCTIONS =
  "Tu es le conseiller de DEGLA, marketplace de dattes tunisiennes. Réponds en français, ou en arabe si le client écrit en arabe, " +
  "en 2 à 4 phrases, avec un ton chaleureux et précis, en vouvoyant. " +
  "Utilise les outils pour chercher des produits, expliquer ou comparer des variétés et suivre une commande. " +
  "N'invente jamais un produit, un prix ou un statut : appuie-toi uniquement sur les résultats des outils. " +
  "Les dattes se vendent au kilo par pas de 0,5 kg, les dérivés à l'unité. Prix en dinars (DT). " +
  "Quand le client demande d'ajouter un produit (ou une quantité précise), appelle ajouterAuPanier avec un produitId issu de rechercherProduits : " +
  "le client confirmera lui-même. Si la confirmation est refusée, n'insiste pas. " +
  "Tu ne vois que les commandes du client connecté ; ne divulgue jamais d'autre commande.";

/* -------------------------------- Mode IA -------------------------------- */

/** Au-delà de ce silence du modèle, on répond avec le mode local. */
const SILENCE_MAX_MS = 10_000;

type Tentative = "ok" | "echec" | "echec-partiel";

/**
 * Une tentative avec un modèle : relaie son flux dans `writer`.
 * Échec (quota, panne, silence > SILENCE_MAX_MS) : « echec » si rien n'a encore été écrit
 * (on peut essayer le modèle suivant), « echec-partiel » sinon.
 */
async function essayerModele(
  writer: UIMessageStreamWriter<MessageAssistant>,
  { modele, nom, fournisseur }: ModeleConfigure,
  messages: MessageAssistant[],
  clientId: string | null,
): Promise<Tentative> {
  const debut = Date.now();
  const outils = creerOutilsAssistant(clientId);
  const arret = new AbortController();
  const result = streamText({
    model: modele,
    instructions: INSTRUCTIONS,
    messages: await convertToModelMessages(messages),
    tools: outils,
    stopWhen: isStepCount(5),
    abortSignal: arret.signal,
    maxRetries: 0, // on échoue vite : le repli passe au modèle suivant
    maxOutputTokens: 1024, // réponses courtes (2 à 4 phrases) ; évite les refus « crédits insuffisants »
    onEnd: ({ totalUsage, steps }) =>
      journaliser(clientId, {
        mode: "ia",
        fournisseur,
        modele: nom,
        tokensEntree: totalUsage.inputTokens ?? null,
        tokensSortie: totalUsage.outputTokens ?? null,
        dureeMs: Date.now() - debut,
        outils: steps.flatMap((s) => s.toolCalls.map((c) => c.toolName)),
      }),
  });
  let cause: unknown = null;
  const lecteur = toUIMessageStream<typeof outils, MessageAssistant>({
    stream: result.stream,
    sendStart: false,
    sendFinish: false,
    onError: (e) => {
      cause = e;
      return "erreur";
    },
  }).getReader();

  let contenu = false;
  for (;;) {
    let minuteur: ReturnType<typeof setTimeout> | undefined;
    const silence = new Promise<"silence">((r) => (minuteur = setTimeout(() => r("silence"), SILENCE_MAX_MS)));
    const lu = await Promise.race([lecteur.read(), silence]);
    clearTimeout(minuteur);
    const echec = lu === "silence" ? "aucune réponse du modèle" : !lu.done && (lu.value.type === "error" || lu.value.type === "abort") ? (cause ?? lu.value.type) : null;
    if (echec) {
      console.warn(`[assistant IA] échec ${fournisseur}/${nom} :`, echec instanceof Error ? echec.message.split("\n")[0] : echec);
      arret.abort();
      void lecteur.cancel().catch(() => {});
      return contenu ? "echec-partiel" : "echec";
    }
    if (lu === "silence" || lu.done) return "ok";
    // les étapes ne sont écrites qu'avec du contenu : un échec immédiat ne laisse aucune trace côté client
    if (!contenu && lu.value.type === "start-step") continue;
    if (lu.value.type === "text-delta" || lu.value.type.startsWith("tool-")) {
      if (!contenu) writer.write({ type: "start-step" });
      contenu = true;
    }
    writer.write(lu.value);
  }
}

/** Mode IA : chaque modèle configuré est essayé dans l'ordre, puis le mode local en dernier recours. */
function fluxIA(messages: MessageAssistant[], clientId: string | null) {
  return createUIMessageStream<MessageAssistant>({
    execute: async ({ writer }) => {
      for (const m of modelesIA()) {
        const r = await essayerModele(writer, m, messages, clientId);
        if (r === "ok") return;
        if (r === "echec-partiel") {
          writer.write({ type: "text-start", id: "repli" });
          writer.write({ type: "text-delta", id: "repli", delta: "\n\nL'assistant IA est très sollicité, je n'ai pas pu terminer. Réessayez dans un instant." });
          writer.write({ type: "text-end", id: "repli" });
          return;
        }
      }
      console.warn("[assistant IA] repli sur le mode local");
      await ecrireLocal(writer, messages, clientId);
    },
    onError: (e) => {
      console.error("[assistant IA]", e);
      return "L'assistant est momentanément indisponible. Réessayez dans un instant.";
    },
  });
}

/* ------------------------------- Mode local ------------------------------ */

type AppelLocal = { [K in keyof OutilsAssistant]: { outil: K; input: OutilsAssistant[K]["input"]; output?: OutilsAssistant[K]["output"] } }[keyof OutilsAssistant];

/** Compréhension simple du français, mêmes outils que le modèle. Exportée pour les tests. */
export async function planLocal(question: string, clientId: string | null): Promise<{ texte: string; appels: AppelLocal[] }> {
  const t = sansAccents(question);
  const numero = question.match(/DGL-\d{4}-\d{3,6}(-[A-Z])?/i)?.[0];

  if (numero || /commande|colis|livraison|suivi|ou en est|ou est/.test(t)) {
    const output = await suivre(clientId, numero);
    const texte =
      "erreur" in output
        ? output.erreur
        : `Voici le suivi de votre commande ${output.numero} — ${output.colis.map((s) => `${s.vendeur} : ${s.etapes.filter((e) => e.etat === "terminee").at(-1)?.libelle ?? "en attente"}`).join(" · ")}.`;
    return { texte, appels: [{ outil: "suivreCommande", input: { numero }, output }] };
  }

  const varietes = VARIETY_ORDER.filter((slug) => t.includes(sansAccents(VARIETY_PRESETS[slug].nom)));
  if (varietes.length >= 2 && /diff|compar|ou bien|vs|plutot|entre/.test(t)) {
    const appels: AppelLocal[] = [];
    for (const slug of varietes.slice(0, 2)) {
      const nom = VARIETY_PRESETS[slug].nom;
      appels.push({ outil: "infosVariete", input: { variete: nom }, output: await ficheVariete(nom) });
    }
    const noms = appels.flatMap((a) => (a.outil === "infosVariete" && a.output && !("erreur" in a.output) ? [`${a.output.nom} (${a.output.origine})`] : []));
    return { texte: `Comparaison : ${noms.join(" et ")}. Voici leurs fiches.`, appels };
  }

  const prixMax = t.match(/(moins de|max(imum)?|sous|<)\s*(\d+)/)?.[3];
  const derive = ["confiture", "jus", "pate", "miel", "rob", "sirop", "cafe"].find((m) => t.includes(m));
  const bio = /\bbio\b/.test(t);
  if (!varietes.length && !prixMax && !derive && !bio && !/datte|produit|achet|cherch|\bkg\b|kilo|ajout/.test(t)) return { texte: AIDE, appels: [] };

  const nomVariete = varietes[0] ? VARIETY_PRESETS[varietes[0]].nom : undefined;
  if (nomVariete && /c.est quoi|qu.est.ce|parle|explique|origine/.test(t)) {
    const fiche = await ficheVariete(nomVariete);
    return { texte: "erreur" in fiche ? fiche.erreur : `${fiche.nom} — ${fiche.description}`, appels: [{ outil: "infosVariete", input: { variete: nomVariete }, output: fiche }] };
  }

  const input: FiltresOutil = { variete: nomVariete, prixMaxDT: prixMax ? Number(prixMax) : undefined, bio: bio || undefined, type: derive ? "DERIVE" : undefined, texte: derive };
  const produits = await rechercher(input);
  const appels: AppelLocal[] = [{ outil: "rechercherProduits", input, output: produits }];
  if (!produits.length) return { texte: "Je n'ai trouvé aucun produit correspondant. Essayez d'élargir vos critères.", appels };

  // « ajoute 2 kg … au panier » : proposition d'ajout du premier résultat, à confirmer par le client
  const kg = t.match(/(\d+(?:[.,]5)?)\s*(kg|kilo)/)?.[1];
  const unites = t.match(/(\d+)\s*(pot|bouteille|boite|unite|flacon)/)?.[1];
  if (/ajout|mets|met |prends|commande/.test(t) || kg || unites) {
    const p = produits[0].produit;
    appels.push({
      outil: "ajouterAuPanier",
      input:
        p.typeProduit === "DATTE"
          ? { produitId: p.id, nomProduit: p.nom, quantiteGrammes: Math.max(500, Math.round((Number((kg ?? "1").replace(",", ".")) * 1000) / 500) * 500) }
          : { produitId: p.id, nomProduit: p.nom, quantiteUnites: Math.max(1, Number(unites ?? 1)) },
    });
    return { texte: `J'ai trouvé ${produits.length} produit${produits.length > 1 ? "s" : ""}. Je vous propose d'ajouter « ${p.nom} » à votre panier : confirmez ci-dessous.`, appels };
  }
  const criteres = [nomVariete, derive, prixMax && `moins de ${prixMax} DT`, bio && "bio"].filter(Boolean).join(", ");
  return { texte: `J'ai trouvé ${produits.length} produit${produits.length > 1 ? "s" : ""}${criteres ? ` (${criteres})` : ""}. Ajoutez celui qui vous plaît au panier :`, appels };
}

const AIDE =
  "Je peux chercher des dattes (« 2 kg de Deglet Nour bio à moins de 30 DT »), comparer deux variétés (« différence entre Alig et Kenta ») ou suivre votre commande (« où est ma commande ? »).";

/** Écrit la réponse locale (mêmes parts d'outils que le modèle) dans un flux UI. */
async function ecrireLocal(writer: UIMessageStreamWriter<MessageAssistant>, messages: MessageAssistant[], clientId: string | null) {
  const debut = Date.now();
  const derniere = messages.findLast((m) => m.role === "user");
  const question = derniere?.parts.flatMap((p) => (p.type === "text" ? [p.text] : [])).join(" ") ?? "";
  // retour d'une confirmation d'ajout (dernier message = assistant) : simple accusé
  const apresConfirmation = messages.at(-1)?.role === "assistant";
  const { texte, appels } = apresConfirmation ? { texte: texteApresConfirmation(messages.at(-1)!), appels: [] } : await planLocal(question, clientId);
  writer.write({ type: "start-step" });
  appels.forEach((a, i) => {
    const toolCallId = `local-${Date.now()}-${i}`;
    writer.write({ type: "tool-input-available", toolCallId, toolName: a.outil, input: a.input });
    if (a.output !== undefined) writer.write({ type: "tool-output-available", toolCallId, output: a.output });
  });
  writer.write({ type: "text-start", id: "local" });
  writer.write({ type: "text-delta", id: "local", delta: texte });
  writer.write({ type: "text-end", id: "local" });
  writer.write({ type: "finish-step" });
  await journaliser(clientId, { mode: "local", dureeMs: Date.now() - debut, outils: appels.map((a) => a.outil) });
}

function fluxLocal(messages: MessageAssistant[], clientId: string | null) {
  return createUIMessageStream<MessageAssistant>({ execute: ({ writer }) => ecrireLocal(writer, messages, clientId) });
}

function texteApresConfirmation(m: MessageAssistant) {
  const ajout = m.parts.findLast((p) => p.type === "tool-ajouterAuPanier");
  if (ajout?.type === "tool-ajouterAuPanier" && ajout.state === "output-available") {
    return ajout.output.confirme ? "C'est ajouté ! Souhaitez-vous autre chose ?" : "Entendu, je n'ajoute rien. Puis-je vous aider autrement ?";
  }
  return "Puis-je vous aider autrement ?";
}

/* ------------------------------ Journalisation --------------------------- */

/** Usage de l'IA (tokens, durée, outils) dans le journal d'audit du module A, pour suivre le coût (§12.1). */
async function journaliser(clientId: string | null, details: Record<string, unknown>) {
  await journaliserAudit({ utilisateurId: clientId, action: "IA_ASSISTANT", entite: "AssistantIA", entiteId: clientId ?? "visiteur", details });
}

/* -------------------------------- Entrée --------------------------------- */

/** Réponse en flux (protocole UI message stream) consommée par useChat. */
export function repondreAssistant(messages: MessageAssistant[], clientId: string | null) {
  const stream = iaDisponible() ? fluxIA(messages, clientId) : fluxLocal(messages, clientId);
  return createUIMessageStreamResponse({ stream });
}
