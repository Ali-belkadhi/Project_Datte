# Architecture

Une seule application **Next.js 16** : front (App Router, Server / Client Components) et back (Server Actions, Route Handlers, services, repositories, Prisma). Aucun autre serveur.

## Couches

```text
src/app/**/page.tsx          afficher, composer, appeler des services en lecture
src/app/api/**/route.ts      entrées externes : webhooks, cron, flux IA
src/server/modules/*/actions.ts      mutations : Zod → requireRole → service → ActionResult
src/server/modules/*/services        règles métier (prix au kg, scission par fournisseur, crédits 3D…)
src/server/modules/*/repositories    accès aux données derrière une interface (mock aujourd'hui, Prisma demain)
src/server/integrations              clients externes (stubs typés : Meshy, paiement, e-mail, SMS, R2, PDF, IA)
src/server/contracts                 SEULE porte d'entrée d'un module serveur vers un autre
```

## Flux de données

```text
LECTURE   Server Component (page) ──► service ──► repository ──► mocks (aujourd'hui) / Prisma (demain)
ÉCRITURE  Formulaire client ──► Server Action ──► Zod (lib/validation) ──► requireRole ──► service ──► repository
EXTERNE   Meshy / paiement / cron ──► Route Handler (app/api) ──► service ──► repository
IA        Composant client ──► Route Handler app/api/ia/* ou Server Action ──► integrations/ia ──► service
```

## Règles d'import

1. `app` → `features` → `components` → `lib` / `types`.
2. Un module de `features/` **n'importe jamais** un autre module de `features/`. Ce qui est partagé remonte dans `components/shared` (ex. `ProductCard`, `AddressCard`, `ShopHero`). Une page peut composer des features de plusieurs modules, y compris en passant un composant en *slot* (ex. le checkout reçoit `<AddressFormSheet />` du module A).
3. Un module de `server/modules/` **n'importe jamais** l'intérieur d'un autre : il passe par `server/contracts`.
4. Le code client n'importe jamais `src/server`, sauf les fichiers `"use server"` (`actions.ts`). Les types partagés vivent dans `src/types` (ex. `ActionResult`).
5. Seules les implémentations `*.repository.mock.ts` importent `src/mocks`.
6. Server Components par défaut ; `"use client"` le plus bas possible.
7. Toute la 3D se charge à la demande (`next/dynamic` + `ssr: false`, via `components/three/scenes/lazy.tsx` et `LazyScene`).

## Unités et nommage

- Montants en **millimes** (entier, 1 DT = 1000), poids en **grammes**, formatage uniquement via `lib/format.ts`.
- Routes et domaine en français ; composants React en anglais (PascalCase) ; fichiers en kebab-case.
- Chaque dossier de `features/<module>/` et `server/modules/<module>/` a un `index.ts` (export public) et un `README.md`.

## Session factice

`src/proxy.ts` (ex-middleware) pose l'en-tête `x-degla-zone` selon le chemin (`/vendeur`, `/admin`, sinon acheteur). `getSession()` renvoie l'utilisateur de démo de cette zone (Sarra Mejri, Hédi Ben Amor, Équipe DEGLA). Le cookie `degla-demo-view` posé par le DevViewSwitcher sert de repli.

## Cache et rendu

`cacheComponents` est **désactivé** dans `next.config.ts` : les pages lisent la session (en-têtes) et des données simulées avec latence, le rendu dynamique classique est plus simple. Pour l'activer plus tard : `cacheComponents: true` + `partialPrefetching: true`, envelopper les accès dynamiques dans `<Suspense>` et marquer les lectures cachées avec `"use cache"`.

## Mode sombre

Classe `.dark` sur `<html>`, posée avant le rendu par un script inline (`hooks/use-theme.ts`) ; sélecteur Système / Clair / Sombre dans le pied de page, le profil, les paramètres vendeur et la sidebar admin.
