# DEGLA

> Les plus belles dattes de Tunisie, directement des palmeraies.

**DEGLA** (de « Deglet Nour ») est une marketplace mobile-first de dattes tunisiennes et de produits dérivés (jus, confitures, pâte, rob, miel de datte, café de noyaux). Les vendeurs des oasis de Tozeur, Kébili et Gabès ouvrent une boutique, publient leurs produits avec une **vue 3D**, et les acheteurs commandent chez plusieurs vendeurs dans un même panier.

> ⚠️ **Template UI : aucune donnée réelle.** Pas de base de données, pas d'authentification, pas d'API externe. Toutes les données sont fictives mais passent par le vrai chemin back-end (page → service → repository mock).

## Auth (Module A core)
Setup:
1. Copy `.env.example` to `.env.local` and fill values.
2. Start MongoDB.
3. `npm run dev`.
4. `npm run seed` to create admin@degla.tn / Admin123!.
5. Run tests: `npx vitest run`.

## Captures

_Emplacement prévu : `docs/captures/` (accueil, fiche produit 3D, panier, tableau de bord vendeur — mobile 390 px et desktop 1440 px)._

## Installation

```bash
npm i
npm run dev        # http://localhost:3000
```

Aucune variable d'environnement n'est nécessaire. Voir `.env.example` pour les variables futures.

| Script | Rôle |
| --- | --- |
| `npm run dev` | Serveur de développement (Turbopack) |
| `npm run build` | Build de production (`NEXT_BUILD_CPUS=1 npm run build` sur une machine à faible mémoire) |
| `npm run start` | Serveur de production |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript (`tsc --noEmit`) |
| `npm run format` | Prettier + tri des classes Tailwind |

`MOCK_LATENCY=0 npm run dev` désactive la latence simulée (300 ms par défaut) des repositories mock.

## Stack

Next.js 16 (App Router, Server Actions, Route Handlers, `proxy.ts`) · React 19 · TypeScript strict · Tailwind CSS v4 · shadcn/ui (new-york) · motion · React Three Fiber + drei · Zod 4 · react-hook-form · zustand · Recharts · Prisma 7 (schéma seulement).

## Architecture en bref

```text
src/app         pages fines (Server Components) + app/api (Route Handlers)
src/features    composants métier par module (comptes · catalogue · commandes)
src/components  ui (shadcn) · brand · layout · shared · illustrations (SVG) · three (3D)
src/server      core (session, rbac, erreurs) · contracts · modules/<m>/{actions,services,repositories,ia} · integrations
src/mocks       données fictives — lues UNIQUEMENT par les repositories *.mock.ts
src/lib         validation Zod partagée, format, constantes
prisma/         schema.prisma (38 modèles) — jamais migré
```

Documentation détaillée : [`docs/architecture.md`](docs/architecture.md) · [`docs/backend.md`](docs/backend.md) · [`docs/modules.md`](docs/modules.md) · [`docs/design-system.md`](docs/design-system.md) · [`docs/3d.md`](docs/3d.md).

## Modules et responsables

| Module | Responsable | Périmètre |
| --- | --- | --- |
| **A — Comptes** | Baha Ayadi | Auth (UI), profil, adresses, notifications, messagerie, onboarding et boutique vendeur, admin fournisseurs / modération / paramètres, **IA-A** |
| **B — Catalogue** | Ali Belkathi | Accueil, catalogue, recherche, fiche produit, variétés, boutique publique, favoris, produits vendeur, studio 3D, crédits 3D, admin variétés, **3D**, **IA-B** |
| **C — Commandes** | Karim Ouertatani | Panier, checkout, confirmation, commandes, tableau de bord vendeur, avis, versements, litiges, **IA-C** |
| **Commun** | les trois | Design system, layouts, navigation, composants partagés, types |

## Routes

Le sélecteur flottant **« Démo »** (en bas à gauche) permet de passer d'une vue à l'autre.

- **Acheteur** : `/` · `/catalogue` · `/produit/[slug]` · `/varietes` · `/variete/[slug]` · `/boutique/[slug]` · `/recherche` · `/panier` · `/commande` · `/commande/confirmation` · `/assistant` · `/compte` (+ `commandes`, `commandes/[numero]`, `favoris`, `adresses`, `profil`, `notifications`, `messages`)
- **Authentification** : `/connexion` · `/inscription` · `/inscription/verification` · `/mot-de-passe`
- **Vendeur** : `/vendeur` · `onboarding` · `produits` · `produits/nouveau` · `produits/[id]` · `studio-3d` · `studio-3d/[id]` · `credits` · `commandes` · `commandes/[numero]` · `avis` · `versements` · `boutique` · `messages` · `parametres`
- **Admin** : `/admin` · `fournisseurs` · `fournisseurs/[id]` · `varietes` · `moderation` · `litiges` · `parametres`
- **Transverse** : `/design` (styleguide) · 404 · erreur
- **API** : `/api/health` (200) · `auth/[...auth]`, `uploads`, `webhooks/meshy`, `webhooks/paiement`, `cron/modeles-3d`, `cron/versements`, `ia/fiche-produit`, `ia/assistant` (501)

## Feuille de route

| Module | Prochaines étapes |
| --- | --- |
| Commun | PostgreSQL + Prisma (`prisma/README.md`), stockage R2 (`api/uploads`), Vercel AI SDK (`integrations/ia`) |
| A | Auth.js (remplacer `getSession()`), OTP SMS, e-mails Resend, IA-A réelle, protection des routes dans `proxy.ts` |
| B | Repositories Prisma, Meshy (GLB via `ModelSource.kind = "glb"`), webhook + cron 3D, IA-B en streaming |
| C | Panier serveur, Konnect / Flouci + webhook, factures PDF, cron des versements, IA-C avec outils |
