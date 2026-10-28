# Back-end (squelette 100 % Next.js)

Chaque fichier existe avec sa signature finale et ses types : il reste à **remplir le corps des fonctions**.

## Flux

Voir `docs/architecture.md`. Résumé : page → service → repository ; formulaire → Server Action → Zod → `requireRole` → service.

## Ajouter une Server Action

```ts
// src/server/modules/catalogue/actions.ts
"use server";
import { runAction } from "@/server/core/action";
import { monSchema } from "@/lib/validation/catalogue";

export async function monAction(input: unknown) {
  return runAction(monSchema, input, ["FOURNISSEUR"], async (data) => {
    // appeler un service ; revalidatePath(...) si besoin
    return { id: "…" };
  }, "Enregistré");
}
```

Côté client : `const { run, pending } = useAction(monAction); run(valeurs)` (toast automatique).

## Conventions d'erreurs et d'`ActionResult`

- `ActionResult<T>` = `{ ok: true, data, message? }` ou `{ ok: false, error: { code, message, details? } }` (`src/types/action-result.ts`).
- Codes : `VALIDATION` (détails = `z.flattenError`), `FORBIDDEN`, `NOT_FOUND`, `NOT_IMPLEMENTED`, `INTERNE`.
- Les services lèvent `ForbiddenError`, `NotFoundError`, `NonImplementeError` (`server/core/errors.ts`) ; `runAction` les convertit. Aucune exception ne traverse la frontière client / serveur.

## Ajouter un Route Handler

`src/app/api/<chemin>/route.ts` : vérifier la signature (webhook) ou `CRON_SECRET` (cron), valider avec Zod, déléguer à un service, répondre en JSON. Les stubs actuels répondent `501 { error: "NOT_IMPLEMENTED", module, description }`.

## Ajouter un repository Prisma

1. Créer `produit.repository.prisma.ts` qui implémente l'interface `ProduitRepository` et **convertit** les modèles Prisma vers les DTO de `src/types/domain.ts`.
2. Dans `repositories/index.ts`, remplacer `produitRepositoryMock` par `produitRepositoryPrisma`. Aucune page ni service ne change.

## Checklist de branchement (dans l'ordre)

1. **PostgreSQL + Prisma** — `npm i @prisma/client @prisma/adapter-pg`, `DATABASE_URL`, `npx prisma migrate dev`, seed depuis `src/mocks`, décommenter `server/core/db.ts`, repositories Prisma.
2. **Auth.js** — `api/auth/[...auth]`, remplacer `getSession()`, protection des zones dans `src/proxy.ts`, supprimer le DevViewSwitcher.
3. **R2** — `api/uploads` (URL signée), `integrations/stockage/r2.ts`, `ImageDropzone` réel.
4. **Meshy** — `integrations/meshy/client.ts`, `lancerGeneration3D`, `api/webhooks/meshy`, `api/cron/modeles-3d`, GLB via `ModelSource.kind = "glb"`.
5. **Konnect / Flouci** — `integrations/paiement`, `passerCommande`, `acheterCredits3D`, `api/webhooks/paiement`.
6. **Vercel AI SDK** — `npm i ai`, `integrations/ia/model.ts`, puis IA-A (`analyserDocuments`), IA-B (`api/ia/fiche-produit`), IA-C (`api/ia/assistant`).
