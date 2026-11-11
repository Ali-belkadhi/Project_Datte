**Module C — Commandes** · responsable : Karim Ouertatani · panier, checkout, paiement, commandes acheteur et vendeur, tableau de bord vendeur, avis, versements, litiges, codes promo, IA-C (assistant).

## État : fonctionnel (MongoDB + Stripe)

| Fichier | Rôle |
| --- | --- |
| `repositories/mongo.ts` | Collections MongoDB, index, amorçage des données de démo (une fois par base, `MONGODB_DEMO=false` pour désactiver) |
| `services/panier.ts` | Panier persistant (client) ou visiteur (cookie `degla-panier`), fusion à la connexion |
| `services/commandes.ts` | Création (prix recalculés, scission par fournisseur, commission, code promo, stock), machine à états des colis + historique, annulation, remboursements |
| `services/paiements.ts` | PaiementService générique : Stripe Checkout, confirmation idempotente, webhook, remboursements |
| `services/codes-promo.ts` | Validation et répartition des remises, administration |
| `services/factures.ts` | Facture PDF (pdf-lib) numérotée FAC-AAAA-NNNNNN |
| `services/avis.ts` | Avis sur achat livré (1 par ligne), réponse du vendeur |
| `services/litiges.ts` | Ouverture (colis expédié/livré), décision admin avec remboursement Stripe |
| `services/versements.ts` | Versements aux fournisseurs (cron) |
| `services/ventes.ts` | KPIs, séries, top produits, répartition par variété calculés depuis MongoDB |
| `services/assistant-ia.ts` | IA-C : `streamText` + outils typés, repli local automatique (sans clé, quota, panne), journal d'usage |

## Cycle de vie d'un colis (SousCommande)

```text
EN_ATTENTE → ACCEPTEE → EN_PREPARATION → EXPEDIEE → LIVREE
     ↘ REFUSEE (vendeur)     ↘ ANNULEE (client, avant expédition)
REFUSEE / ANNULEE / LIVREE → REMBOURSEE (remboursement total)
```

Toute transition passe par `transition()` (contrôle + écriture atomique + `HistoriqueStatut` + notification).

## IA-C — assistant d'achat

- Serveur : `POST /api/ia/assistant` → `streamText` + `tool()` (`rechercherProduits`, `infosVariete`, `suivreCommande`, `ajouterAuPanier` **sans execute**).
- Client : `useChat` (`features/commandes/assistant/use-assistant.ts`) ; la confirmation d'ajout passe par la Server Action puis `addToolOutput`.
- Modèles : `src/lib/ai.ts`, essayés dans l'ordre : Gemini (`GOOGLE_GENERATIVE_AI_API_KEY`, `AI_MODEL`), OpenRouter (`OPENROUTER_API_KEY`, `OPENROUTER_MODEL`, clé partagée avec IA-A / IA-B), Vercel AI Gateway.
- Un modèle qui échoue (quota gratuit Gemini de 5 requêtes/min, crédits, panne, silence > 10 s) passe la main au suivant ; en dernier recours, mode local (mêmes outils, mêmes cartes).
- Usage (fournisseur, modèle, tokens, durée, outils) journalisé dans le `JournalAudit` du module A (contrat `journaliser()`).

## Tests

`npm test` (Vitest) : panier et scission, pas de 0,5 kg, machine à états, codes promo, commission, 5 scénarios IA-C.

## Routes

- `POST /api/webhooks/paiement` — webhook Stripe signé (`STRIPE_SECRET_WEBHOOK`), idempotent
- `GET /api/cron/versements` — `Authorization: Bearer <CRON_SECRET>`
- `GET /api/factures/[numero]` — PDF (client propriétaire, vendeur concerné ou admin)

## Contrats fournis (`server/contracts/commandes.ts`)

`initierPaiement(montant, objet)` (B, crédits 3D ; callback `confirmerAchatCredits3D()` du contrat B à la confirmation) · `statutPaiement(reference)` (B) · `fusionnerPanierVisiteur(clientId)` (A, à la connexion).

Consommés : `getParametresPlateforme()` / `getFournisseur()` (A, taux de commission), `reserverStock` / `libererStock` / `majNoteProduit` / `confirmerAchatCredits3D` (B, encore des stubs).
